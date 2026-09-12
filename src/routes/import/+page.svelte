<script lang="ts">
	import { onMount } from 'svelte';
	import { getAccounts } from '$lib/data/accounts';
	import { getCategories } from '$lib/data/budgets';
	import { parseStatement, ParseError } from '$lib/import';
	import {
		needsReview,
		type AnalyzeResponse,
		type CommitRequest,
		type CommitResponse,
		type ReviewRow
	} from '$lib/import/review';
	import { formatCurrency } from '$lib/utils/currency';
	import { toast } from '$lib/stores/toast';
	import { dashboardRefresh } from '$lib/stores/refresh';
	import type { Database, ImportSource } from '$lib/types/database';
	import ImportDropzone from '$lib/components/import/ImportDropzone.svelte';
	import ImportReviewTable from '$lib/components/import/ImportReviewTable.svelte';

	type Account = Database['public']['Tables']['accounts']['Row'];
	type Category = Database['public']['Tables']['budget_categories']['Row'];
	type Group = { key: string; title: string; hint: string; indexes: number[]; collapsed: boolean };

	const LS_ACCOUNT_PREFIX = 'budget_planner_import_account_';
	const LS_POCKET_ACCOUNT = 'budget_planner_import_pocket_account';

	let accounts = $state<Account[]>([]);
	let categories = $state<Category[]>([]);
	let loading = $state(true);

	// File queue: each file goes through prepare → analyze → review → commit
	let queue = $state<File[]>([]);
	let current = $state<{
		file: File;
		source: ImportSource;
		accountIban: string | null;
		hasPocket: boolean;
	} | null>(null);
	let accountId = $state('');
	let pocketAccountId = $state('');
	let phase = $state<'idle' | 'prepare' | 'analyzing' | 'review' | 'committing'>('idle');

	let analysis = $state<AnalyzeResponse | null>(null);
	let rows = $state<ReviewRow[]>([]);
	let groups = $state<Group[]>([]);
	let results = $state<{ filename: string; result: CommitResponse }[]>([]);

	const categoryItems = $derived(
		categories.map((c) => ({ id: c.id, name: c.name, color: c.color }))
	);
	const checkingAccounts = $derived(
		accounts.filter((a) => a.account_type !== 'savings' && a.account_type !== 'investment')
	);
	const savingsAccounts = $derived(accounts.filter((a) => a.account_type === 'savings'));
	const selectedAccount = $derived(accounts.find((a) => a.id === accountId) ?? null);

	const missingCategory = $derived(
		rows.filter((r) => !r.isDuplicate && r.kind === 'expense' && !r.categoryId).length
	);
	const toValidate = $derived(rows.filter((r) => !r.isDuplicate).length);

	onMount(async () => {
		const [{ data: accts }, { data: cats }] = await Promise.all([getAccounts(), getCategories()]);
		accounts = accts ?? [];
		categories = cats ?? [];
		pocketAccountId = localStorage.getItem(LS_POCKET_ACCOUNT) ?? '';
		loading = false;
	});

	function handleFiles(files: File[]) {
		queue = [...queue, ...files];
		if (phase === 'idle') nextFile();
	}

	/** Parse the file locally to detect its bank and pre-select the matching account. */
	async function nextFile() {
		const file = queue[0];
		if (!file) {
			phase = 'idle';
			current = null;
			return;
		}
		queue = queue.slice(1);
		try {
			const parsed = parseStatement(await file.arrayBuffer());
			current = {
				file,
				source: parsed.source,
				accountIban: parsed.accountIban ?? null,
				hasPocket: parsed.pocketBalance !== undefined
			};
			accountId = guessAccount(parsed.source, parsed.accountIban);
			phase = 'prepare';
			// Nothing to ask: go straight to analysis
			if (accountId) analyze();
		} catch (e) {
			toast.error(
				e instanceof ParseError ? `${file.name} : ${e.message}` : `${file.name} : fichier illisible`
			);
			nextFile();
		}
	}

	function guessAccount(source: ImportSource, iban: string | undefined): string {
		const compact = (s: string | null) => (s ?? '').replace(/\s+/g, '').toUpperCase();
		if (iban) {
			const byIban = accounts.find((a) => compact(a.iban) === iban);
			if (byIban) return byIban.id;
		}
		const remembered = localStorage.getItem(LS_ACCOUNT_PREFIX + source);
		if (remembered && accounts.some((a) => a.id === remembered)) return remembered;
		if (source === 'revolut') {
			const byName = accounts.find((a) => a.name.toLowerCase().includes('revolut'));
			if (byName) return byName.id;
		}
		return '';
	}

	async function analyze() {
		if (!current || !accountId) return;
		phase = 'analyzing';
		localStorage.setItem(LS_ACCOUNT_PREFIX + current.source, accountId);

		const form = new FormData();
		form.append('file', current.file);
		form.append('account_id', accountId);

		try {
			const res = await fetch('/api/import/analyze', { method: 'POST', body: form });
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.message ?? `Erreur ${res.status}`);
			}
			analysis = (await res.json()) as AnalyzeResponse;
			rows = analysis.rows;
			groups = buildGroups(rows);
			phase = 'review';
			if (analysis.ai.error) toast.error(analysis.ai.error);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Erreur lors de l'analyse");
			phase = 'prepare';
		}
	}

	function buildGroups(list: ReviewRow[]): Group[] {
		const g: Record<string, number[]> = { review: [], proposed: [], transfers: [], duplicates: [] };
		list.forEach((r, i) => {
			if (r.isDuplicate) g.duplicates.push(i);
			else if (r.kind === 'transfer' || r.kind === 'ignored') g.transfers.push(i);
			else if (needsReview(r)) g.review.push(i);
			else g.proposed.push(i);
		});
		return [
			{
				key: 'review',
				title: 'À vérifier',
				hint: 'Choisis la catégorie ou le type',
				indexes: g.review,
				collapsed: false
			},
			{
				key: 'proposed',
				title: 'Proposées',
				hint: 'Règles apprises et suggestions sûres',
				indexes: g.proposed,
				collapsed: false
			},
			{
				key: 'transfers',
				title: 'Virements internes',
				hint: "N'entrent pas dans le budget",
				indexes: g.transfers,
				collapsed: true
			},
			{
				key: 'duplicates',
				title: 'Déjà importées',
				hint: 'Ignorées automatiquement',
				indexes: g.duplicates,
				collapsed: true
			}
		];
	}

	async function commit() {
		if (!analysis || !current) return;
		phase = 'committing';
		if (pocketAccountId) localStorage.setItem(LS_POCKET_ACCOUNT, pocketAccountId);
		else localStorage.removeItem(LS_POCKET_ACCOUNT);

		const body: CommitRequest = {
			source: analysis.source,
			filename: analysis.filename,
			accountId,
			accountIban: analysis.accountIban,
			balanceAfter: analysis.balanceAfter,
			pocketBalance: analysis.pocketBalance,
			pocketAccountId: current.hasPocket && pocketAccountId ? pocketAccountId : null,
			rows: $state.snapshot(rows)
		};

		try {
			const res = await fetch('/api/import/commit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.message ?? `Erreur ${res.status}`);
			}
			const result = (await res.json()) as CommitResponse;
			results = [...results, { filename: analysis.filename, result }];
			if (result.errors.length > 0) toast.error(`${result.errors.length} ligne(s) en erreur`);
			else toast.success(`${result.inserted.expenses} dépense(s) importée(s)`);
			dashboardRefresh.trigger();
			analysis = null;
			rows = [];
			nextFile();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Erreur lors de l'import");
			phase = 'review';
		}
	}

	function cancelCurrent() {
		analysis = null;
		rows = [];
		nextFile();
	}

	function sourceLabel(s: ImportSource) {
		return s === 'bnp' ? 'BNP Paribas Fortis' : 'Revolut';
	}
</script>

<svelte:head>
	<title>Importer | Budget Planner</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-6">
	<div class="flex items-end justify-between">
		<div>
			<h1 class="text-2xl font-semibold text-coffee-900">Importer un relevé</h1>
			<p class="text-sm text-stone-500 mt-1">
				Les lignes déjà importées sont ignorées, les virements entre tes comptes sont détectés, le
				reste est classé pour toi.
			</p>
		</div>
		{#if queue.length > 0}
			<span class="text-xs text-stone-500">{queue.length} fichier(s) en attente</span>
		{/if}
	</div>

	{#if loading}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg text-sage"></span>
		</div>
	{:else if accounts.length === 0}
		<div class="bg-cotton border border-sand rounded-2xl p-8 text-center">
			<p class="text-coffee-900 font-medium mb-2">Aucun compte</p>
			<p class="text-sm text-stone-500 mb-4">
				Crée d'abord tes comptes bancaires pour y rattacher les relevés.
			</p>
			<a
				href="/patrimoine"
				class="btn bg-sage hover:bg-sage-dark border-none text-white rounded-xl btn-sm"
				>Aller au patrimoine</a
			>
		</div>
	{:else}
		{#if phase === 'idle'}
			<ImportDropzone onFiles={handleFiles} />
		{/if}

		<!-- Account selection when we couldn't guess it -->
		{#if phase === 'prepare' && current}
			<div class="bg-cotton border border-sand rounded-2xl p-6 space-y-4">
				<div class="flex items-center gap-3">
					<span
						class="px-2 py-0.5 rounded-md bg-sage/10 text-sage text-xs font-semibold uppercase tracking-wide"
						>{sourceLabel(current.source)}</span
					>
					<span class="text-sm text-coffee-900 font-medium">{current.file.name}</span>
				</div>
				<div class="flex flex-wrap items-end gap-4">
					<div class="min-w-64">
						<label class="block text-sm text-stone-500 mb-1.5" for="account"
							>Ce relevé correspond au compte</label
						>
						<select
							id="account"
							class="w-full px-3 py-2 border border-sand rounded-xl bg-white text-coffee-900 text-sm outline-none focus:ring-2 focus:ring-sage/50"
							bind:value={accountId}
						>
							<option value="">Choisir…</option>
							{#each checkingAccounts as a (a.id)}
								<option value={a.id}>{a.name}</option>
							{/each}
						</select>
						{#if current.accountIban}
							<p class="text-xs text-stone-400 mt-1">
								IBAN du fichier : {current.accountIban} — il sera enregistré sur ce compte.
							</p>
						{/if}
					</div>
					<button
						class="btn bg-sage hover:bg-sage-dark border-none text-white rounded-xl"
						disabled={!accountId}
						onclick={analyze}>Analyser</button
					>
					<button class="btn btn-ghost rounded-xl text-stone-500" onclick={cancelCurrent}
						>Ignorer ce fichier</button
					>
				</div>
			</div>
		{/if}

		{#if phase === 'analyzing'}
			<div class="bg-cotton border border-sand rounded-2xl p-10 text-center">
				<span class="loading loading-spinner loading-lg text-sage"></span>
				<p class="text-sm text-stone-500 mt-4">
					Analyse de {current?.file.name}… dédoublonnage, règles, puis catégorisation IA
				</p>
			</div>
		{/if}

		{#if (phase === 'review' || phase === 'committing') && analysis && current}
			<!-- Summary bar -->
			<div
				class="bg-cotton border border-sand rounded-2xl p-4 flex flex-wrap items-center gap-x-6 gap-y-2"
			>
				<div class="flex items-center gap-3">
					<span
						class="px-2 py-0.5 rounded-md bg-sage/10 text-sage text-xs font-semibold uppercase tracking-wide"
						>{sourceLabel(analysis.source)}</span
					>
					<span class="text-sm font-medium text-coffee-900">{selectedAccount?.name}</span>
					<span class="text-xs text-stone-400 truncate max-w-56" title={analysis.filename}
						>{analysis.filename}</span
					>
				</div>
				<div class="flex items-center gap-4 text-sm ml-auto">
					<span class="text-coffee-900"><strong>{analysis.summary.new}</strong> nouvelles</span>
					<span class="text-stone-500">{analysis.summary.duplicates} déjà importées</span>
					<span class="text-stone-500">{analysis.summary.transfers} virements</span>
					{#if analysis.balanceAfter !== null}
						<span class="text-stone-500"
							>Solde : <strong class="text-coffee-900"
								>{formatCurrency(analysis.balanceAfter)}</strong
							></span
						>
					{/if}
				</div>
			</div>

			{#if analysis.suggestedAccountId}
				<div
					class="bg-amber/10 border border-amber/40 rounded-xl px-4 py-3 text-sm text-coffee-900 flex items-center justify-between gap-4"
				>
					<span
						>L'IBAN de ce fichier correspond à <strong
							>{accounts.find((a) => a.id === analysis?.suggestedAccountId)?.name}</strong
						>, pas à {selectedAccount?.name}.</span
					>
					<button
						class="btn btn-sm rounded-lg bg-amber text-white border-none"
						onclick={() => {
							accountId = analysis!.suggestedAccountId!;
							analyze();
						}}>Utiliser ce compte</button
					>
				</div>
			{/if}

			{#if analysis.ai.error}
				<div class="bg-oat border border-sand rounded-xl px-4 py-3 text-sm text-stone-600">
					IA indisponible ({analysis.ai.error}). Les lignes inconnues sont à classer à la main —
					l'app retiendra tes choix.
				</div>
			{/if}

			<ImportReviewTable bind:rows {groups} categories={categoryItems} />

			<!-- Footer actions -->
			<div
				class="sticky bottom-4 bg-cotton/95 backdrop-blur border border-sand rounded-2xl p-4 shadow-lg flex flex-wrap items-center gap-4"
			>
				{#if current.hasPocket && savingsAccounts.length > 0}
					<label class="flex items-center gap-2 text-sm text-stone-600">
						<span>Pocket Épargne Revolut ({formatCurrency(analysis.pocketBalance ?? 0)}) →</span>
						<select
							class="px-2 py-1.5 border border-sand rounded-lg bg-white text-sm"
							bind:value={pocketAccountId}
						>
							<option value="">ne pas mettre à jour</option>
							{#each savingsAccounts as a (a.id)}
								<option value={a.id}>{a.name}</option>
							{/each}
						</select>
					</label>
				{/if}
				<div class="ml-auto flex items-center gap-3">
					{#if missingCategory > 0}
						<span class="text-sm text-terracotta">{missingCategory} dépense(s) sans catégorie</span>
					{/if}
					<button
						class="btn btn-ghost rounded-xl text-stone-500"
						onclick={cancelCurrent}
						disabled={phase === 'committing'}>Annuler</button
					>
					<button
						class="btn bg-sage hover:bg-sage-dark border-none text-white rounded-xl px-6"
						disabled={phase === 'committing' || missingCategory > 0 || toValidate === 0}
						onclick={commit}
					>
						{#if phase === 'committing'}<span class="loading loading-spinner loading-sm"
							></span>{/if}
						Valider {toValidate} transaction{toValidate > 1 ? 's' : ''}
					</button>
				</div>
			</div>
		{/if}

		{#if results.length > 0 && phase === 'idle'}
			<div class="bg-cotton border border-sand rounded-2xl p-6 space-y-3">
				<h2 class="font-semibold text-coffee-900">Import terminé</h2>
				{#each results as r (r.filename)}
					<div
						class="flex items-center justify-between text-sm border-b border-sand/60 last:border-0 py-2"
					>
						<span class="text-stone-600 truncate max-w-72" title={r.filename}>{r.filename}</span>
						<span class="text-coffee-900">
							{r.result.inserted.expenses} dépenses · {r.result.inserted.incomes} revenus · {r
								.result.inserted.transfers} virements
							{#if r.result.rulesLearned > 0}· <span class="text-sage"
									>{r.result.rulesLearned} règle(s) apprise(s)</span
								>{/if}
							{#if r.result.errors.length > 0}· <span class="text-terracotta"
									>{r.result.errors.length} erreur(s)</span
								>{/if}
						</span>
					</div>
					{#each r.result.errors as err (err)}
						<p class="text-xs text-terracotta">{err}</p>
					{/each}
				{/each}
				<div class="flex gap-3 pt-2">
					<a
						href="/expenses"
						class="btn bg-sage hover:bg-sage-dark border-none text-white rounded-xl btn-sm"
						>Voir les transactions</a
					>
					<a href="/" class="btn btn-ghost rounded-xl btn-sm text-stone-500">Dashboard</a>
				</div>
			</div>
		{/if}
	{/if}
</div>

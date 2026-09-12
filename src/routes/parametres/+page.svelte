<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { getAccounts } from '$lib/data/accounts';
	import { getExpenses } from '$lib/data/expenses';
	import { getRules, deleteRule, type CategoryRuleWithCategory } from '$lib/data/rules';
	import { KIND_LABELS } from '$lib/import/review';
	import { toast } from '$lib/stores/toast';
	import type { User } from '@supabase/supabase-js';
	import type { Database } from '$lib/types/database';

	type Account = Database['public']['Tables']['accounts']['Row'];

	const LS_KEY = 'budget_planner_default_account';

	let { data } = $props();

	let user = $state<User | null>(null);
	let accounts = $state<Account[]>([]);
	let defaultAccountId = $state('');
	let loading = $state(true);
	let exporting = $state(false);
	let rules = $state<CategoryRuleWithCategory[]>([]);

	onMount(async () => {
		const [{ data: userData }, { data: accts }, { data: ruleList }] = await Promise.all([
			supabase.auth.getUser(),
			getAccounts(),
			getRules()
		]);
		user = userData.user;
		accounts = accts || [];
		rules = ruleList;

		// Load saved default account
		const saved = localStorage.getItem(LS_KEY);
		if (saved && accounts.some((a) => a.id === saved)) {
			defaultAccountId = saved;
		}

		loading = false;
	});

	function saveDefaultAccount() {
		if (defaultAccountId) {
			localStorage.setItem(LS_KEY, defaultAccountId);
		} else {
			localStorage.removeItem(LS_KEY);
		}
		toast.success('Compte par défaut enregistré');
	}

	async function handleDeleteRule(rule: CategoryRuleWithCategory) {
		const { error } = await deleteRule(rule.id);
		if (error) {
			toast.error('Erreur lors de la suppression');
			return;
		}
		rules = rules.filter((r) => r.id !== rule.id);
		toast.success('Règle supprimée');
	}

	function ruleLabel(rule: CategoryRuleWithCategory): string {
		if (rule.kind === 'expense' && rule.category) {
			return rule.share_divisor && rule.share_divisor > 1
				? `${rule.category.name} · ÷${rule.share_divisor}`
				: rule.category.name;
		}
		return KIND_LABELS[rule.kind];
	}

	function formatCreatedAt(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	async function exportCSV() {
		exporting = true;
		try {
			const { data: expenses, error } = await getExpenses();
			if (error) {
				toast.error("Erreur lors de l'export");
				return;
			}

			const header = 'Date,Description,Montant,Catégorie,Compte';
			const rows = expenses.map((e) => {
				const desc = (e.description || '').replace(/"/g, '""');
				const cat = e.category?.name || '';
				const acct = e.account?.name || '';
				return `${e.date},"${desc}",${e.amount},"${cat}","${acct}"`;
			});

			const csv = [header, ...rows].join('\n');
			const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			const today = new Date().toISOString().split('T')[0];
			a.href = url;
			a.download = `depenses_${today}.csv`;
			a.click();
			URL.revokeObjectURL(url);

			toast.success(`${expenses.length} transactions exportées`);
		} finally {
			exporting = false;
		}
	}
</script>

<svelte:head>
	<title>Paramètres | Budget Planner</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6">
	<h1 class="text-2xl font-semibold text-coffee-900">Paramètres</h1>

	{#if loading}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg text-sage"></span>
		</div>
	{:else}
		<!-- Section A: Profil utilisateur -->
		<div class="bg-white rounded-2xl border border-sand p-6">
			<h2 class="text-lg font-semibold text-coffee-900 mb-4">Profil</h2>
			{#if user}
				<div class="flex items-center gap-4">
					{#if user.user_metadata?.avatar_url}
						<img
							src={user.user_metadata.avatar_url}
							alt="Avatar"
							class="w-14 h-14 rounded-full border-2 border-sand"
							referrerpolicy="no-referrer"
						/>
					{:else}
						<div
							class="w-14 h-14 rounded-full bg-sage/20 flex items-center justify-center text-sage text-xl font-semibold"
						>
							{(user.user_metadata?.full_name || user.email || '?').charAt(0).toUpperCase()}
						</div>
					{/if}
					<div class="space-y-0.5">
						<p class="font-medium text-coffee-900">
							{user.user_metadata?.full_name || 'Utilisateur'}
						</p>
						<p class="text-sm text-stone-500">{user.email}</p>
						{#if user.created_at}
							<p class="text-xs text-stone-400">
								Membre depuis le {formatCreatedAt(user.created_at)}
							</p>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<!-- Section B: Compte par défaut -->
		<div class="bg-white rounded-2xl border border-sand p-6">
			<h2 class="text-lg font-semibold text-coffee-900 mb-1">Compte par défaut</h2>
			<p class="text-sm text-stone-500 mb-4">
				Sélectionné automatiquement lors de l'ajout d'une transaction.
			</p>
			{#if accounts.length > 0}
				<div class="flex items-end gap-3">
					<div class="flex-1 max-w-xs">
						<select
							bind:value={defaultAccountId}
							class="w-full px-4 py-3 border border-sand rounded-xl bg-cotton text-coffee-900 text-sm outline-none transition-all focus:ring-2 focus:ring-sage/50 focus:border-sage appearance-none cursor-pointer"
						>
							<option value="">Aucun (automatique)</option>
							{#each accounts as account}
								<option value={account.id}>{account.name}</option>
							{/each}
						</select>
					</div>
					<button
						onclick={saveDefaultAccount}
						class="px-5 py-3 bg-sage hover:bg-sage/90 text-white rounded-xl font-medium text-sm transition-colors"
					>
						Enregistrer
					</button>
				</div>
			{:else}
				<p class="text-sm text-stone-400">Aucun compte disponible.</p>
			{/if}
		</div>

		<!-- Section C: Import & catégorisation IA -->
		<div class="bg-white rounded-2xl border border-sand p-6">
			<div class="flex items-start justify-between gap-4 mb-1">
				<h2 class="text-lg font-semibold text-coffee-900">Import de relevés</h2>
				{#if data.aiConfigured}
					<span class="text-xs px-2 py-1 rounded-md bg-sage/10 text-sage font-medium">IA activée</span>
				{:else}
					<span class="text-xs px-2 py-1 rounded-md bg-amber/15 text-amber font-medium">IA non configurée</span>
				{/if}
			</div>
			<p class="text-sm text-stone-500 mb-4">
				{#if data.aiConfigured}
					Les lignes inconnues sont classées par Claude ; chaque correction devient une règle.
				{:else}
					Ajoute <code class="text-xs bg-oat px-1 py-0.5 rounded">ANTHROPIC_API_KEY</code> côté serveur pour classer automatiquement les lignes inconnues. Les règles apprises fonctionnent sans.
				{/if}
			</p>

			<h3 class="text-sm font-medium text-coffee-900 mb-2">Règles apprises · {rules.length}</h3>
			{#if rules.length === 0}
				<p class="text-sm text-stone-400">Aucune règle pour l'instant — elles se créent lors de la validation d'un import.</p>
			{:else}
				<div class="divide-y divide-sand/60 border border-sand rounded-xl overflow-hidden">
					{#each rules as rule (rule.id)}
						<div class="flex items-center gap-3 px-4 py-2.5 text-sm bg-cotton">
							<span class="text-[10px] uppercase tracking-wide text-stone-400 w-16 shrink-0">{rule.match_type}</span>
							<span class="font-mono text-xs text-coffee-900 truncate flex-1" title={rule.pattern}>{rule.pattern}</span>
							<span class="flex items-center gap-1.5 text-stone-600 shrink-0">
								{#if rule.category}
									<span class="w-2 h-2 rounded-full" style="background-color: {rule.category.color}"></span>
								{/if}
								{ruleLabel(rule)}
							</span>
							<span class="text-xs text-stone-400 w-12 text-right shrink-0">{rule.hits}×</span>
							<button
								type="button"
								class="text-stone-400 hover:text-terracotta transition-colors shrink-0"
								onclick={() => handleDeleteRule(rule)}
								aria-label="Supprimer la règle"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Section D: Exporter mes données -->
		<div class="bg-white rounded-2xl border border-sand p-6">
			<h2 class="text-lg font-semibold text-coffee-900 mb-1">Exporter mes données</h2>
			<p class="text-sm text-stone-500 mb-4">
				Téléchargez toutes vos transactions au format CSV.
			</p>
			<button
				onclick={exportCSV}
				disabled={exporting}
				class="px-5 py-3 bg-coffee-900 hover:bg-coffee-900/90 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
			>
				{#if exporting}
					<span class="loading loading-spinner loading-sm"></span>
				{/if}
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				Exporter en CSV
			</button>
		</div>
	{/if}
</div>

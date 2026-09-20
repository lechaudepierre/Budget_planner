<script lang="ts">
	import { tick, untrack } from 'svelte';
	import Icon from './Icon.svelte';
	import type { IconName } from './Icon.svelte';
	import { sheet, type SheetRequest } from '$lib/stores/sheet';
	import { toast } from '$lib/stores/toast';
	import { dashboardRefresh } from '$lib/stores/refresh';
	import { eur } from '$lib/utils/currency';
	import { signed } from '$lib/utils/tone';
	import { dayLabel, isoDaysAgo } from '$lib/utils/month';
	import type { MonthData } from '$lib/server/month';
	import * as api from '$lib/data/month';

	let { month }: { month: MonthData } = $props();

	// ---------- Local state of the open sheet ----------
	let req = $state<SheetRequest | null>(null);
	let visible = $state(false); // drives the slide animation
	let digits = $state('');
	let sub = $state<'add' | 'fix'>('add');
	let dateMode = $state<0 | 1 | 2 | 'other'>(0);
	let customDate = $state(isoDaysAgo(0));
	let note = $state('');
	let noteOpen = $state(false);
	let name = $state('');
	let nameOpen = $state(false);
	let busy = $state(false);
	let noteEl = $state<HTMLInputElement | null>(null);
	let nameEl = $state<HTMLInputElement | null>(null);

	const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'back'] as const;

	// ---------- Derived context ----------
	const envelope = $derived.by(() => {
		const r = req;
		return r?.mode === 'add' ? (month.envelopes.find((c) => c.id === r.envelopeId) ?? null) : null;
	});
	const expense = $derived.by(() => {
		const r = req;
		return r?.mode === 'edit' ? (month.expenses.find((e) => e.id === r.expenseId) ?? null) : null;
	});
	const valueTarget = $derived.by(() => {
		const r = req;
		if (r?.mode !== 'value') return null;
		if (r.kind === 'income')
			return {
				icon: 'wallet' as IconName,
				title: 'Salaire',
				sub: 'Revenu net du mois',
				value: month.income,
				deletable: false
			};
		if (r.kind === 'savings')
			return {
				icon: 'piggy' as IconName,
				title: 'Mis de côté',
				sub: 'Épargne du mois',
				value: month.savings.amount,
				deletable: false
			};
		if (r.kind === 'fixed') {
			const f = month.fixed.find((x) => x.id === r.id);
			return f
				? {
						icon: f.icon,
						title: f.name,
						sub: 'Coût fixe mensuel',
						value: f.amount,
						deletable: true
					}
				: null;
		}
		const c = month.envelopes.find((x) => x.id === r.id);
		return c
			? { icon: c.icon, title: c.name, sub: 'Enveloppe du mois', value: c.budget, deletable: true }
			: null;
	});

	const amount = $derived(digits ? parseFloat(digits.replace(',', '.')) || 0 : 0);
	const amountText = $derived.by(() => {
		if (!digits) return '0 €';
		const [int = '', dec] = digits.split(',');
		const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
		return grouped + (dec !== undefined ? ',' + dec : '') + ' €';
	});
	// Never date an expense before the period starts (fresh start on a future salary day)
	const date = $derived.by(() => {
		const d = dateMode === 'other' ? customDate : isoDaysAgo(dateMode);
		return d < month.period.startDate ? month.period.startDate : d;
	});
	const dateText = $derived(
		date !== isoDaysAgo(dateMode === 'other' ? 0 : dateMode)
			? dayLabel(date)
			: dateMode === 0
				? "Aujourd'hui"
				: dateMode === 1
					? 'Hier'
					: dayLabel(date)
	);

	const head = $derived.by((): { icon: IconName; title: string; sub: string; dashed?: boolean } => {
		if (req?.mode === 'add' && envelope)
			return {
				icon: envelope.icon,
				title: envelope.name,
				sub: `${eur(envelope.spent)} dépensés sur ${eur(envelope.budget)}`
			};
		if (req?.mode === 'edit' && expense)
			return { icon: expense.icon, title: expense.categoryName, sub: dayLabel(expense.date) };
		if (req?.mode === 'value' && valueTarget) return valueTarget;
		if (req?.mode === 'create')
			return req.type === 'fixed'
				? {
						icon: 'plus',
						title: 'Nouveau coût fixe',
						sub: 'Loyer, abonnement, assurance…',
						dashed: true
					}
				: {
						icon: 'plus',
						title: 'Nouvelle enveloppe',
						sub: 'Courses, sorties, loisirs…',
						dashed: true
					};
		return { icon: 'dots', title: '', sub: '' };
	});

	const hint = $derived.by((): { text: string; over: boolean } => {
		if (req?.mode === 'add' && envelope) {
			const left = envelope.budget - envelope.spent;
			if (sub === 'add') {
				const after = left - amount;
				return amount
					? { text: `Il restera ${signed(after, eur)}`, over: after < 0 }
					: { text: `Reste ${signed(left, eur)}`, over: false };
			}
			return digits
				? { text: `Actuellement ${eur(envelope.spent)} dépensés`, over: false }
				: { text: `Nouveau total dépensé pour ${envelope.name}`, over: false };
		}
		return { text: '', over: false };
	});

	const ctaLabel = $derived.by(() => {
		if (req?.mode === 'add') {
			if (sub === 'add') return amount ? `Ajouter ${eur(amount)}` : 'Ajouter';
			return digits ? `Fixer le total à ${eur(amount)}` : 'Fixer le total';
		}
		if (req?.mode === 'create') return 'Créer';
		return 'Enregistrer';
	});
	const ctaDisabled = $derived.by(() => {
		if (busy) return true;
		if (req?.mode === 'add') return sub === 'add' ? !amount : !digits;
		if (req?.mode === 'edit') return !amount;
		if (req?.mode === 'create') return !name.trim();
		return !digits;
	});

	const showSeg = $derived(req?.mode === 'add');
	const showChips = $derived((req?.mode === 'add' && sub === 'add') || req?.mode === 'edit');
	const showRename = $derived(req?.mode === 'value' && !!valueTarget?.deletable);
	const showName = $derived(req?.mode === 'create' || (showRename && nameOpen));

	// ---------- Open / close ----------
	$effect(() => {
		const r = $sheet;
		untrack(() => {
			if (r) open(r);
			else if (req) close();
		});
	});

	function open(r: SheetRequest) {
		req = r;
		digits = '';
		sub = 'add';
		dateMode = 0;
		customDate = isoDaysAgo(0);
		note = '';
		noteOpen = false;
		name = '';
		nameOpen = false;
		busy = false;

		if (r.mode === 'edit') {
			const e = month.expenses.find((x) => x.id === r.expenseId);
			if (e) {
				digits = String(e.amount).replace('.', ',');
				note = e.note ?? '';
				noteOpen = !!e.note;
				const off = Math.round((Date.parse(isoDaysAgo(0)) - Date.parse(e.date)) / 86_400_000);
				if (off === 0 || off === 1 || off === 2) dateMode = off as 0 | 1 | 2;
				else {
					dateMode = 'other';
					customDate = e.date;
				}
			}
		} else if (r.mode === 'value' && valueTarget) {
			digits = valueTarget.value ? String(valueTarget.value).replace('.', ',') : '';
			name = valueTarget.title;
		}

		requestAnimationFrame(() => {
			visible = true;
			if (r.mode === 'create') void tick().then(() => nameEl?.focus());
		});
	}

	function close() {
		visible = false;
		setTimeout(() => {
			req = null;
		}, 220);
	}

	function dismiss() {
		sheet.close();
	}

	// ---------- Numpad ----------
	function key(k: string) {
		if (k === 'back') digits = digits.slice(0, -1);
		else if (k === ',') {
			if (!digits.includes(',')) digits = (digits || '0') + ',';
		} else {
			const [int = '', dec] = digits.split(',');
			if (dec !== undefined) {
				if (dec.length < 2) digits += k;
			} else if (int === '0') digits = k;
			else if (int.length < 6) digits += k;
		}
	}

	function onKeydown(ev: KeyboardEvent) {
		if (!req) return;
		const target = ev.target as HTMLElement | null;
		if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
			if (ev.key === 'Enter') {
				ev.preventDefault();
				void submit();
			}
			return;
		}
		if (/^[0-9]$/.test(ev.key)) key(ev.key);
		else if (ev.key === ',' || ev.key === '.') key(',');
		else if (ev.key === 'Backspace') key('back');
		else if (ev.key === 'Enter') void submit();
		else if (ev.key === 'Escape') dismiss();
		else return;
		ev.preventDefault();
	}

	function cycleDate() {
		dateMode = dateMode === 0 ? 1 : dateMode === 1 ? 2 : dateMode === 2 ? 'other' : 0;
	}

	async function toggleNote() {
		noteOpen = !noteOpen;
		if (noteOpen) {
			await tick();
			noteEl?.focus();
		}
	}

	async function toggleName() {
		nameOpen = !nameOpen;
		if (nameOpen) {
			await tick();
			nameEl?.select();
		}
	}

	// ---------- Actions ----------
	async function run(work: () => Promise<api.Result>, message: string, withUndo = true) {
		busy = true;
		dismiss();
		const res = await work();
		if (res.error) {
			busy = false;
			toast.error(res.error);
			return;
		}
		await dashboardRefresh.trigger();
		busy = false;
		const undo = res.undo;
		toast.show(message, {
			undo:
				withUndo && undo
					? async () => {
							await undo();
							await dashboardRefresh.trigger();
						}
					: undefined
		});
	}

	async function submit() {
		if (ctaDisabled || !req) return;
		const trimmedNote = note.trim() || null;

		if (req.mode === 'add' && envelope) {
			const c = envelope;
			if (sub === 'add') {
				const value = amount;
				const d = date;
				await run(
					() =>
						api.addExpense(month, { categoryId: c.id, amount: value, date: d, note: trimmedNote }),
					`${c.name} · ${eur(value)} ajouté`
				);
			} else {
				const value = amount;
				await run(
					() => api.setEnvelopeTotal(month, c.id, value),
					`${c.name} · total fixé à ${eur(value)}`
				);
			}
			return;
		}

		if (req.mode === 'edit' && expense) {
			const id = expense.id;
			const value = amount;
			const d = date;
			await run(
				() => api.editExpense(month, id, { amount: value, date: d, note: trimmedNote }),
				'Modifié'
			);
			return;
		}

		if (req.mode === 'value') {
			const r = req;
			const value = amount;
			const newName = name.trim();
			await run(
				async () => {
					if (r.kind === 'income') return api.setIncome(month, value);
					if (r.kind === 'savings') return api.setSavings(month, value);
					const id = r.id as string;
					if (newName && newName !== valueTarget?.title) {
						const renamed = await api.renameCategory(id, newName);
						if (renamed.error) return renamed;
					}
					return api.setCategoryBudget(month, id, value);
				},
				'Enregistré',
				false
			);
			return;
		}

		if (req.mode === 'create') {
			const r = req;
			const value = amount;
			const newName = name.trim();
			await run(() => api.addCategory(month, r.type, newName, value), `${newName} créé`, false);
		}
	}

	async function remove() {
		if (!req || busy) return;
		if (req.mode === 'edit' && expense) {
			const id = expense.id;
			await run(() => api.removeExpense(month, id), 'Dépense supprimée');
			return;
		}
		if (req.mode === 'value' && req.id && valueTarget) {
			const id = req.id;
			const label = valueTarget.title;
			if (!confirm(`Supprimer « ${label} » et toutes ses dépenses ?`)) return;
			await run(() => api.removeCategory(id), `${label} supprimé`, false);
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if req}
	<button type="button" class="backdrop" class:in={visible} aria-label="Fermer" onclick={dismiss}
	></button>
	<div
		class="sheet"
		class:in={visible}
		role="dialog"
		aria-modal="true"
		aria-labelledby="sheet-title"
	>
		<div class="grab"></div>
		<div class="sheet-head">
			<div class="row-ico" class:dashed={head.dashed}><Icon name={head.icon} /></div>
			<div class="min-w-0">
				<div class="sheet-title" id="sheet-title">{head.title}</div>
				<div class="sheet-sub">{head.sub}</div>
			</div>
			<button type="button" class="close" onclick={dismiss} aria-label="Fermer">
				<Icon name="x" size={16} strokeWidth={2.2} />
			</button>
		</div>

		{#if showSeg}
			<div class="seg">
				<button
					type="button"
					aria-pressed={sub === 'add'}
					onclick={() => ((sub = 'add'), (digits = ''))}
				>
					Dépense
				</button>
				<button
					type="button"
					aria-pressed={sub === 'fix'}
					onclick={() => ((sub = 'fix'), (digits = ''))}
				>
					Corriger le total
				</button>
			</div>
		{/if}

		{#if showName}
			<div class="field-wrap">
				<input
					class="field"
					id="sheet-name"
					type="text"
					placeholder="Nom"
					bind:value={name}
					bind:this={nameEl}
					autocomplete="off"
					maxlength="60"
				/>
			</div>
		{/if}

		<div class="amount num" class:empty={!digits}>{amountText}</div>
		<div class="amount-hint" class:over={hint.over}>{hint.text}</div>

		{#if showChips}
			<div class="chips">
				<button type="button" class="chip" onclick={cycleDate}>
					<Icon name="calendar" size={14} strokeWidth={2} />
					<span>{dateText}</span>
				</button>
				<button type="button" class="chip" class:on={noteOpen} onclick={toggleNote}>
					<Icon name="pencil" size={14} strokeWidth={2} />
					<span>Note</span>
				</button>
			</div>
			{#if dateMode === 'other'}
				<div class="field-wrap">
					<input
						class="field num"
						id="sheet-date"
						type="date"
						bind:value={customDate}
						max={isoDaysAgo(0)}
					/>
				</div>
			{/if}
			{#if noteOpen}
				<div class="field-wrap">
					<input
						class="field"
						id="sheet-note"
						type="text"
						placeholder="Ex. Delhaize, cadeau, pharmacie…"
						bind:value={note}
						bind:this={noteEl}
						autocomplete="off"
						maxlength="200"
					/>
				</div>
			{/if}
		{:else if showRename}
			<div class="chips">
				<button type="button" class="chip" class:on={nameOpen} onclick={toggleName}>
					<Icon name="pencil" size={14} strokeWidth={2} />
					<span>Renommer</span>
				</button>
			</div>
		{/if}

		<div class="pad">
			{#each KEYS as k (k)}
				<button
					type="button"
					class="key"
					class:fn={k === ',' || k === 'back'}
					aria-label={k === 'back' ? 'Effacer' : undefined}
					onclick={() => key(k)}
				>
					{#if k === 'back'}
						<Icon name="backspace" size={24} />
					{:else}
						{k}
					{/if}
				</button>
			{/each}
		</div>

		<button type="button" class="cta" disabled={ctaDisabled} onclick={submit}>{ctaLabel}</button>
		{#if req.mode === 'edit'}
			<button type="button" class="danger" onclick={remove} disabled={busy}
				>Supprimer cette dépense</button
			>
		{:else if showRename}
			<button type="button" class="danger" onclick={remove} disabled={busy}>
				Supprimer {req.mode === 'value' && req.kind === 'fixed'
					? 'ce coût fixe'
					: 'cette enveloppe'}
			</button>
		{/if}
	</div>
{/if}

<style>
	.backdrop {
		position: absolute;
		inset: 0;
		z-index: 10;
		background: rgba(20, 17, 14, 0.35);
		opacity: 0;
		transition: opacity 0.2s;
		border-radius: 0;
	}
	.backdrop.in {
		opacity: 1;
	}
	.sheet {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 11;
		background: var(--sheet);
		border-radius: 28px 28px 0 0;
		padding: 10px 20px calc(16px + env(safe-area-inset-bottom, 0px));
		transform: translateY(100%);
		transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
		max-height: 92%;
		overflow-y: auto;
		scrollbar-width: none;
	}
	.sheet.in {
		transform: translateY(0);
	}
	.grab {
		width: 36px;
		height: 4px;
		border-radius: 2px;
		background: var(--line);
		margin: 0 auto 14px;
	}
	.sheet-head {
		display: grid;
		grid-template-columns: 40px 1fr auto;
		align-items: center;
		gap: 12px;
	}
	.sheet-head .row-ico.dashed {
		background: transparent;
		border: 1.5px dashed var(--faint);
		color: var(--muted);
	}
	.sheet-title {
		font-weight: 600;
		font-size: 16px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.sheet-sub {
		font-size: 12.5px;
		color: var(--muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.close {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--soft);
		display: grid;
		place-items: center;
		color: var(--muted);
	}

	.seg {
		display: grid;
		grid-template-columns: 1fr 1fr;
		background: var(--soft);
		border-radius: 12px;
		padding: 3px;
		margin-top: 16px;
	}
	.seg button {
		padding: 8px;
		border-radius: 9px;
		font-size: 13px;
		font-weight: 500;
		color: var(--muted);
	}
	.seg button[aria-pressed='true'] {
		background: var(--sheet);
		color: var(--ink);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
	}

	.amount {
		text-align: center;
		padding: 22px 0 6px;
		font-size: 48px;
		font-weight: 600;
		letter-spacing: -0.035em;
		line-height: 1;
		min-height: 70px;
	}
	.amount.empty {
		color: var(--faint);
	}
	.amount-hint {
		text-align: center;
		font-size: 13px;
		color: var(--muted);
		min-height: 18px;
	}
	.amount-hint.over {
		color: var(--over);
	}

	.chips {
		display: flex;
		gap: 8px;
		justify-content: center;
		margin: 14px 0 6px;
		flex-wrap: wrap;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 7px 12px;
		border-radius: 999px;
		background: var(--soft);
		font-size: 13px;
		font-weight: 500;
		color: var(--ink);
	}
	.chip :global(svg) {
		color: var(--muted);
	}
	.chip.on {
		background: var(--accent-soft);
		color: var(--accent);
	}
	.chip.on :global(svg) {
		color: var(--accent);
	}
	.field-wrap {
		margin: 10px 0 0;
	}
	.field {
		width: 100%;
		padding: 11px 14px;
		border-radius: 12px;
		border: 1px solid var(--line);
		background: var(--bg);
		font: inherit;
		color: var(--ink);
		color-scheme: inherit;
	}
	.field::placeholder {
		color: var(--faint);
	}

	.pad {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 4px;
		margin-top: 10px;
	}
	.key {
		height: 54px;
		border-radius: 14px;
		font-size: 24px;
		font-weight: 500;
		display: grid;
		place-items: center;
		transition: background 0.08s;
		-webkit-tap-highlight-color: transparent;
		user-select: none;
	}
	.key:active {
		background: var(--press);
	}
	.key.fn {
		font-size: 20px;
		color: var(--muted);
	}

	.cta {
		width: 100%;
		margin-top: 12px;
		padding: 16px;
		border-radius: 18px;
		background: var(--ink);
		color: var(--bg);
		font-weight: 600;
		font-size: 16px;
		transition: opacity 0.15s;
	}
	.cta:disabled {
		opacity: 0.3;
		cursor: default;
	}
	.danger {
		width: 100%;
		margin-top: 8px;
		padding: 12px;
		font-size: 14px;
		font-weight: 500;
		color: var(--over);
	}
</style>

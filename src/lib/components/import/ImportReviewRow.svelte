<script lang="ts">
	import InlineDropdown from '$lib/components/expense/inline-dropdown.svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import { KIND_LABELS, type ReviewRow } from '$lib/import/review';
	import type { TransactionKind } from '$lib/types/database';

	let {
		row = $bindable(),
		categories
	}: {
		row: ReviewRow;
		categories: { id: string; name: string; color: string }[];
	} = $props();

	const kinds: TransactionKind[] = ['expense', 'income', 'reimbursement', 'transfer', 'ignored'];
	const divisors = [2, 3, 4];

	const dateLabel = $derived(
		new Date(row.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
	);
	const myShare = $derived(
		row.shareDivisor && row.shareDivisor > 1 ? Math.abs(row.amount) / row.shareDivisor : null
	);
	const resolved = $derived(row.kind !== 'expense' || Boolean(row.categoryId));

	function setKind(kind: TransactionKind) {
		row.kind = kind;
		if (kind !== 'expense') {
			row.categoryId = null;
			row.shareDivisor = null;
		}
	}

	function toggleDivisor(d: number) {
		row.shareDivisor = row.shareDivisor === d ? null : d;
	}
</script>

<div
	class="grid grid-cols-[3.5rem_1fr_6.5rem_9rem_11rem_7rem_2.5rem] items-center gap-3 px-4 py-2.5 border-b border-sand/60 text-sm transition-colors
		{row.isDuplicate ? 'opacity-50' : ''}
		{row.status === 'pending' ? 'bg-amber/5' : ''}"
>
	<!-- Date -->
	<span class="text-stone-500 tabular-nums" title={row.date}>{dateLabel}</span>

	<!-- Merchant -->
	<div class="min-w-0">
		<div class="flex items-center gap-2 min-w-0">
			<span class="font-medium text-coffee-900 truncate min-w-0" title={row.rawDescription}>
				{row.merchant}
			</span>
			{#if row.status === 'pending'}
				<span
					class="shrink-0 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber/15 text-amber"
					>en attente</span
				>
			{/if}
		</div>
		{#if row.communication}
			<p class="text-xs text-stone-500 truncate" title={row.communication}>{row.communication}</p>
		{/if}
		{#if row.reason}
			<p class="text-[11px] {row.confidence === 'rule' ? 'text-sage' : 'text-stone-400'}">
				{row.reason}
			</p>
		{/if}
	</div>

	<!-- Amount -->
	<div class="text-right tabular-nums">
		{#if myShare !== null}
			<span class="block text-xs text-stone-400 line-through"
				>{formatCurrency(Math.abs(row.amount))}</span
			>
			<span class="font-semibold text-terracotta">-{formatCurrency(myShare)}</span>
		{:else}
			<span class="font-semibold {row.amount < 0 ? 'text-terracotta' : 'text-sage'}">
				{formatCurrency(row.amount, true)}
			</span>
		{/if}
	</div>

	<!-- Kind -->
	<select
		class="w-full px-2 py-1.5 border border-sand rounded-lg bg-white text-coffee-900 text-sm outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage cursor-pointer disabled:cursor-default"
		value={row.kind}
		disabled={row.isDuplicate}
		onchange={(e) => setKind((e.target as HTMLSelectElement).value as TransactionKind)}
	>
		{#each kinds as k (k)}
			<option value={k}>{KIND_LABELS[k]}</option>
		{/each}
	</select>

	<!-- Category -->
	<div class:invisible={row.kind !== 'expense'}>
		<InlineDropdown
			items={categories}
			selected={row.categoryId}
			placeholder="Catégorie…"
			error={row.kind === 'expense' && !row.categoryId}
			disabled={row.isDuplicate}
			onSelect={(item) => (row.categoryId = item.id)}
		/>
	</div>

	<!-- Share -->
	<div class="flex gap-1" class:invisible={row.kind !== 'expense'}>
		{#each divisors as d (d)}
			<button
				type="button"
				class="w-8 h-7 rounded-md text-xs font-medium border transition-colors
					{row.shareDivisor === d
					? 'bg-sage text-white border-sage'
					: 'bg-white text-stone-500 border-sand hover:border-sage hover:text-sage'}"
				disabled={row.isDuplicate}
				onclick={() => toggleDivisor(d)}
				title="Ma part = montant ÷ {d}"
			>
				÷{d}
			</button>
		{/each}
	</div>

	<!-- Learn -->
	<label class="flex justify-center" title="Retenir ce choix pour les prochains imports">
		<input
			type="checkbox"
			class="checkbox checkbox-xs border-sand checked:bg-sage checked:border-sage checked:text-white"
			bind:checked={row.learnRule}
			disabled={row.isDuplicate || !resolved}
		/>
	</label>
</div>

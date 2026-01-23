<script lang="ts">
	import type { ExpenseWithCategory } from '$lib/types/database';
	import { formatCurrency } from '$lib/utils/currency';

	let {
		expense,
		onclick
	}: {
		expense: ExpenseWithCategory;
		onclick: () => void;
	} = $props();

	// Format date in French format
	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(date);
	}
</script>

<button
	type="button"
	class="w-full bg-cotton border border-sand rounded-xl p-4 hover:shadow-md hover:border-sage/30 transition-all flex items-center justify-between text-left group"
	{onclick}
>
	<div class="flex items-center gap-3 min-w-0 flex-1">
		<!-- Category color indicator -->
		<div
			class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
			style="background-color: {expense.category?.color || '#9CA3AF'}15"
		>
			<div
				class="w-4 h-4 rounded-full"
				style="background-color: {expense.category?.color || '#9CA3AF'}"
			></div>
		</div>
		<div class="min-w-0">
			<p class="font-medium text-coffee-900 truncate group-hover:text-sage transition-colors">
				{expense.description || expense.category?.name || 'Sans catégorie'}
			</p>
			<p class="text-sm text-stone-500">{formatDate(expense.date)}</p>
		</div>
	</div>
	<div class="flex items-center gap-3 shrink-0 ml-4">
		<span
			class="px-2 py-1 rounded-lg text-xs font-medium hidden sm:inline-flex"
			style="background-color: {expense.category?.color || '#9CA3AF'}15; color: {expense.category?.color || '#6B7280'};"
		>
			{expense.category?.name || 'Aucune'}
		</span>
		<span class="font-semibold text-terracotta whitespace-nowrap">
			-{formatCurrency(expense.amount)}
		</span>
	</div>
</button>

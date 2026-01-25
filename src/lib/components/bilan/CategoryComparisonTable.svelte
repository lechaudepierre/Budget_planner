<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';
	import CategoryComparisonRow from './CategoryComparisonRow.svelte';
	import type { CategoryComparison, ComparisonTotals } from '$lib/data/analytics';

	let {
		categories,
		totals,
		onCategoryClick
	} = $props<{
		categories: CategoryComparison[];
		totals: ComparisonTotals;
		onCategoryClick: (categoryId: string) => void;
	}>();

	// Determine totals difference display
	let totalsDifferenceDisplay = $derived(() => {
		if (totals.totalDifference < 0) {
			return { icon: '✓', text: `-${formatCurrency(Math.abs(totals.totalDifference))}`, colorClass: 'text-sage' };
		} else if (totals.totalDifference > 0) {
			return { icon: '⚠', text: `+${formatCurrency(totals.totalDifference)}`, colorClass: 'text-amber-600' };
		} else {
			return { icon: '✓', text: 'Équilibré', colorClass: 'text-sage' };
		}
	});
</script>

<div class="bg-cotton rounded-2xl border border-sand overflow-hidden">
	<!-- Header -->
	<div class="px-4 py-3 border-b border-sand">
		<h2 class="text-sm font-medium text-stone-500 uppercase tracking-wider">
			Budget vs Réel par catégorie
		</h2>
	</div>

	<!-- Summary row -->
	<div class="flex items-center gap-4 px-4 py-3 bg-linen border-b border-sand">
		<div class="flex items-center gap-3 min-w-0 flex-1">
			<div class="w-3 h-3 rounded-full bg-coffee-900 flex-shrink-0"></div>
			<span class="text-sm font-bold text-coffee-900">Total</span>
		</div>

		<div class="w-24 text-right">
			<span class="text-sm font-medium text-stone-500">{formatCurrency(totals.totalBudget)}</span>
		</div>

		<div class="w-24 text-right">
			<span class="text-sm font-bold text-coffee-900">{formatCurrency(totals.totalSpent)}</span>
		</div>

		<!-- Empty space for progress bar column -->
		<div class="w-20 flex-shrink-0"></div>

		<div class="w-28 text-right flex-shrink-0">
			<span class="text-sm font-bold {totalsDifferenceDisplay().colorClass}">
				{totalsDifferenceDisplay().icon} {totalsDifferenceDisplay().text}
			</span>
		</div>
	</div>

	<!-- Column headers -->
	<div class="flex items-center gap-4 px-4 py-2 border-b border-sand/50 text-xs text-stone-400 uppercase tracking-wider">
		<div class="flex-1">Catégorie</div>
		<div class="w-24 text-right">Budget</div>
		<div class="w-24 text-right">Dépensé</div>
		<div class="w-20 text-center">%</div>
		<div class="w-28 text-right">Écart</div>
	</div>

	<!-- Category rows -->
	{#if categories.length === 0}
		<div class="px-4 py-8 text-center">
			<p class="text-stone-500">Aucune catégorie avec budget ou dépenses ce mois</p>
		</div>
	{:else}
		<div class="divide-y divide-sand/50">
			{#each categories as category (category.categoryId)}
				<CategoryComparisonRow
					categoryId={category.categoryId}
					name={category.name}
					color={category.color}
					budget={category.budget}
					spent={category.spent}
					difference={category.difference}
					percentage={category.percentage}
					onClick={onCategoryClick}
				/>
			{/each}
		</div>
	{/if}
</div>

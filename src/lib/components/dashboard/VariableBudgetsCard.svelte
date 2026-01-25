<script lang="ts">
	import CircularGauge from '$lib/components/gauges/CircularGauge.svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import type { CategoryWithSpending } from '$lib/types/database';

	let {
		categories = [],
		onCategoryClick
	}: {
		categories: CategoryWithSpending[];
		onCategoryClick?: (category: CategoryWithSpending) => void;
	} = $props();

	let categoriesWithPercentage = $derived(
		categories.map((cat) => ({
			...cat,
			percentage: cat.allocated_amount > 0 ? (cat.spent / cat.allocated_amount) * 100 : 0
		}))
	);

	let totalBudget = $derived(categories.reduce((sum, c) => sum + c.allocated_amount, 0));
	let totalSpent = $derived(categories.reduce((sum, c) => sum + c.spent, 0));
	let progressPercent = $derived(totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0);
</script>

<div class="bg-white rounded-xl p-5 shadow-sm h-full flex flex-col">
	<!-- Header -->
	<div class="flex items-center justify-between mb-4">
		<div class="flex items-center gap-2">
			<div class="w-8 h-8 bg-sage/10 rounded-lg flex items-center justify-center">
				<svg class="w-4 h-4 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
				</svg>
			</div>
			<h3 class="text-sm font-semibold text-coffee-900">Budgets variables</h3>
		</div>
		<a href="/budgets" class="text-sm text-sage hover:text-sage-dark font-medium">Gérer →</a>
	</div>

	{#if categories.length === 0}
		<!-- Empty state -->
		<div class="flex-1 flex flex-col items-center justify-center py-8">
			<div class="w-12 h-12 bg-oat rounded-full flex items-center justify-center mb-3">
				<svg class="w-6 h-6 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
				</svg>
			</div>
			<p class="text-stone-500 text-sm text-center mb-3">Aucun budget variable</p>
			<a href="/budgets" class="btn bg-sage hover:bg-sage-dark text-white border-none btn-sm">
				Configurer mon budget
			</a>
		</div>
	{:else}
		<!-- Circular gauges grid -->
		<div class="flex-1">
			<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
				{#each categoriesWithPercentage as category (category.id)}
					<CircularGauge
						percentage={category.percentage}
						label={category.name}
						spent={category.spent}
						budget={category.allocated_amount}
						size={100}
						onclick={() => onCategoryClick?.(category)}
					/>
				{/each}
			</div>
		</div>

		<!-- Summary -->
		<div class="mt-4 pt-3 border-t border-stone-100 flex items-center gap-3">
			<div class="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
				<div
					class="h-full rounded-full transition-all duration-500 ease-out bg-stone-400"
					style="width: {progressPercent}%"
				></div>
			</div>
			<span class="text-xs text-stone-500 whitespace-nowrap">
				{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)} dépensés
			</span>
		</div>
	{/if}
</div>

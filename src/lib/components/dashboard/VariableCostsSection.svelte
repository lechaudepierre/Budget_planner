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

	// Calculate remaining budget
	let totalBudget = $derived(categories.reduce((sum, c) => sum + c.allocated_amount, 0));
	let totalSpent = $derived(categories.reduce((sum, c) => sum + c.spent, 0));
	let remaining = $derived(totalBudget - totalSpent);

	// Calculate percentage for each category
	let categoriesWithPercentage = $derived(
		categories.map((cat) => ({
			...cat,
			percentage: cat.allocated_amount > 0 ? (cat.spent / cat.allocated_amount) * 100 : 0
		}))
	);
</script>

<div class="bg-white rounded-xl p-6 shadow-sm h-full flex flex-col">
	<!-- Header -->
	<div class="flex items-center justify-between mb-4">
		<div>
			<h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
	Coûts variables
			</h2>
			<p class="text-xs text-stone-500 mt-0.5">Budget ajustable</p>
		</div>
		<div class="text-right">
			<span
				class="text-lg font-bold"
				class:text-sage={remaining >= 0}
				class:text-terracotta={remaining < 0}
			>
				{formatCurrency(remaining)}
			</span>
			<span class="text-xs text-stone-500 block">restant</span>
		</div>
	</div>

	{#if categories.length === 0}
		<div class="text-center py-8 flex-1 flex flex-col justify-center">
			<div class="w-12 h-12 bg-oat rounded-full flex items-center justify-center mx-auto mb-3">
				<svg class="w-6 h-6 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
				</svg>
			</div>
			<p class="text-gray-500 mb-4">Aucune catégorie variable définie</p>
			<a href="/budgets" class="btn bg-sage hover:bg-sage-dark text-white border-none btn-sm mx-auto">
				Configurer mon budget
			</a>
		</div>
	{:else}
		<div class="flex-1">
			<div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
	{/if}
</div>

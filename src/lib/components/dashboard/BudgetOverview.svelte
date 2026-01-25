<script lang="ts">
	import CircularGauge from '$lib/components/gauges/CircularGauge.svelte';
	import FixedCostItem from './FixedCostItem.svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import type { CategoryWithSpending } from '$lib/types/database';

	let {
		categories = [],
		onCategoryClick
	}: {
		categories: CategoryWithSpending[];
		onCategoryClick?: (category: CategoryWithSpending) => void;
	} = $props();

	// Separate by type
	let fixedCategories = $derived(categories.filter((c) => c.type === 'fixed'));
	let variableCategories = $derived(categories.filter((c) => c.type === 'variable'));

	// Calculate percentages for variable categories
	let variableCategoriesWithPercentage = $derived(
		variableCategories.map((cat) => ({
			...cat,
			percentage: cat.allocated_amount > 0 ? (cat.spent / cat.allocated_amount) * 100 : 0
		}))
	);

	// Fixed costs totals
	let fixedTotalBudget = $derived(fixedCategories.reduce((sum, c) => sum + c.allocated_amount, 0));
	let fixedTotalSpent = $derived(fixedCategories.reduce((sum, c) => sum + c.spent, 0));
	let fixedProgressPercent = $derived(fixedTotalBudget > 0 ? Math.min((fixedTotalSpent / fixedTotalBudget) * 100, 100) : 0);

	// Variable costs totals
	let variableTotalBudget = $derived(variableCategories.reduce((sum, c) => sum + c.allocated_amount, 0));
	let variableTotalSpent = $derived(variableCategories.reduce((sum, c) => sum + c.spent, 0));
	let variableProgressPercent = $derived(variableTotalBudget > 0 ? Math.min((variableTotalSpent / variableTotalBudget) * 100, 100) : 0);
</script>

{#if categories.length === 0}
	<div class="bg-white rounded-xl p-6 shadow-sm h-full flex flex-col">
		<h2 class="text-lg font-semibold text-gray-800 mb-4">Budgets par catégorie</h2>
		<div class="text-center py-8 flex-1 flex flex-col justify-center">
			<div class="w-12 h-12 bg-oat rounded-full flex items-center justify-center mx-auto mb-3">
				<svg class="w-6 h-6 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
				</svg>
			</div>
			<p class="text-gray-500 mb-4">Aucun budget configuré</p>
			<a href="/budgets" class="btn bg-sage hover:bg-sage-dark text-white border-none btn-sm mx-auto">
				Configurer mon budget
			</a>
		</div>
	</div>
{:else}
	<div class="bg-white rounded-xl p-6 shadow-sm h-full flex flex-col">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold text-gray-800">Budgets par catégorie</h2>
			<a href="/budgets" class="text-sm text-sage hover:text-sage-dark font-medium"> Gérer → </a>
		</div>

		<div class="flex-1 space-y-4">
			<!-- Variable costs with circular gauges -->
			{#if variableCategories.length > 0}
				<div>
					<div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
						{#each variableCategoriesWithPercentage as category (category.id)}
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
					
					<!-- Summary bar for variable costs -->
					<div class="mt-4 flex items-center gap-3">
						<div class="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
							<div
								class="h-full rounded-full transition-all duration-500 ease-out bg-stone-400"
								style="width: {variableProgressPercent}%"
							></div>
						</div>
						<span class="text-xs text-stone-500 whitespace-nowrap">
							{formatCurrency(variableTotalSpent)} / {formatCurrency(variableTotalBudget)} dépensés
						</span>
					</div>
				</div>
			{/if}

			<!-- Fixed costs with progress bars -->
			{#if fixedCategories.length > 0}
				<div class="pt-4 border-t border-stone-200">
					<span class="text-xs font-semibold text-stone-500 uppercase tracking-wide">Coûts fixes</span>
					
					<div class="mt-3 space-y-3">
						{#each fixedCategories as category (category.id)}
							{@const percentage = category.allocated_amount > 0 ? Math.min((category.spent / category.allocated_amount) * 100, 100) : 0}
							{@const isPaid = category.spent >= category.allocated_amount && category.allocated_amount > 0}
							{@const isOverspent = category.spent > category.allocated_amount}
							<div class="bg-stone-50 rounded-lg p-3">
								<div class="flex items-center justify-between mb-2">
									<div class="flex items-center gap-2">
										<div class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: {category.color}"></div>
										<span class="text-sm font-medium text-coffee-900">{category.name}</span>
									</div>
									<div class="flex items-center gap-1.5">
										{#if isPaid}
											<svg class="w-4 h-4 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
												<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
											</svg>
										{/if}
										<span 
											class="text-sm"
											class:text-sage={isPaid}
											class:font-medium={isPaid}
											class:text-stone-600={!isPaid && !isOverspent}
											class:text-terracotta={isOverspent}
										>
											{formatCurrency(category.spent)} / {formatCurrency(category.allocated_amount)}
										</span>
									</div>
								</div>
								<!-- Progress bar -->
								<div class="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
									<div
										class="h-full rounded-full transition-all duration-500 ease-out"
										class:bg-sage={!isOverspent}
										class:bg-terracotta={isOverspent}
										style="width: {percentage}%"
									></div>
								</div>
							</div>
						{/each}
					</div>
					
					<!-- Summary footer - clearly different from budget items -->
					<div class="mt-4 flex items-center gap-3">
						<div class="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
							<div
								class="h-full rounded-full transition-all duration-500 ease-out bg-stone-400"
								style="width: {fixedProgressPercent}%"
							></div>
						</div>
						<span class="text-xs text-stone-500 whitespace-nowrap">
							{formatCurrency(fixedTotalSpent)} / {formatCurrency(fixedTotalBudget)} payés
						</span>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

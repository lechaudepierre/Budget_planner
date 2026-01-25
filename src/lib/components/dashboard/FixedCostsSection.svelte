<script lang="ts">
	import FixedCostItem from './FixedCostItem.svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import type { CategoryWithSpending } from '$lib/types/database';

	let { categories }: { categories: CategoryWithSpending[] } = $props();

	let totalBudget = $derived(categories.reduce((sum, c) => sum + c.allocated_amount, 0));
	let totalSpent = $derived(categories.reduce((sum, c) => sum + c.spent, 0));
	let progressPercent = $derived(totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0);
</script>

{#if categories.length > 0}
	<div class="bg-stone-50 rounded-xl p-5 shadow-sm border border-stone-200">
		<!-- Header -->
		<div class="flex items-center justify-between mb-4">
			<div>
				<h3 class="text-xs font-semibold text-stone-500 uppercase tracking-wide">
					Coûts fixes
				</h3>
			</div>
			<span class="text-sm font-semibold text-coffee-900">
				{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
			</span>
		</div>

		<!-- List of fixed costs -->
		<div class="space-y-1">
			{#each categories as category (category.id)}
				<FixedCostItem
					name={category.name}
					spent={category.spent}
					budget={category.allocated_amount}
					color={category.color}
				/>
			{/each}
		</div>

		<!-- Overall progress bar -->
		<div class="mt-4 pt-3 border-t border-stone-200">
			<div class="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
				<div
					class="h-full rounded-full transition-all duration-500 ease-out"
					class:bg-sage={progressPercent <= 100}
					class:bg-terracotta={progressPercent > 100}
					style="width: {progressPercent}%"
				></div>
			</div>
		</div>
	</div>
{/if}

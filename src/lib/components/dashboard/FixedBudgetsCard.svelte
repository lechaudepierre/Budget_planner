<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';
	import type { CategoryWithSpending } from '$lib/types/database';

	let { 
		categories = [],
		onCategoryClick
	}: { 
		categories: CategoryWithSpending[];
		onCategoryClick?: (category: CategoryWithSpending) => void;
	} = $props();

	let totalBudget = $derived(categories.reduce((sum, c) => sum + c.allocated_amount, 0));
	let totalSpent = $derived(categories.reduce((sum, c) => sum + c.spent, 0));
	let progressPercent = $derived(totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0);
</script>

<div class="bg-white rounded-xl p-5 shadow-sm h-full flex flex-col">
	<!-- Header -->
	<div class="flex items-center justify-between mb-4">
		<div class="flex items-center gap-2">
			<div class="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
				<svg class="w-4 h-4 text-stone-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
				</svg>
			</div>
			<h3 class="text-sm font-semibold text-coffee-900">Budgets fixes</h3>
		</div>
		<a href="/budgets" class="text-sm text-sage hover:text-sage-dark font-medium">Gérer →</a>
	</div>

	{#if categories.length === 0}
		<!-- Empty state -->
		<div class="flex-1 flex flex-col items-center justify-center py-4">
			<p class="text-stone-500 text-sm text-center mb-3">Aucun budget fixe</p>
			<a href="/budgets" class="text-sm text-sage hover:text-sage-dark font-medium">
				Ajouter un budget
			</a>
		</div>
	{:else}
		<!-- List of fixed budgets -->
		<div class="flex-1 space-y-2.5">
			{#each categories as category (category.id)}
				{@const percentage = category.allocated_amount > 0 ? Math.min((category.spent / category.allocated_amount) * 100, 100) : 0}
				{@const isPaid = category.spent >= category.allocated_amount && category.allocated_amount > 0}
				{@const isOverspent = category.spent > category.allocated_amount}
				
				<button
					type="button"
					class="w-full bg-stone-50 rounded-lg p-2.5 text-left hover:bg-stone-100 transition-colors"
					onclick={() => onCategoryClick?.(category)}
				>
					<div class="flex items-center justify-between mb-1.5">
						<div class="flex items-center gap-2">
							<div class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: {category.color}"></div>
							<span class="text-sm text-coffee-900">{category.name}</span>
						</div>
						<div class="flex items-center gap-1">
							{#if isPaid}
								<svg class="w-3.5 h-3.5 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
								</svg>
							{/if}
							<span 
								class="text-xs"
								class:text-sage={isPaid}
								class:text-stone-500={!isPaid && !isOverspent}
								class:text-terracotta={isOverspent}
							>
								{formatCurrency(category.spent)} / {formatCurrency(category.allocated_amount)}
							</span>
						</div>
					</div>
					<div class="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
						<div
							class="h-full rounded-full transition-all duration-500 ease-out"
							class:bg-sage={!isOverspent}
							class:bg-terracotta={isOverspent}
							style="width: {percentage}%"
						></div>
					</div>
				</button>
			{/each}
		</div>

		<!-- Summary -->
		<div class="mt-3 pt-3 border-t border-stone-100 flex items-center gap-3">
			<div class="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
				<div
					class="h-full rounded-full transition-all duration-500 ease-out bg-stone-400"
					style="width: {progressPercent}%"
				></div>
			</div>
			<span class="text-xs text-stone-500 whitespace-nowrap">
				{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)} payés
			</span>
		</div>
	{/if}
</div>

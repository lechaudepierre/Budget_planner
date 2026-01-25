<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';

	let { income, totalAllocated } = $props<{
		income: number;
		totalAllocated: number;
	}>();

	let savingsAvailable = $derived(income - totalAllocated);
	let isOverBudget = $derived(savingsAvailable < 0);
	let allocationPercent = $derived(income > 0 ? Math.round((totalAllocated / income) * 100) : 0);
	let savingsPercent = $derived(income > 0 ? Math.round((savingsAvailable / income) * 100) : 0);
</script>

<div class="bg-cotton border border-sand rounded-2xl p-6">
	<h3 class="text-lg font-semibold text-coffee-900 mb-4">Résumé</h3>

	<div class="space-y-4">
		<!-- Income -->
		<div class="flex justify-between items-center">
			<span class="text-stone-500">Revenus</span>
			<span class="font-medium text-coffee-900">{formatCurrency(income)}</span>
		</div>

		<!-- Budget Allocated -->
		<div class="flex justify-between items-center">
			<span class="text-stone-500">Dépenses ({allocationPercent}%)</span>
			<span class="font-medium text-coffee-900">{formatCurrency(totalAllocated)}</span>
		</div>

		<!-- Divider -->
		<div class="border-t border-sand"></div>

		<!-- Savings Available (auto-calculated) -->
		<div class="flex justify-between items-center">
			<span class="text-stone-500 flex items-center gap-1">
				<svg class="w-3.5 h-3.5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
				</svg>
				Épargne mensuelle ({savingsPercent}%)
			</span>
			<span
				class="text-xl font-bold"
				class:text-sage={!isOverBudget}
				class:text-terracotta={isOverBudget}
			>
				{formatCurrency(savingsAvailable)}
			</span>
		</div>

		{#if isOverBudget}
			<div class="flex items-center gap-2 p-3 bg-terracotta/10 rounded-lg">
				<svg class="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<span class="text-sm text-terracotta">Budget dépassé de {formatCurrency(Math.abs(savingsAvailable))}</span>
			</div>
		{:else if savingsAvailable > 0}
			<a
				href="/epargne"
				class="flex items-center justify-center gap-2 p-3 bg-sage/10 hover:bg-sage/20 rounded-lg transition-colors group"
			>
				<svg class="w-4 h-4 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
				<span class="text-sm text-sage font-medium group-hover:text-sage-dark">Répartir dans Épargne</span>
			</a>
		{/if}
	</div>
</div>

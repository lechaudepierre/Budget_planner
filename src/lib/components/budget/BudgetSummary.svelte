<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';

	let {
		income,
		totalAllocated,
		savingsAllocated = 0
	} = $props<{
		income: number;
		totalAllocated: number;
		savingsAllocated?: number;
	}>();

	let savingsAvailable = $derived(income - totalAllocated);
	let remainingToAllocate = $derived(income - (totalAllocated + savingsAllocated));
	let isOverBudget = $derived(savingsAvailable < 0 || remainingToAllocate < -0.01);
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

		<!-- Savings Allocated -->
		<div class="flex justify-between items-center">
			<span class="text-stone-500">Épargne répartie</span>
			<span class="font-medium text-sage">{formatCurrency(savingsAllocated)}</span>
		</div>

		<!-- Divider -->
		<div class="border-t border-sand"></div>

		<!-- Remaining to allocate -->
		<div class="flex justify-between items-center">
			<span class="text-sm font-medium text-coffee-900">Reste à répartir</span>
			<span
				class="text-lg font-bold"
				class:text-sage={Math.abs(remainingToAllocate) < 0.01}
				class:text-terracotta={Math.abs(remainingToAllocate) >= 0.01}
			>
				{formatCurrency(remainingToAllocate)}
			</span>
		</div>

		{#if remainingToAllocate > 0.01}
			<a
				href="/epargne"
				class="flex items-center justify-center gap-2 p-3 bg-sage/10 hover:bg-sage/20 rounded-lg transition-colors group"
			>
				<svg class="w-4 h-4 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 7l5 5m0 0l-5 5m5-5H6"
					/>
				</svg>
				<span class="text-sm text-sage font-medium group-hover:text-sage-dark"
					>Répartir dans Épargne</span
				>
			</a>
		{:else if isOverBudget && remainingToAllocate < -0.01}
			<div class="flex items-center gap-2 p-3 bg-terracotta/10 rounded-lg">
				<svg class="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<span class="text-sm text-terracotta"
					>Budget dépassé de {formatCurrency(Math.abs(remainingToAllocate))}</span
				>
			</div>
		{/if}
	</div>
</div>

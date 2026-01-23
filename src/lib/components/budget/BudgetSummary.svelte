<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';

	let { income, totalAllocated } = $props<{
		income: number;
		totalAllocated: number;
	}>();

	let remaining = $derived(income - totalAllocated);
	let isOverBudget = $derived(remaining < 0);
	let allocationPercent = $derived(income > 0 ? Math.round((totalAllocated / income) * 100) : 0);
</script>

<div class="bg-cotton border border-sand rounded-2xl p-6">
	<h3 class="text-lg font-semibold text-coffee-900 mb-4">Résumé</h3>

	<div class="space-y-4">
		<!-- Income -->
		<div class="flex justify-between items-center">
			<span class="text-stone-500">Revenus</span>
			<span class="font-medium text-coffee-900">{formatCurrency(income)}</span>
		</div>

		<!-- Allocated -->
		<div class="flex justify-between items-center">
			<span class="text-stone-500">Alloué ({allocationPercent}%)</span>
			<span class="font-medium text-coffee-900">{formatCurrency(totalAllocated)}</span>
		</div>

		<!-- Divider -->
		<div class="border-t border-sand"></div>

		<!-- Remaining -->
		<div class="flex justify-between items-center">
			<span class="text-stone-500">Restant</span>
			<span
				class="text-xl font-bold"
				class:text-sage={!isOverBudget}
				class:text-terracotta={isOverBudget}
			>
				{formatCurrency(remaining)}
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
				<span class="text-sm text-terracotta">Budget dépassé de {formatCurrency(Math.abs(remaining))}</span>
			</div>
		{/if}
	</div>
</div>

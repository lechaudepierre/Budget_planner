<script lang="ts">
	import { formatMonthDisplay } from '$lib/data/budgets';
	import { formatCurrency } from '$lib/utils/currency';
	import type { BudgetHistoryCategory } from '$lib/data/budgets';

	let { month, income, totalAllocated, categories } = $props<{
		month: string;
		income: number;
		totalAllocated: number;
		categories: BudgetHistoryCategory[];
	}>();

	let isExpanded = $state(false);

	// Derived calculations
	let allocationPercent = $derived(income > 0 ? Math.round((totalAllocated / income) * 100) : 0);

	let status = $derived<'over' | 'balanced' | 'under'>(
		allocationPercent > 100 ? 'over' : allocationPercent >= 90 ? 'balanced' : 'under'
	);

	let statusConfig = $derived({
		over: { icon: '⚠', color: 'text-terracotta', bgColor: 'bg-terracotta/10' },
		balanced: { icon: '✓', color: 'text-sage', bgColor: 'bg-sage/10' },
		under: { icon: '○', color: 'text-amber', bgColor: 'bg-amber/10' }
	}[status]);
</script>

<div class="bg-cotton/60 border border-sand/60 rounded-xl overflow-hidden">
	<!-- Header - always visible -->
	<button
		type="button"
		class="w-full p-4 text-left hover:bg-oat/30 transition-colors"
		onclick={() => (isExpanded = !isExpanded)}
	>
		<div class="flex items-center justify-between">
			<div class="flex-1">
				<div class="flex items-center gap-2 mb-1">
					<span class="font-medium text-coffee-900/80 capitalize">{formatMonthDisplay(month)}</span>
					<span class="badge badge-sm bg-oat text-stone-500 border-none text-xs">Archivé</span>
				</div>
				<div class="flex items-center gap-4 text-sm text-stone-500">
					<span>Revenus: {formatCurrency(income)}</span>
					<span>•</span>
					<span>Alloué: {allocationPercent}%</span>
				</div>
			</div>

			<div class="flex items-center gap-3">
				<!-- Status indicator -->
				<div class="w-8 h-8 rounded-full flex items-center justify-center {statusConfig.bgColor}">
					<span class="{statusConfig.color}">{statusConfig.icon}</span>
				</div>

				<!-- Expand/collapse icon -->
				<svg
					class="w-5 h-5 text-stone-400 transition-transform duration-200"
					class:rotate-180={isExpanded}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</div>
		</div>
	</button>

	<!-- Expanded content - category breakdown -->
	{#if isExpanded}
		<div class="px-4 pb-4 border-t border-sand/40">
			<div class="pt-3 space-y-2">
				{#if categories.length === 0}
					<p class="text-sm text-stone-400 italic">Aucune catégorie pour ce mois</p>
				{:else}
					{#each categories as cat (cat.name)}
						<div class="flex items-center justify-between py-1">
							<div class="flex items-center gap-2">
								<div
									class="w-3 h-3 rounded-full opacity-70"
									style="background-color: {cat.color}"
								></div>
								<span class="text-sm text-stone-600">{cat.name}</span>
							</div>
							<span class="text-sm text-stone-500">{formatCurrency(cat.amount)}</span>
						</div>
					{/each}

					<!-- Total -->
					<div class="flex items-center justify-between pt-2 mt-2 border-t border-sand/40">
						<span class="text-sm font-medium text-coffee-900/70">Total alloué</span>
						<span class="text-sm font-medium text-coffee-900/70">{formatCurrency(totalAllocated)}</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

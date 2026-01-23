<script lang="ts">
	import BudgetHistoryCard from './BudgetHistoryCard.svelte';
	import type { BudgetHistoryMonth } from '$lib/data/budgets';

	let { history, isLoading = false } = $props<{
		history: BudgetHistoryMonth[];
		isLoading?: boolean;
	}>();

	const INITIAL_DISPLAY = 6;
	let showAll = $state(false);

	let displayedHistory = $derived(showAll ? history : history.slice(0, INITIAL_DISPLAY));
	let hasMore = $derived(history.length > INITIAL_DISPLAY);
</script>

<div class="space-y-4">
	<!-- Section header with divider -->
	<div class="flex items-center gap-4">
		<div class="h-px flex-1 bg-sand"></div>
		<h2 class="text-sm font-medium text-stone-500 uppercase tracking-wider">Historique</h2>
		<div class="h-px flex-1 bg-sand"></div>
	</div>

	{#if isLoading}
		<div class="flex justify-center py-8">
			<span class="loading loading-spinner loading-md text-sage/50"></span>
		</div>
	{:else if history.length === 0}
		<!-- Empty state -->
		<div class="text-center py-8 bg-oat/30 rounded-xl border border-sand/50">
			<div class="w-12 h-12 bg-oat rounded-full flex items-center justify-center mx-auto mb-3">
				<svg class="w-6 h-6 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			</div>
			<p class="text-stone-500 text-sm">Aucun historique disponible</p>
			<p class="text-stone-400 text-xs mt-1">Votre historique apparaîtra le mois prochain</p>
		</div>
	{:else}
		<!-- History cards -->
		<div class="space-y-3">
			{#each displayedHistory as monthData (monthData.month)}
				<BudgetHistoryCard
					month={monthData.month}
					income={monthData.income}
					totalAllocated={monthData.totalAllocated}
					categories={monthData.categories}
				/>
			{/each}
		</div>

		<!-- Show more button -->
		{#if hasMore}
			<div class="text-center pt-2">
				<button
					type="button"
					class="text-sm text-sage hover:text-sage-dark transition-colors"
					onclick={() => (showAll = !showAll)}
				>
					{showAll ? 'Voir moins' : `Voir plus (${history.length - INITIAL_DISPLAY} mois)`}
				</button>
			</div>
		{/if}
	{/if}
</div>

<script lang="ts">
	import { formatMonthDisplay, getCurrentMonth } from '$lib/data/budgets';

	let {
		month,
		isCurrentMonth,
		isArchived,
		startDate,
		endDate,
		onPrevMonth,
		onNextMonth,
		onArchive
	} = $props<{
		month: string;
		isCurrentMonth: boolean;
		isArchived: boolean;
		startDate: string;
		endDate: string | null;
		onPrevMonth: () => void;
		onNextMonth: () => void;
		onArchive: () => void;
	}>();

	// Format month for display with capitalized first letter
	let displayMonth = $derived(
		formatMonthDisplay(month).charAt(0).toUpperCase() + formatMonthDisplay(month).slice(1)
	);

	// Determine badge text and style
	// Current month = "En cours", any past month = "Clôturé"
	let badgeText = $derived(isArchived ? 'Clôturé' : 'En cours');
	let badgeClass = $derived(isArchived ? 'bg-sage/10 text-sage' : 'bg-amber-100 text-amber-700');

	function formatDate(dateStr: string) {
		const date = new Date(dateStr);
		return date.toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex flex-col">
		<div class="flex items-center gap-4">
			<h1 class="text-2xl font-bold text-coffee-900">
				Bilan - {displayMonth}
			</h1>
			<span class="px-3 py-1 rounded-full text-xs font-medium {badgeClass}">
				{badgeText}
			</span>
		</div>
		<p class="text-sm text-stone-500 mt-1">
			{formatDate(startDate)} — {endDate ? formatDate(endDate) : 'en cours (jusqu’à clôture)'}
		</p>
	</div>

	<div class="flex items-center gap-4">
		{#if !isArchived}
			<button
				class="btn bg-terracotta hover:bg-terracotta-dark text-white border-none rounded-xl"
				onclick={onArchive}
			>
				Clôturer la période
			</button>
		{/if}

		<!-- Navigation Arrows -->
		<div class="flex items-center gap-1">
			<button
				type="button"
				onclick={onPrevMonth}
				class="p-2 rounded-lg hover:bg-oat transition-colors text-stone-500 hover:text-coffee-900"
				aria-label="Période précédente"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M15 18l-6-6 6-6" />
				</svg>
			</button>

			<button
				type="button"
				onclick={onNextMonth}
				class="p-2 rounded-lg hover:bg-oat transition-colors text-stone-500 hover:text-coffee-900"
				class:opacity-50={isCurrentMonth}
				class:cursor-not-allowed={isCurrentMonth}
				disabled={isCurrentMonth}
				aria-label="Période suivante"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M9 18l6-6-6-6" />
				</svg>
			</button>
		</div>
	</div>
</div>

<script lang="ts">
	import { formatMonthDisplay, getCurrentMonth } from '$lib/data/budgets';

	let {
		month,
		isCurrentMonth,
		onPrevMonth,
		onNextMonth
	} = $props<{
		month: string;
		isCurrentMonth: boolean;
		onPrevMonth: () => void;
		onNextMonth: () => void;
	}>();

	// Format month for display with capitalized first letter
	let displayMonth = $derived(() => {
		const formatted = formatMonthDisplay(month);
		return formatted.charAt(0).toUpperCase() + formatted.slice(1);
	});

	// Determine badge text and style
	// Current month = "En cours", any past month = "Clôturé"
	let badgeText = $derived(isCurrentMonth ? 'En cours' : 'Clôturé');
	let badgeClass = $derived(
		isCurrentMonth
			? 'bg-amber-100 text-amber-700'
			: 'bg-sage/10 text-sage'
	);
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl font-bold text-coffee-900">
			Bilan - {displayMonth()}
		</h1>
		<span class="px-3 py-1 rounded-full text-xs font-medium {badgeClass}">
			{badgeText}
		</span>
	</div>

	<!-- Month Navigation -->
	<div class="flex items-center gap-2">
		<button
			type="button"
			onclick={onPrevMonth}
			class="p-2 rounded-lg hover:bg-oat transition-colors text-stone-500 hover:text-coffee-900"
			aria-label="Mois précédent"
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
			aria-label="Mois suivant"
		>
			<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M9 18l6-6-6-6" />
			</svg>
		</button>
	</div>
</div>

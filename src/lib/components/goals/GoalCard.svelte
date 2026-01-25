<script lang="ts">
	import type { SavingsGoal } from '$lib/types/database';
	import { formatCurrency } from '$lib/utils/currency';
	import { calculateProgress, calculateMonthlyNeeded, calculateMonthsRemaining } from '$lib/schemas/goal';

	interface Props {
		goal: SavingsGoal;
		onclick?: () => void;
	}

	let { goal, onclick }: Props = $props();

	let progress = $derived(calculateProgress(goal.current_amount, goal.target_amount));
	let monthlyNeeded = $derived(calculateMonthlyNeeded(goal.current_amount, goal.target_amount, goal.target_date));
	let monthsRemaining = $derived(calculateMonthsRemaining(goal.target_date));

	// Determine progress color
	let progressColor = $derived(() => {
		if (progress >= 100) return 'bg-sage';
		if (progress >= 75) return 'bg-sage';
		if (progress >= 50) return 'bg-amber-400';
		return 'bg-sage/60';
	});
</script>

<button
	type="button"
	class="w-full bg-white border border-sand rounded-xl p-5 text-left hover:shadow-md hover:scale-[1.01] transition-all duration-200"
	{onclick}
>
	<div class="flex items-start justify-between mb-3">
		<div class="flex-1">
			<h3 class="font-semibold text-coffee-900 text-lg">{goal.name}</h3>
			{#if goal.target_date}
				<p class="text-sm text-stone-500 mt-0.5">
					{#if monthsRemaining !== null && monthsRemaining > 0}
						Objectif dans {monthsRemaining} mois
					{:else if monthsRemaining !== null && monthsRemaining <= 0}
						Date cible passée
					{/if}
				</p>
			{/if}
		</div>
		<div class="text-right">
			<p class="text-2xl font-bold text-sage">{progress}%</p>
		</div>
	</div>

	<!-- Progress bar -->
	<div class="mb-3">
		<div class="w-full bg-sand rounded-full h-3">
			<div
				class="h-3 rounded-full transition-all duration-500 {progressColor()}"
				style="width: {Math.min(progress, 100)}%"
			></div>
		</div>
	</div>

	<!-- Amounts -->
	<div class="flex justify-between items-center text-sm">
		<span class="text-stone-600">
			<span class="font-semibold text-coffee-900">{formatCurrency(goal.current_amount)}</span>
			sur {formatCurrency(goal.target_amount)}
		</span>
		<span class="text-stone-500">
			Reste: <span class="font-medium text-coffee-900">{formatCurrency(goal.target_amount - goal.current_amount)}</span>
		</span>
	</div>

	<!-- Monthly projection if target date is set -->
	{#if monthlyNeeded !== null && monthlyNeeded > 0}
		<div class="mt-3 pt-3 border-t border-sand">
			<p class="text-sm text-stone-500">
				<span class="font-medium text-coffee-900">{formatCurrency(monthlyNeeded)}</span>/mois pour atteindre l'objectif
			</p>
		</div>
	{:else if progress >= 100}
		<div class="mt-3 pt-3 border-t border-sand">
			<p class="text-sm text-sage font-medium flex items-center gap-1">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
				Objectif atteint !
			</p>
		</div>
	{/if}
</button>

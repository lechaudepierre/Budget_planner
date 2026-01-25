<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';
	import type { SavingsGoalProgress } from '$lib/data/analytics';

	let { goal }: { goal: SavingsGoalProgress } = $props();
</script>

<div class="py-3">
	<div class="flex items-start justify-between gap-3">
		<!-- Goal info -->
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 mb-1">
				<span class="font-medium text-coffee-900 truncate">{goal.name}</span>
			</div>
			<div class="text-sm">
				{#if goal.allocatedThisMonth > 0}
					<span class="text-sage font-medium"
						>+{formatCurrency(goal.allocatedThisMonth)} ce mois</span
					>
				{:else}
					<span class="text-stone-500">Aucune allocation</span>
				{/if}
			</div>
		</div>

		<!-- Progress percentage -->
		<div class="text-right shrink-0">
			<span class="text-lg font-semibold text-coffee-900">{Math.round(goal.progressPercent)}%</span>
			<div class="text-xs text-stone-400">sur {formatCurrency(goal.targetAmount)}</div>
		</div>
	</div>

	<!-- Progress bar - shows full progress including this month's allocation -->
	<div class="mt-2 relative h-2 bg-sand rounded-full overflow-hidden">
		<div
			class="absolute h-full bg-sage rounded-full transition-all"
			style="width: {Math.min(goal.progressPercent, 100)}%"
		></div>
	</div>
</div>

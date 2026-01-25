<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';

	let {
		name,
		spent,
		budget,
		color
	}: {
		name: string;
		spent: number;
		budget: number;
		color: string;
	} = $props();

	let isPaid = $derived(spent >= budget && budget > 0);
	let isOverspent = $derived(spent > budget && budget > 0);
	let percentage = $derived(budget > 0 ? Math.min((spent / budget) * 100, 100) : 0);
</script>

<div class="flex items-center gap-3 py-2.5">
	<!-- Color dot -->
	<div class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: {color}"></div>

	<!-- Name and progress bar -->
	<div class="flex-1 min-w-0">
		<span class="text-sm text-coffee-900 truncate block">{name}</span>
		<!-- Progress bar always visible -->
		<div class="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden mt-1.5">
			<div
				class="h-full rounded-full transition-all duration-500 ease-out"
				class:bg-sage={!isOverspent}
				class:bg-terracotta={isOverspent}
				style="width: {percentage}%"
			></div>
		</div>
	</div>

	<!-- Amount with status -->
	<div class="flex items-center gap-1.5 flex-shrink-0">
		{#if isPaid}
			<svg class="w-4 h-4 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
			</svg>
		{/if}
		<span
			class="text-sm font-medium tabular-nums"
			class:text-sage={isPaid}
			class:text-coffee-900={!isPaid && !isOverspent}
			class:text-terracotta={isOverspent}
		>
			{formatCurrency(spent)}
		</span>
	</div>
</div>

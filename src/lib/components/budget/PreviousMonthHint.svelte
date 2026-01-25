<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';

	let {
		budget,
		spent,
		difference
	}: {
		budget: number;
		spent: number;
		difference: number;
	} = $props();
</script>

<div class="text-xs mt-1 flex items-center gap-1">
	<span class="text-stone-400">Mois dernier:</span>
	<span class="text-stone-500">{formatCurrency(spent)}/{formatCurrency(budget)}</span>
	{#if difference < 0}
		<span class="text-sage">✓ {formatCurrency(Math.abs(difference))}</span>
	{:else if difference > 0}
		<span class="text-amber-600">⚠ +{formatCurrency(difference)}</span>
	{:else}
		<span class="text-sage">✓ Pile poil</span>
	{/if}
</div>

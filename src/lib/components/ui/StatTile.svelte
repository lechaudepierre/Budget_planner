<script lang="ts">
	import AnimatedNumber from './AnimatedNumber.svelte';

	let {
		label,
		value,
		hint,
		tone = 'coffee',
		href
	}: {
		label: string;
		value: number;
		hint?: string;
		tone?: 'coffee' | 'sage' | 'terracotta' | 'amber';
		href?: string;
	} = $props();

	const color: Record<string, string> = {
		coffee: 'text-coffee-900',
		sage: 'text-sage',
		terracotta: 'text-terracotta',
		amber: 'text-amber'
	};
</script>

<svelte:element this={href ? 'a' : 'div'} {href} class="card {href ? 'card-hover' : ''} py-4 block">
	<p class="card-title">{label}</p>
	<p class="mt-1 text-xl font-semibold {color[tone]}"><AnimatedNumber {value} /></p>
	{#if hint}<p class="text-xs text-stone-400 mt-0.5 truncate">{hint}</p>{/if}
</svelte:element>

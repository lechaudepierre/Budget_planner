<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	let {
		value,
		max,
		tone = 'auto',
		height = 'h-2',
		class: klass = ''
	}: {
		value: number;
		max: number;
		/** auto = sage <75 %, amber 75–100 %, terracotta >100 % */
		tone?: 'auto' | 'sage' | 'amber' | 'terracotta' | 'coffee';
		height?: string;
		class?: string;
	} = $props();

	const ratio = $derived(max > 0 ? value / max : value > 0 ? 1.01 : 0);
	const percent = $derived(Math.min(ratio * 100, 100));
	const resolvedTone = $derived(
		tone !== 'auto' ? tone : ratio > 1 ? 'terracotta' : ratio >= 0.75 ? 'amber' : 'sage'
	);

	const width = new Tween(0, { duration: 500, easing: cubicOut });
	$effect(() => {
		width.set(percent);
	});

	const fill: Record<string, string> = {
		sage: 'bg-sage',
		amber: 'bg-amber',
		terracotta: 'bg-terracotta',
		coffee: 'bg-coffee-900'
	};
</script>

<div
	class="w-full rounded-full bg-sand/70 overflow-hidden {height} {klass}"
	role="progressbar"
	aria-valuenow={Math.round(ratio * 100)}
	aria-valuemin="0"
	aria-valuemax="100"
>
	<div class="{height} rounded-full {fill[resolvedTone]}" style="width: {width.current}%"></div>
</div>

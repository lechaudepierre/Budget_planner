<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { formatCurrency } from '$lib/utils/currency';

	let {
		value,
		showSign = false,
		class: klass = ''
	}: { value: number; showSign?: boolean; class?: string } = $props();

	// Start from the initial value on purpose: later changes are animated by the effect below
	// svelte-ignore state_referenced_locally
	const tween = new Tween(value, { duration: 450, easing: cubicOut });
	$effect(() => {
		tween.set(value);
	});
</script>

<span class="num {klass}">{formatCurrency(tween.current, showSign)}</span>

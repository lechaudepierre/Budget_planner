<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { eur } from '$lib/utils/currency';
	import { signed } from '$lib/utils/tone';

	let { value, class: klass = '' }: { value: number; class?: string } = $props();

	// Start from the initial value on purpose: later changes are animated by the effect below
	// svelte-ignore state_referenced_locally
	const tween = new Tween(value, { duration: 500, easing: cubicOut });
	$effect(() => {
		tween.set(value);
	});
</script>

<span class="num {klass}">{signed(tween.current, eur)}</span>

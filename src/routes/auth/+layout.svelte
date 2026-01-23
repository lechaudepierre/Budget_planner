<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="min-h-screen bg-linen flex items-center justify-center p-4">
	{@render children()}
</div>

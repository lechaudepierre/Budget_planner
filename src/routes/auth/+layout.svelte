<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="shell">
	<div class="device auth">
		{@render children()}
	</div>
</div>

<style>
	.auth {
		align-items: center;
		justify-content: center;
		padding: 0 28px;
	}
</style>

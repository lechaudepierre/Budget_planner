<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import TabBar from '$lib/components/ui/TabBar.svelte';
	import AmountSheet from '$lib/components/ui/AmountSheet.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';

	let { data, children } = $props();

	// Auth pages have no chrome
	const isAuthRoute = $derived(page.url.pathname.startsWith('/auth'));
</script>

{#if isAuthRoute}
	{@render children()}
{:else}
	<div class="shell">
		<div class="device">
			{@render children()}
			<TabBar />
			{#if data.month}
				<AmountSheet month={data.month} />
			{/if}
			<Toast />
		</div>
	</div>
{/if}

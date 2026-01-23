<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import Navbar from '$lib/components/ui/Navbar.svelte';
	import Header from '$lib/components/ui/Header.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';

	let { children } = $props();

	// Check if current route requires the authenticated layout
	const isAuthRoute = $derived($page.url.pathname.startsWith('/auth'));
</script>

{#if isAuthRoute}
	<!-- Auth pages (login, callback) - no sidebar -->
	{@render children()}
{:else}
	<!-- Authenticated layout with sidebar -->
	<div class="flex min-h-screen bg-linen">
		<Navbar />
		<div class="flex-1 ml-60 flex flex-col">
			<Header />
			<main class="flex-1 p-6 overflow-y-auto">
				{#key $page.url.pathname}
					<div in:fade={{ duration: 200 }}>
						{@render children()}
					</div>
				{/key}
			</main>
		</div>
	</div>
{/if}

<!-- Toast notifications (always visible) -->
<Toast />

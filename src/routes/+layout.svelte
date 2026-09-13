<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import Navbar from '$lib/components/ui/Navbar.svelte';
	import BottomNav from '$lib/components/ui/BottomNav.svelte';
	import Header from '$lib/components/ui/Header.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';

	let { children } = $props();

	// Auth pages have no chrome
	const isAuthRoute = $derived($page.url.pathname.startsWith('/auth'));
</script>

{#if isAuthRoute}
	{@render children()}
{:else}
	<div class="min-h-screen bg-linen">
		<Navbar />
		<div class="lg:pl-56 flex flex-col min-h-screen">
			<Header />
			<main class="flex-1 px-4 lg:px-8 py-5 lg:py-7 pb-24 lg:pb-8">
				{#key $page.url.pathname}
					<div in:fade={{ duration: 150 }}>
						{@render children()}
					</div>
				{/key}
			</main>
		</div>
		<BottomNav />
	</div>
{/if}

<Toast />

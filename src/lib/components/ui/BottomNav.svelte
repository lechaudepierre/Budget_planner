<script lang="ts">
	import { page } from '$app/stores';
	import Icon from './Icon.svelte';
	import { BOTTOM_ITEMS, NAV_ITEMS, SECONDARY_ITEMS, isActive } from '$lib/config/nav';

	let moreOpen = $state(false);

	const moreItems = [
		...NAV_ITEMS.filter((i) => !BOTTOM_ITEMS.includes(i)),
		...SECONDARY_ITEMS.filter((i) => i.href !== '/import')
	];
	const moreActive = $derived(moreItems.some((i) => isActive(i.href, $page.url.pathname)));

	// Close the sheet whenever the route changes
	$effect(() => {
		void $page.url.pathname;
		moreOpen = false;
	});
</script>

<!-- Mobile bottom bar -->
<nav
	class="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-cotton/95 backdrop-blur border-t border-sand"
	style="padding-bottom: env(safe-area-inset-bottom)"
>
	<ul class="grid grid-cols-5 h-16">
		{#each BOTTOM_ITEMS.slice(0, 2) as item (item.href)}
			{@const active = isActive(item.href, $page.url.pathname)}
			<li>
				<a
					href={item.href}
					class="flex flex-col items-center justify-center h-full gap-1 text-[11px] font-medium {active
						? 'text-sage'
						: 'text-stone-500'}"
				>
					<Icon name={item.icon} size={22} strokeWidth={active ? 2.2 : 1.8} />
					{item.label}
				</a>
			</li>
		{/each}
		<li class="flex items-center justify-center">
			<a
				href="/import"
				aria-label="Importer un relevé"
				class="-mt-6 w-14 h-14 rounded-full bg-sage text-white flex items-center justify-center shadow-md shadow-sage/30"
			>
				<Icon name="upload" size={24} strokeWidth={2.2} />
			</a>
		</li>
		{#each BOTTOM_ITEMS.slice(2) as item (item.href)}
			{@const active = isActive(item.href, $page.url.pathname)}
			<li>
				<a
					href={item.href}
					class="flex flex-col items-center justify-center h-full gap-1 text-[11px] font-medium {active
						? 'text-sage'
						: 'text-stone-500'}"
				>
					<Icon name={item.icon} size={22} strokeWidth={active ? 2.2 : 1.8} />
					{item.label}
				</a>
			</li>
		{/each}
		<li>
			<button
				type="button"
				class="w-full flex flex-col items-center justify-center h-full gap-1 text-[11px] font-medium {moreActive ||
				moreOpen
					? 'text-sage'
					: 'text-stone-500'}"
				onclick={() => (moreOpen = !moreOpen)}
				aria-expanded={moreOpen}
			>
				<Icon name="more" size={22} strokeWidth={2.4} />
				Plus
			</button>
		</li>
	</ul>
</nav>

{#if moreOpen}
	<button
		type="button"
		class="lg:hidden fixed inset-0 z-20 bg-coffee-900/30"
		aria-label="Fermer"
		onclick={() => (moreOpen = false)}
	></button>
	<div
		class="lg:hidden fixed bottom-16 inset-x-3 z-30 card p-2 shadow-lg"
		style="margin-bottom: env(safe-area-inset-bottom)"
	>
		{#each moreItems as item (item.href)}
			{@const active = isActive(item.href, $page.url.pathname)}
			<a
				href={item.href}
				class="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium {active
					? 'bg-sage/10 text-sage'
					: 'text-coffee-900 hover:bg-oat'}"
			>
				<Icon name={item.icon} size={20} />
				{item.label}
			</a>
		{/each}
		<form method="POST" action="/auth/logout">
			<button
				type="submit"
				class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-stone-500 hover:bg-oat"
			>
				<Icon name="logout" size={20} />
				Déconnexion
			</button>
		</form>
	</div>
{/if}

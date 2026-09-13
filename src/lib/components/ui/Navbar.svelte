<script lang="ts">
	import { page } from '$app/stores';
	import Icon from './Icon.svelte';
	import { NAV_ITEMS, SECONDARY_ITEMS, isActive } from '$lib/config/nav';

	const bottomItems = SECONDARY_ITEMS.filter((i) => i.href !== '/import');
</script>

<nav
	class="hidden lg:flex fixed inset-y-0 left-0 w-56 bg-cotton border-r border-sand flex-col z-20"
>
	<!-- Brand -->
	<a href="/" class="flex items-center gap-3 px-5 pt-6 pb-4">
		<div class="w-8 h-8 bg-sage rounded-lg flex items-center justify-center text-white">
			<Icon name="wallet" size={16} strokeWidth={2.2} />
		</div>
		<span class="text-base font-semibold text-coffee-900">Budget Planner</span>
	</a>

	<!-- Primary action -->
	<div class="px-4 pb-4">
		<a
			href="/import"
			class="btn-primary-sage w-full {isActive('/import', $page.url.pathname)
				? 'ring-2 ring-sage/30'
				: ''}"
		>
			<Icon name="upload" size={18} strokeWidth={2} />
			Importer un relevé
		</a>
	</div>

	<!-- Main navigation -->
	<ul class="px-3 space-y-0.5 flex-1">
		{#each NAV_ITEMS as item (item.href)}
			{@const active = isActive(item.href, $page.url.pathname)}
			<li>
				<a
					href={item.href}
					aria-current={active ? 'page' : undefined}
					class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150
						{active ? 'bg-sage/10 text-sage' : 'text-stone-500 hover:bg-oat hover:text-coffee-900'}"
				>
					<Icon name={item.icon} size={19} strokeWidth={active ? 2.2 : 1.8} />
					{item.label}
				</a>
			</li>
		{/each}
	</ul>

	<!-- Secondary -->
	<ul class="px-3 py-3 border-t border-sand space-y-0.5">
		{#each bottomItems as item (item.href)}
			{@const active = isActive(item.href, $page.url.pathname)}
			<li>
				<a
					href={item.href}
					class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150
						{active ? 'bg-sage/10 text-sage' : 'text-stone-500 hover:bg-oat hover:text-coffee-900'}"
				>
					<Icon name={item.icon} size={18} />
					{item.label}
				</a>
			</li>
		{/each}
		<li>
			<form method="POST" action="/auth/logout">
				<button
					type="submit"
					class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-stone-500 hover:bg-oat hover:text-coffee-900 transition-colors duration-150"
				>
					<Icon name="logout" size={18} />
					Déconnexion
				</button>
			</form>
		</li>
	</ul>
</nav>

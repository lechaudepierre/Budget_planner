<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Icon from './Icon.svelte';
	import { NAV_ITEMS, isActive } from '$lib/config/nav';
</script>

<nav class="tabbar" aria-label="Navigation">
	{#each NAV_ITEMS as item (item.href)}
		{@const active = isActive(item.href, page.url.pathname)}
		<a href={resolve(item.href)} class="tab" aria-current={active ? 'page' : undefined}>
			<Icon name={item.icon} size={24} />
			{item.label}
		</a>
	{/each}
</nav>

<style>
	.tabbar {
		flex: none;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border-top: 1px solid var(--line);
		background: var(--bg);
		padding: 6px 0 calc(8px + env(safe-area-inset-bottom, 0px));
	}
	.tab {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
		padding: 6px 0 2px;
		font-size: 11px;
		font-weight: 500;
		color: var(--faint);
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}
	.tab[aria-current='page'] {
		color: var(--ink);
	}
</style>

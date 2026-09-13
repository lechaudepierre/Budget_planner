<script lang="ts">
	import { page } from '$app/stores';
	import Icon from './Icon.svelte';
	import { pageTitle } from '$lib/config/nav';

	/**
	 * Contextual header. Pages can override the title/subtitle by setting
	 * `$page.data.header` from a server load, otherwise the nav config is used.
	 */
	const title = $derived(
		($page.data as { header?: { title?: string } }).header?.title ?? pageTitle($page.url.pathname)
	);
	const subtitle = $derived(
		($page.data as { header?: { subtitle?: string } }).header?.subtitle ?? ''
	);
	const showImport = $derived(!$page.url.pathname.startsWith('/import'));
</script>

<header class="sticky top-0 z-10 bg-linen/90 backdrop-blur border-b border-sand">
	<div class="flex items-center justify-between gap-4 px-4 lg:px-8 py-4 lg:py-5">
		<div class="min-w-0">
			<h1 class="text-xl lg:text-2xl font-semibold text-coffee-900 truncate">{title}</h1>
			{#if subtitle}
				<p class="text-sm text-stone-500 mt-0.5 truncate">{subtitle}</p>
			{/if}
		</div>
		<div class="hidden sm:flex items-center gap-2 shrink-0">
			<a href="/expenses" class="btn-ghost-soft">
				<Icon name="plus" size={18} strokeWidth={2.2} />
				Ajouter
			</a>
			{#if showImport}
				<a href="/import" class="btn-primary-sage lg:hidden">
					<Icon name="upload" size={18} strokeWidth={2} />
					Importer
				</a>
			{/if}
		</div>
	</div>
</header>

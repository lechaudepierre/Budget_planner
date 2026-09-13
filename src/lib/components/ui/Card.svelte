<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		subtitle,
		action,
		children,
		class: klass = '',
		padding = true
	}: {
		title?: string;
		subtitle?: string;
		/** Right-aligned header content (link, button…) */
		action?: Snippet;
		children: Snippet;
		class?: string;
		padding?: boolean;
	} = $props();
</script>

<section class="card {padding ? '' : 'p-0'} {klass}">
	{#if title || action}
		<header class="flex items-start justify-between gap-3 mb-4 {padding ? '' : 'px-5 pt-5'}">
			<div class="min-w-0">
				{#if title}<h2 class="card-title">{title}</h2>{/if}
				{#if subtitle}<p class="text-xs text-stone-400 mt-0.5">{subtitle}</p>{/if}
			</div>
			{#if action}<div class="shrink-0">{@render action()}</div>{/if}
		</header>
	{/if}
	{@render children()}
</section>

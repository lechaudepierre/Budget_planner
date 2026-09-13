<script lang="ts">
	import Icon, { type IconName } from './Icon.svelte';

	let {
		icon = 'sparkles',
		title,
		text,
		ctaLabel,
		ctaHref,
		onCta,
		compact = false
	}: {
		icon?: IconName;
		title: string;
		text?: string;
		ctaLabel?: string;
		ctaHref?: string;
		onCta?: () => void;
		compact?: boolean;
	} = $props();
</script>

<div class="flex flex-col items-center text-center {compact ? 'py-6' : 'py-12'}">
	<div class="w-11 h-11 rounded-2xl bg-oat flex items-center justify-center text-stone-500 mb-3">
		<Icon name={icon} size={22} />
	</div>
	<p class="font-medium text-coffee-900">{title}</p>
	{#if text}<p class="text-sm text-stone-500 mt-1 max-w-sm">{text}</p>{/if}
	{#if ctaLabel}
		{#if ctaHref}
			<a href={ctaHref} class="btn-primary-sage mt-4">{ctaLabel}</a>
		{:else}
			<button type="button" class="btn-primary-sage mt-4" onclick={onCta}>{ctaLabel}</button>
		{/if}
	{/if}
</div>

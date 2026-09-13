<script lang="ts">
	import Icon, { type IconName } from './Icon.svelte';

	let {
		icon,
		text,
		detail,
		ctaLabel,
		href,
		onClick,
		tone = 'sage'
	}: {
		icon: IconName;
		text: string;
		detail?: string;
		ctaLabel: string;
		href?: string;
		onClick?: () => void;
		tone?: 'sage' | 'amber' | 'terracotta';
	} = $props();

	const tones: Record<string, string> = {
		sage: 'bg-sage/10 text-sage',
		amber: 'bg-amber/15 text-amber',
		terracotta: 'bg-terracotta/10 text-terracotta'
	};
</script>

<div class="card card-hover flex items-center gap-4 py-4">
	<div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 {tones[tone]}">
		<Icon name={icon} size={20} />
	</div>
	<div class="min-w-0 flex-1">
		<p class="text-sm font-medium text-coffee-900">{text}</p>
		{#if detail}<p class="text-xs text-stone-500 mt-0.5 truncate">{detail}</p>{/if}
	</div>
	{#if href}
		<a {href} class="btn-secondary shrink-0 py-2">{ctaLabel}</a>
	{:else}
		<button type="button" class="btn-secondary shrink-0 py-2" onclick={onClick}>{ctaLabel}</button>
	{/if}
</div>

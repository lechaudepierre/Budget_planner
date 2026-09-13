<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import type { DashboardCategory } from '$lib/server/dashboard';

	let {
		categories,
		onSelect
	}: { categories: DashboardCategory[]; onSelect: (c: DashboardCategory) => void } = $props();
</script>

<Card title="Enveloppes" subtitle="Dépenses variables de la période">
	{#snippet action()}
		<a href="/budgets" class="text-sm font-medium text-sage hover:text-sage-dark">Ajuster</a>
	{/snippet}

	{#if categories.length === 0}
		<EmptyState
			compact
			icon="wallet"
			title="Aucune enveloppe variable"
			text="Crée des catégories variables (courses, sorties…) pour suivre tes dépenses."
			ctaLabel="Créer"
			ctaHref="/budgets"
		/>
	{:else}
		<ul class="space-y-4">
			{#each categories as c (c.id)}
				{@const left = c.allocated - c.spent}
				<li>
					<button type="button" class="w-full text-left group" onclick={() => onSelect(c)}>
						<div class="flex items-baseline justify-between gap-3 mb-1.5">
							<span class="flex items-center gap-2 min-w-0">
								<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: {c.color}"
								></span>
								<span
									class="text-sm font-medium text-coffee-900 truncate group-hover:text-sage transition-colors"
									>{c.name}</span
								>
							</span>
							<span
								class="text-sm num shrink-0 {left < 0
									? 'text-terracotta font-medium'
									: 'text-stone-500'}"
							>
								{#if c.allocated > 0}
									{left < 0
										? `${formatCurrency(-left)} au-dessus`
										: `${formatCurrency(left)} restants`}
								{:else}
									{formatCurrency(c.spent)} · pas de budget
								{/if}
							</span>
						</div>
						<ProgressBar value={c.spent} max={c.allocated} />
						<p class="mt-1 text-[11px] text-stone-400 num">
							{formatCurrency(c.spent)} sur {formatCurrency(c.allocated)}
						</p>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</Card>

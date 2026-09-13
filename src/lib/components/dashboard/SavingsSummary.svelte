<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import type { DashboardData } from '$lib/server/dashboard';

	let { savings }: { savings: DashboardData['savings'] } = $props();
</script>

<Card
	title="Épargne"
	subtitle={savings.allocatedThisMonth > 0
		? `${formatCurrency(savings.allocatedThisMonth)} mis de côté ce mois`
		: 'Rien de prévu ce mois'}
>
	{#snippet action()}
		<a href="/epargne" class="text-sm font-medium text-sage hover:text-sage-dark">Répartir</a>
	{/snippet}

	{#if savings.goals.length === 0}
		<EmptyState
			compact
			icon="piggy"
			title="Aucun objectif"
			text="Un objectif avec un montant cible rend l'épargne concrète."
			ctaLabel="Créer un objectif"
			ctaHref="/epargne"
		/>
	{:else}
		<ul class="space-y-3">
			{#each savings.goals as g (g.id)}
				<li>
					<div class="flex justify-between text-sm mb-1">
						<span class="font-medium text-coffee-900 truncate">{g.name}</span>
						<span class="num text-stone-500 shrink-0"
							>{formatCurrency(g.current)} / {formatCurrency(g.target)}</span
						>
					</div>
					<ProgressBar value={g.current} max={g.target} tone="sage" height="h-1.5" />
				</li>
			{/each}
		</ul>
	{/if}
</Card>

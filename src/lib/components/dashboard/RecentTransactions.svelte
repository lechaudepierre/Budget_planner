<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import type { DashboardData } from '$lib/server/dashboard';

	let { items }: { items: DashboardData['recent'] } = $props();

	const fmtDate = (d: string) =>
		new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
</script>

<Card title="Dernières transactions">
	{#snippet action()}
		<a href="/expenses" class="text-sm font-medium text-sage hover:text-sage-dark">Tout voir</a>
	{/snippet}

	{#if items.length === 0}
		<EmptyState
			compact
			icon="list"
			title="Aucune transaction"
			text="Importe un relevé ou ajoute une dépense."
			ctaLabel="Importer"
			ctaHref="/import"
		/>
	{:else}
		<ul class="divide-y divide-sand/60">
			{#each items as t (t.id)}
				<li class="flex items-center gap-3 py-2.5">
					<span class="text-xs text-stone-400 num w-14 shrink-0">{fmtDate(t.date)}</span>
					<span
						class="w-2 h-2 rounded-full shrink-0"
						style="background-color: {t.category?.color ?? '#E2DCD2'}"
					></span>
					<span class="flex-1 min-w-0">
						<span class="block text-sm text-coffee-900 truncate"
							>{t.description || t.merchant || '—'}</span
						>
						<span class="block text-[11px] text-stone-400 truncate">
							{t.category?.name ?? 'Sans catégorie'}{#if t.isPending}
								· en attente{/if}
						</span>
					</span>
					<span class="text-sm font-medium num text-terracotta shrink-0"
						>-{formatCurrency(t.amount)}</span
					>
				</li>
			{/each}
		</ul>
	{/if}
</Card>

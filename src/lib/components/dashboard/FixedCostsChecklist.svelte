<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import type { DashboardCategory } from '$lib/server/dashboard';

	let {
		categories,
		allocated,
		spent,
		onSelect
	}: {
		categories: DashboardCategory[];
		allocated: number;
		spent: number;
		onSelect: (c: DashboardCategory) => void;
	} = $props();

	function status(c: DashboardCategory): 'paid' | 'partial' | 'upcoming' | 'over' {
		if (c.allocated <= 0) return c.spent > 0 ? 'paid' : 'upcoming';
		const r = c.spent / c.allocated;
		if (r > 1.05) return 'over';
		if (r >= 0.95) return 'paid';
		if (r > 0) return 'partial';
		return 'upcoming';
	}

	const labels = {
		paid: 'Payé',
		partial: 'Partiel',
		upcoming: 'À venir',
		over: 'Dépassé'
	} as const;
</script>

<Card title="Coûts fixes" subtitle="{formatCurrency(spent)} sur {formatCurrency(allocated)} payés">
	{#snippet action()}
		<a href="/budgets" class="text-sm font-medium text-sage hover:text-sage-dark">Gérer</a>
	{/snippet}

	{#if categories.length === 0}
		<EmptyState
			compact
			icon="lock"
			title="Aucun coût fixe"
			text="Loyer, abonnements, énergie… ajoute-les comme catégories fixes."
			ctaLabel="Ajouter"
			ctaHref="/budgets"
		/>
	{:else}
		<ul class="divide-y divide-sand/60">
			{#each categories as c (c.id)}
				{@const s = status(c)}
				<li>
					<button
						type="button"
						class="w-full flex items-center gap-3 py-2.5 text-left group"
						onclick={() => onSelect(c)}
					>
						<span
							class="w-6 h-6 rounded-full flex items-center justify-center shrink-0
								{s === 'paid'
								? 'bg-sage text-white'
								: s === 'over'
									? 'bg-terracotta text-white'
									: s === 'partial'
										? 'bg-amber/20 text-amber'
										: 'bg-oat text-stone-400'}"
						>
							{#if s === 'paid' || s === 'over'}<Icon
									name="check"
									size={14}
									strokeWidth={2.6}
								/>{:else}<Icon name="clock" size={14} />{/if}
						</span>
						<span class="flex-1 min-w-0">
							<span
								class="block text-sm font-medium text-coffee-900 truncate group-hover:text-sage transition-colors"
								>{c.name}</span
							>
							<span class="block text-[11px] text-stone-400">{labels[s]}</span>
						</span>
						<span class="text-sm num text-right shrink-0">
							<span class={s === 'over' ? 'text-terracotta' : 'text-coffee-900'}
								>{formatCurrency(c.spent)}</span
							>
							{#if c.allocated > 0}<span class="text-stone-400">
									/ {formatCurrency(c.allocated)}</span
								>{/if}
						</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</Card>

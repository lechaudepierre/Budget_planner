<script lang="ts">
	import { tick } from 'svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { sheet } from '$lib/stores/sheet';
	import { eur } from '$lib/utils/currency';
	import { dayLabel } from '$lib/utils/month';
	import { tone, signed } from '$lib/utils/tone';
	import type { MonthExpense } from '$lib/server/month';
	import type { IconName } from '$lib/components/ui/Icon.svelte';

	import { pendingExpenses, withPending } from '$lib/stores/pending';

	let { data } = $props();
	// Expenses being saved show at once
	const m = $derived(withPending(data.month!, $pendingExpenses));

	// Category filter: null = every expense of the period
	let selected = $state<string | null>(null);
	let screenEl = $state<HTMLElement>();
	let chipsEl = $state<HTMLElement>();

	// One chip per category spent in this period, biggest first — the filter doubles as a breakdown
	const cats = $derived.by(() => {
		const byId: Record<
			string,
			{ id: string; name: string; icon: IconName; total: number; count: number }
		> = {};
		for (const e of m.expenses) {
			const c = (byId[e.categoryId] ??= {
				id: e.categoryId,
				name: e.categoryName,
				icon: e.icon,
				total: 0,
				count: 0
			});
			c.total += e.amount;
			c.count += 1;
		}
		return Object.values(byId).sort((a, b) => b.total - a.total);
	});

	// A filter whose last expense was deleted falls back to "Tout"
	const active = $derived(cats.find((c) => c.id === selected) ?? null);
	const envelope = $derived(active ? m.envelopes.find((e) => e.id === active.id) : undefined);
	const visible = $derived(
		active ? m.expenses.filter((e) => e.categoryId === active.id) : m.expenses
	);
	const total = $derived(active ? active.total : m.totals.spent);

	// Group by day, newest first (the loader already sorts by date desc)
	const days = $derived.by(() => {
		const groups: { date: string; items: MonthExpense[]; total: number }[] = [];
		for (const e of visible) {
			const last = groups[groups.length - 1];
			if (last && last.date === e.date) {
				last.items.push(e);
				last.total += e.amount;
			} else groups.push({ date: e.date, items: [e], total: e.amount });
		}
		return groups;
	});

	async function pick(id: string | null) {
		selected = selected === id ? null : id;
		await tick();
		screenEl?.scrollTo({ top: 0 });
		chipsEl
			?.querySelector('[aria-checked="true"]')
			?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>Historique · Budget</title>
</svelte:head>

<main class="screen" bind:this={screenEl}>
	<div class="topbar">
		<h1 class="title">Historique</h1>
		<span class="eyebrow num">{eur(total)} ce mois</span>

		{#if cats.length > 1}
			<div class="chips" role="radiogroup" aria-label="Filtrer par catégorie" bind:this={chipsEl}>
				<button
					type="button"
					role="radio"
					class="chip"
					aria-checked={active === null}
					onclick={() => pick(null)}>Tout</button
				>
				{#each cats as c (c.id)}
					<button
						type="button"
						role="radio"
						class="chip"
						aria-checked={active?.id === c.id}
						onclick={() => pick(c.id)}
					>
						<Icon name={c.icon} />
						{c.name}
						<span class="chip-amt num">{eur(c.total)}</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	{#if active}
		{@const budget = envelope?.budget ?? 0}
		{@const spent = envelope?.spent ?? active.total}
		{@const rem = budget - spent}
		{@const tn = tone(spent, budget)}
		{@const share = m.totals.spent > 0 ? Math.round((active.total / m.totals.spent) * 100) : 0}
		<section class="focus">
			<div class="focus-line">
				<span class="num"
					>{active.count} dépense{active.count > 1 ? 's' : ''} · {share} % du mois</span
				>
				{#if envelope}
					<span class="num {tn}">{signed(rem, eur)} {rem < 0 ? 'dépassé' : 'reste'}</span>
				{/if}
			</div>
			{#if envelope}
				{@const w = budget > 0 ? Math.min(100, (spent / budget) * 100) : spent > 0 ? 100 : 0}
				<span class="row-bar"><i class={tn} style="width:{w}%"></i></span>
				<div class="focus-line sub">
					<span class="num">{eur(spent)} sur {eur(budget)}</span>
					<button
						type="button"
						class="focus-add"
						onclick={() => sheet.open({ mode: 'add', envelopeId: active.id })}>Ajouter</button
					>
				</div>
			{/if}
		</section>
	{/if}

	{#if days.length === 0}
		<p class="empty">Aucune dépense ce mois-ci.</p>
	{:else}
		{#each days as day (day.date)}
			<div class="day-h"><b>{dayLabel(day.date)}</b><span class="num">{eur(day.total)}</span></div>
			<div class="list">
				{#each day.items as e (e.id)}
					<button
						type="button"
						class="row"
						disabled={e.pending}
						onclick={() => sheet.open({ mode: 'edit', expenseId: e.id })}
					>
						<span class="row-ico"><Icon name={e.icon} /></span>
						<span class="row-main">
							<span class="row-name">{e.categoryName}</span>
							{#if e.note}<span class="row-sub">{e.note}</span>{/if}
						</span>
						<span class="row-end"><span class="row-amt num">−{eur(e.amount)}</span></span>
					</button>
				{/each}
			</div>
		{/each}
	{/if}
</main>

<style>
	.topbar {
		flex-wrap: wrap;
		row-gap: 12px;
	}

	/* Horizontal chip rail, bleeding to the screen edges */
	.chips {
		flex: 0 0 calc(100% + 40px);
		min-width: 0;
		display: flex;
		gap: 8px;
		margin: 0 -20px;
		padding: 0 20px 2px;
		overflow-x: auto;
		scrollbar-width: none;
		scroll-padding: 0 20px;
	}
	.chips::-webkit-scrollbar {
		display: none;
	}
	.chip {
		flex: none;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 7px 12px;
		border-radius: 999px;
		background: var(--soft);
		font-size: 13px;
		font-weight: 500;
		white-space: nowrap;
		transition:
			background 0.12s,
			color 0.12s;
	}
	.chip:active {
		background: var(--press);
	}
	.chip :global(svg) {
		width: 15px;
		height: 15px;
	}
	.chip-amt {
		color: var(--muted);
		font-weight: 400;
	}
	.chip[aria-checked='true'] {
		background: var(--ink);
		color: var(--bg);
	}
	.chip[aria-checked='true'] .chip-amt {
		color: inherit;
		opacity: 0.6;
	}

	/* Envelope summary of the filtered category */
	.focus {
		padding: 8px 0 4px;
		border-bottom: 1px solid var(--line);
	}
	.focus-line {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 12px;
		font-size: 13px;
		color: var(--muted);
	}
	.focus-line .warn {
		color: var(--warn);
		font-weight: 500;
	}
	.focus-line .over {
		color: var(--over);
		font-weight: 500;
	}
	.focus-line.sub {
		padding: 8px 0 6px;
	}
	.focus .row-bar {
		margin-top: 10px;
	}
	.focus-add {
		color: var(--accent);
		font-weight: 500;
		padding: 4px 0 4px 12px;
	}
</style>

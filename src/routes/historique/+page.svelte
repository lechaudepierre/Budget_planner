<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import { sheet } from '$lib/stores/sheet';
	import { eur } from '$lib/utils/currency';
	import { dayLabel } from '$lib/utils/month';
	import type { MonthExpense } from '$lib/server/month';

	let { data } = $props();
	const m = $derived(data.month!);

	// Group by day, newest first (the loader already sorts by date desc)
	const days = $derived.by(() => {
		const groups: { date: string; items: MonthExpense[]; total: number }[] = [];
		for (const e of m.expenses) {
			const last = groups[groups.length - 1];
			if (last && last.date === e.date) {
				last.items.push(e);
				last.total += e.amount;
			} else groups.push({ date: e.date, items: [e], total: e.amount });
		}
		return groups;
	});
</script>

<svelte:head>
	<title>Historique · Budget</title>
</svelte:head>

<main class="screen">
	<div class="topbar">
		<h1 class="title">Historique</h1>
		<span class="eyebrow num">{eur(m.totals.spent)} ce mois</span>
	</div>

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

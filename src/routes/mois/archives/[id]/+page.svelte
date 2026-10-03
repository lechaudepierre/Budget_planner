<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { eur } from '$lib/utils/currency';
	import { signed } from '$lib/utils/tone';
	import { monthLabel, periodLabel } from '$lib/utils/month';
	import type { ArchiveLine } from '$lib/server/archive';

	let { data } = $props();
	const a = $derived(data.archive);
	const t = $derived(a.totals);
	const gap = $derived(t.realSavings - t.plannedSavings);
	const paidCount = $derived(a.fixed.filter((f) => f.actual > 0).length);

	const plus = (n: number) => (n > 0 ? '+' + eur(n) : signed(n, eur));
</script>

{#snippet paidRow(f: ArchiveLine, missed: string)}
	{@const paid = f.actual > 0}
	<div class="row">
		<span class="row-ico check" class:on={paid}
			><Icon name="check" size={14} strokeWidth={3} /></span
		>
		<span class="row-main">
			<span class="row-name">{f.name}</span>
			{#if !paid}<span class="row-sub">{missed} · pas compté</span>{/if}
		</span>
		<span class="row-end"
			><span class="row-amt num" class:muted={!paid}>{eur(paid ? f.actual : f.planned)}</span></span
		>
	</div>
{/snippet}

<svelte:head>
	<title>{monthLabel(a.month)} · Archives</title>
</svelte:head>

<main class="screen">
	<div class="topbar sub">
		<a href={resolve('/mois/archives')} class="back" aria-label="Retour aux archives"
			><Icon name="back" size={22} strokeWidth={2.2} /></a
		>
		<h1 class="title">{monthLabel(a.month)}</h1>
	</div>
	<p class="period eyebrow num">{periodLabel(a.startDate, a.endDate)}</p>

	<div class="balance" class:neg={t.realSavings < 0}>
		<span class="k">{t.realSavings < 0 ? 'Il a manqué' : 'Épargne réelle'}</span>
		<span class="v num">{eur(Math.abs(t.realSavings))}</span>
	</div>
	<div class="total-line">
		<span>Épargne prévue</span><b class="num">{eur(t.plannedSavings)}</b>
	</div>
	<div class="total-line">
		<span>Écart</span><b class="num" class:saved={gap > 0} class:over={gap < 0}>{plus(gap)}</b>
	</div>

	<div class="section-h"><h2>Revenus</h2></div>
	<div class="list">
		<div class="row">
			<span class="row-ico"><Icon name="wallet" /></span>
			<span class="row-main"><span class="row-name">Salaire</span></span>
			<span class="row-end"><span class="row-amt num">{eur(a.income)}</span></span>
		</div>
	</div>

	{#if a.fixed.length > 0}
		<div class="section-h">
			<h2>Coûts fixes</h2>
			<span class="num">{paidCount} / {a.fixed.length} prélevés</span>
		</div>
		<div class="list">
			{#each a.fixed as f (f.id)}
				{@render paidRow(f, 'Non prélevé')}
			{/each}
		</div>
		<div class="total-line"><span>Prélevé</span><b class="num">{eur(t.fixed)}</b></div>
	{/if}

	{#if a.exceptional.length > 0}
		<div class="section-h"><h2>Exceptionnel</h2></div>
		<div class="list">
			{#each a.exceptional as f (f.id)}
				{@render paidRow(f, 'Non payé')}
			{/each}
		</div>
		<div class="total-line"><span>Payé</span><b class="num">{eur(t.exceptional)}</b></div>
	{/if}

	{#if a.envelopes.length > 0}
		<div class="section-h">
			<h2>Enveloppes</h2>
			<span>Dépensé sur budget</span>
		</div>
		<div class="list">
			{#each a.envelopes as c (c.id)}
				{@const left = c.planned - c.actual}
				{@const w =
					c.planned > 0 ? Math.min(100, (c.actual / c.planned) * 100) : c.actual > 0 ? 100 : 0}
				<div class="row">
					<span class="row-ico"><Icon name={c.icon} /></span>
					<span class="row-main">
						<span class="row-name">{c.name}</span>
						<span class="row-sub num">{eur(c.actual)} sur {eur(c.planned)}</span>
						<span class="row-bar"><i class={left < 0 ? 'over' : ''} style="width:{w}%"></i></span>
					</span>
					<span class="row-end">
						<span class="row-amt num" class:saved={left > 0} class:over={left < 0}
							>{plus(left)}</span
						>
						<span class="row-hint">{left < 0 ? 'dépassé' : left > 0 ? 'économisé' : 'pile'}</span>
					</span>
				</div>
			{/each}
		</div>
		<div class="total-line">
			<span>Dépensé</span><b class="num">{eur(t.spent)} sur {eur(t.budget)}</b>
		</div>
	{/if}

	<p class="footer-note">
		Épargne réelle = salaire − coûts fixes prélevés − dépenses exceptionnelles payées − ce qui a
		vraiment été dépensé dans les enveloppes.
	</p>
</main>

<style>
	.period {
		margin: -4px 0 0;
	}
	.saved {
		color: var(--accent);
	}
	.total-line b.saved {
		color: var(--accent);
	}
	.total-line b.over {
		color: var(--over);
	}
</style>

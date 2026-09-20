<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Icon from '$lib/components/ui/Icon.svelte';
	import AnimatedNumber from '$lib/components/ui/AnimatedNumber.svelte';
	import ClosePeriod from '$lib/components/ui/ClosePeriod.svelte';
	import { sheet } from '$lib/stores/sheet';
	import { eur } from '$lib/utils/currency';
	import { tone, signed } from '$lib/utils/tone';
	import { monthLabel, monthName } from '$lib/utils/month';

	let { data } = $props();
	const m = $derived(data.month!);

	const t = $derived(m.totals);
	const heroTone = $derived(tone(t.spent, t.budget));
	const daysLeft = $derived(m.period.daysLeft);
	const startsIn = $derived(m.period.startsIn);
	const overdue = $derived(m.period.overdueDays);
	const startLabel = $derived(
		new Date(m.period.startDate + 'T00:00:00').toLocaleDateString('fr-BE', {
			day: 'numeric',
			month: 'long'
		})
	);
	const perDay = $derived(daysLeft > 0 ? Math.max(t.remaining, 0) / daysLeft : 0);
	const spentPct = $derived(t.budget > 0 ? Math.min(100, (t.spent / t.budget) * 100) : 0);
	const dayPct = $derived((m.period.day / m.period.daysTotal) * 100);

	// Refresh when the app comes back to the foreground (PWA on the home screen)
	onMount(() => {
		const onVisible = () => {
			if (document.visibilityState === 'visible') void invalidate('app:month');
		};
		document.addEventListener('visibilitychange', onVisible);
		return () => document.removeEventListener('visibilitychange', onVisible);
	});
</script>

<svelte:head>
	<title>Budget</title>
</svelte:head>

<main class="screen">
	<div class="topbar">
		<span class="eyebrow">{monthLabel(m.budget.month)}</span>
		<span class="eyebrow num">
			{#if startsIn > 0}Dans {startsIn} jour{startsIn > 1 ? 's' : ''}{:else}Jour {m.period.day} / {m
					.period.daysTotal}{/if}
		</span>
	</div>

	<section class="hero">
		<p class="hero-label">Reste à dépenser</p>
		<p class="hero-value {heroTone}"><AnimatedNumber value={t.remaining} /></p>
		<p class="hero-sub">
			{#if startsIn > 0}
				Le mois commence le <strong>{startLabel}</strong>.
			{:else if overdue > 0}
				Période dépassée de <strong class="num">{overdue}</strong> jour{overdue > 1 ? 's' : ''} — les
				dépenses continuent d'être comptées.
			{:else if daysLeft > 0}
				<strong class="num">{daysLeft}</strong>
				jour{daysLeft > 1 ? 's' : ''} restants ·
				<strong class="num">~{eur(perDay)}</strong> par jour
			{:else}
				Dernier jour du mois.
			{/if}
		</p>
		<div class="track">
			<div class="track-fill {heroTone}" style="width:{spentPct}%"></div>
			<div class="track-tick" style="left:{dayPct}%" title="Où en est le mois"></div>
		</div>
		<div class="track-legend">
			<span>Dépensé <b class="num">{eur(t.spent)}</b></span>
			<span>Enveloppes <b class="num">{eur(t.budget)}</b></span>
		</div>
	</section>

	{#if overdue > 0}
		<div class="nudge">
			<span
				>Salaire reçu ? Clôture {monthName(m.budget.month)} pour démarrer {monthLabel(
					m.period.nextMonth
				)}.</span
			>
			<ClosePeriod month={m} class="nudge-btn" />
		</div>
	{/if}

	<div class="stats">
		<a href={resolve('/mois')} class="stat"
			><span class="stat-k">Salaire</span><span class="stat-v num">{eur(m.income)}</span></a
		>
		<a href={resolve('/mois')} class="stat"
			><span class="stat-k">Fixes</span><span class="stat-v num">{eur(t.fixed)}</span></a
		>
		<a href={resolve('/mois')} class="stat"
			><span class="stat-k">Épargne</span><span class="stat-v num">{eur(m.savings.amount)}</span></a
		>
	</div>

	<div class="section-h">
		<h2>Enveloppes</h2>
		<span>Touche pour ajouter</span>
	</div>

	{#if m.envelopes.length === 0}
		<p class="empty">
			Aucune enveloppe pour l'instant.<br />
			<a href={resolve('/mois')} class="link">Crée ta première enveloppe</a>
		</p>
	{:else}
		<div class="list">
			{#each m.envelopes as c (c.id)}
				{@const rem = c.budget - c.spent}
				{@const tn = tone(c.spent, c.budget)}
				{@const w =
					c.budget > 0 ? Math.min(100, (c.spent / c.budget) * 100) : c.spent > 0 ? 100 : 0}
				<button
					type="button"
					class="row"
					onclick={() => sheet.open({ mode: 'add', envelopeId: c.id })}
				>
					<span class="row-ico"><Icon name={c.icon} /></span>
					<span class="row-main">
						<span class="row-name">{c.name}</span>
						<span class="row-sub num">{eur(c.spent)} sur {eur(c.budget)}</span>
						<span class="row-bar"><i class={tn} style="width:{w}%"></i></span>
					</span>
					<span class="row-end">
						<span class="row-amt num {tn}">{signed(rem, eur)}</span>
						<span class="row-hint">{rem < 0 ? 'dépassé' : 'reste'}</span>
					</span>
				</button>
			{/each}
		</div>
	{/if}
</main>

<style>
	.hero {
		padding: 10px 0 22px;
	}
	.hero-label {
		font-size: 13px;
		color: var(--muted);
		margin: 0 0 4px;
	}
	.hero-value {
		font-size: 46px;
		font-weight: 600;
		letter-spacing: -0.035em;
		line-height: 1.05;
		margin: 0;
	}
	.hero-value.warn {
		color: var(--warn);
	}
	.hero-value.over {
		color: var(--over);
	}
	.hero-sub {
		font-size: 14px;
		color: var(--muted);
		margin: 8px 0 0;
	}
	.hero-sub strong {
		color: var(--ink);
		font-weight: 500;
	}

	.track {
		position: relative;
		height: 4px;
		border-radius: 2px;
		background: var(--line);
		margin-top: 18px;
		overflow: visible;
	}
	.track-fill {
		height: 100%;
		border-radius: 2px;
		background: var(--accent);
		transition: width 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
	}
	.track-fill.warn {
		background: var(--warn);
	}
	.track-fill.over {
		background: var(--over);
	}
	.track-tick {
		position: absolute;
		top: -4px;
		width: 2px;
		height: 12px;
		background: var(--ink);
		border-radius: 1px;
		opacity: 0.55;
	}
	.track-legend {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		color: var(--muted);
		margin-top: 8px;
	}
	.track-legend b {
		color: var(--ink);
		font-weight: 500;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		background: var(--soft);
		border-radius: 18px;
		padding: 4px 6px;
		margin: 0 0 10px;
	}
	.stat {
		display: block;
		padding: 12px 12px;
		text-decoration: none;
		color: inherit;
		min-width: 0;
		border-radius: 14px;
		transition: background 0.12s;
	}
	.stat:active {
		background: var(--press);
	}
	.stat + .stat {
		position: relative;
	}
	.stat + .stat::before {
		content: '';
		position: absolute;
		left: 0;
		top: 14px;
		bottom: 14px;
		width: 1px;
		background: var(--line);
	}
	.stat-k {
		display: block;
		font-size: 11.5px;
		color: var(--muted);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.stat-v {
		display: block;
		font-size: 15px;
		font-weight: 500;
		margin-top: 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.nudge {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin: 0 0 10px;
		padding: 14px 16px;
		border-radius: 18px;
		background: var(--warn-soft);
		font-size: 13.5px;
		color: var(--ink);
	}
	.nudge :global(.nudge-btn) {
		flex: none;
		padding: 9px 14px;
		border-radius: 12px;
		background: var(--ink);
		color: var(--bg);
		font-size: 13px;
		font-weight: 600;
		white-space: nowrap;
	}
	.link {
		color: var(--accent);
		font-weight: 500;
		text-decoration: none;
	}
</style>

<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { sheet } from '$lib/stores/sheet';
	import ClosePeriod from '$lib/components/ui/ClosePeriod.svelte';
	import { toast } from '$lib/stores/toast';
	import { dashboardRefresh } from '$lib/stores/refresh';
	import { eur } from '$lib/utils/currency';
	import { cap, monthName, monthLabel } from '$lib/utils/month';
	import { setFixedPaid } from '$lib/data/month';
	import { theme, type Theme } from '$lib/stores/theme';
	import type { MonthFixed } from '$lib/server/month';

	const THEMES: { value: Theme; label: string }[] = [
		{ value: 'auto', label: 'Auto' },
		{ value: 'light', label: 'Clair' },
		{ value: 'dark', label: 'Sombre' }
	];

	let { data } = $props();
	const m = $derived(data.month!);

	const name = $derived(monthName(m.budget.month));
	const paidCount = $derived(m.fixed.filter((f) => f.paid).length);
	const savings = $derived(m.totals.savings);

	let toggling = $state<string | null>(null);

	async function togglePaid(id: string, paid: boolean) {
		if (toggling) return;
		toggling = id;
		const res = await setFixedPaid(m, id, !paid);
		if (res.error) toast.error(res.error);
		else await dashboardRefresh.trigger();
		toggling = null;
	}
</script>

{#snippet checkRow(f: MonthFixed, kind: 'fixed' | 'exceptional')}
	{@const done = kind === 'fixed' ? 'prélevé' : 'payé'}
	<div class="row">
		<button
			type="button"
			class="row-ico check"
			class:on={f.paid}
			aria-pressed={f.paid}
			aria-label={f.paid ? `Marquer non ${done}` : `Marquer ${done}`}
			disabled={toggling === f.id}
			onclick={() => togglePaid(f.id, f.paid)}
		>
			<Icon name="check" size={14} strokeWidth={3} />
		</button>
		<button
			type="button"
			class="row-main text-left"
			onclick={() => sheet.open({ mode: 'value', kind, id: f.id })}
		>
			<span class="row-name">{f.name}</span>
		</button>
		<button
			type="button"
			class="row-end"
			onclick={() => sheet.open({ mode: 'value', kind, id: f.id })}
		>
			<span class="row-amt num" class:muted={f.paid}>{eur(f.amount)}</span>
		</button>
	</div>
{/snippet}

<svelte:head>
	<title>{cap(name)} · Budget</title>
</svelte:head>

<main class="screen">
	<div class="topbar">
		<h1 class="title">{cap(name)}</h1>
		<a href={resolve('/mois/archives')} class="eyebrow top-link"
			>Archives<Icon name="next" size={13} strokeWidth={2.2} /></a
		>
	</div>

	<div class="section-h"><h2>Revenus</h2></div>
	<div class="list">
		<button type="button" class="row" onclick={() => sheet.open({ mode: 'value', kind: 'income' })}>
			<span class="row-ico"><Icon name="wallet" /></span>
			<span class="row-main"
				><span class="row-name">Salaire</span><span class="row-sub">Net du mois</span></span
			>
			<span class="row-end"><span class="row-amt num">{eur(m.income)}</span></span>
		</button>
	</div>

	<div class="section-h">
		<h2>Coûts fixes</h2>
		{#if m.fixed.length > 0}<span class="num">{paidCount} / {m.fixed.length} passés</span>{/if}
	</div>
	<div class="list">
		{#each m.fixed as f (f.id)}
			{@render checkRow(f, 'fixed')}
		{/each}
		<button
			type="button"
			class="row row-add"
			onclick={() => sheet.open({ mode: 'create', type: 'fixed' })}
		>
			<span class="row-ico"><Icon name="plus" /></span>
			<span class="row-main"><span class="row-name">Ajouter un coût fixe</span></span>
		</button>
	</div>
	<div class="total-line"><span>Total</span><b class="num">{eur(m.totals.fixed)}</b></div>

	<div class="section-h">
		<h2>Exceptionnel</h2>
		<span>Ce mois seulement</span>
	</div>
	<div class="list">
		{#each m.exceptional as f (f.id)}
			{@render checkRow(f, 'exceptional')}
		{/each}
		<button
			type="button"
			class="row row-add"
			onclick={() => sheet.open({ mode: 'create', type: 'exceptional' })}
		>
			<span class="row-ico"><Icon name="plus" /></span>
			<span class="row-main"><span class="row-name">Ajouter une dépense exceptionnelle</span></span>
		</button>
	</div>
	{#if m.exceptional.length > 0}
		<div class="total-line">
			<span>Total</span><b class="num">{eur(m.totals.exceptional)}</b>
		</div>
	{/if}

	<div class="section-h">
		<h2>Enveloppes</h2>
		<span>Budget du mois</span>
	</div>
	<div class="list">
		{#each m.envelopes as c (c.id)}
			<button
				type="button"
				class="row"
				onclick={() => sheet.open({ mode: 'value', kind: 'envelope', id: c.id })}
			>
				<span class="row-ico"><Icon name={c.icon} /></span>
				<span class="row-main"><span class="row-name">{c.name}</span></span>
				<span class="row-end"><span class="row-amt num">{eur(c.budget)}</span></span>
			</button>
		{/each}
		<button
			type="button"
			class="row row-add"
			onclick={() => sheet.open({ mode: 'create', type: 'variable' })}
		>
			<span class="row-ico"><Icon name="plus" /></span>
			<span class="row-main"><span class="row-name">Ajouter une enveloppe</span></span>
		</button>
	</div>
	<div class="total-line"><span>Total</span><b class="num">{eur(m.totals.budget)}</b></div>

	<div class="balance" class:neg={savings < 0}>
		<span class="k">{savings < 0 ? 'Il manque' : 'Épargne prévue'}</span>
		<span class="v num">{eur(Math.abs(savings))}</span>
	</div>
	<ClosePeriod month={m} class="btn-ghost" />
	<p class="footer-note">
		C'est ton salaire qui termine le mois : le jour où il arrive, clôture {name}. L'épargne réelle
		est alors calculée avec ce que tu as vraiment dépensé, et le résumé rejoint les archives.
		{monthLabel(m.period.nextMonth)} reprend les mêmes coûts fixes ; salaire et enveloppes repartent à
		zéro.
	</p>

	<div class="section-h">
		<h2>Apparence</h2>
		<span>Ce téléphone</span>
	</div>
	<div class="seg" role="radiogroup" aria-label="Apparence">
		{#each THEMES as t (t.value)}
			<button
				type="button"
				role="radio"
				aria-checked={$theme === t.value}
				onclick={() => theme.set(t.value)}
			>
				{t.label}
			</button>
		{/each}
	</div>

	<form method="POST" action="/auth/logout" class="logout">
		<button type="submit">Se déconnecter</button>
	</form>
</main>

<style>
	.seg {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		background: var(--soft);
		border-radius: 12px;
		padding: 3px;
		margin-top: 6px;
	}
	.seg button {
		padding: 9px;
		border-radius: 9px;
		font-size: 13px;
		font-weight: 500;
		color: var(--muted);
	}
	.seg button[aria-checked='true'] {
		background: var(--bg);
		color: var(--ink);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
	}
	.top-link {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		text-decoration: none;
	}
	.top-link:active {
		color: var(--ink);
	}
	.logout {
		margin-top: 28px;
		text-align: center;
	}
	.logout button {
		font-size: 13px;
		color: var(--faint);
		padding: 8px 12px;
	}
</style>

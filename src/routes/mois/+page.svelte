<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import { sheet } from '$lib/stores/sheet';
	import ClosePeriod from '$lib/components/ui/ClosePeriod.svelte';
	import { toast } from '$lib/stores/toast';
	import { dashboardRefresh } from '$lib/stores/refresh';
	import { eur } from '$lib/utils/currency';
	import { cap, monthName, monthLabel } from '$lib/utils/month';
	import { setFixedPaid } from '$lib/data/month';

	let { data } = $props();
	const m = $derived(data.month!);

	const name = $derived(monthName(m.budget.month));
	const paidCount = $derived(m.fixed.filter((f) => f.paid).length);
	const free = $derived(m.totals.free);

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

<svelte:head>
	<title>{cap(name)} · Budget</title>
</svelte:head>

<main class="screen">
	<div class="topbar">
		<h1 class="title">{cap(name)}</h1>
		<span class="eyebrow">Réglages</span>
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
			<div class="row">
				<button
					type="button"
					class="row-ico check"
					class:on={f.paid}
					aria-pressed={f.paid}
					aria-label={f.paid ? 'Marquer non prélevé' : 'Marquer prélevé'}
					disabled={toggling === f.id}
					onclick={() => togglePaid(f.id, f.paid)}
				>
					<Icon name="check" size={14} strokeWidth={3} />
				</button>
				<button
					type="button"
					class="row-main text-left"
					onclick={() => sheet.open({ mode: 'value', kind: 'fixed', id: f.id })}
				>
					<span class="row-name">{f.name}</span>
				</button>
				<button
					type="button"
					class="row-end"
					onclick={() => sheet.open({ mode: 'value', kind: 'fixed', id: f.id })}
				>
					<span class="row-amt num" class:muted={f.paid}>{eur(f.amount)}</span>
				</button>
			</div>
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

	<div class="section-h"><h2>Épargne</h2></div>
	<div class="list">
		<button
			type="button"
			class="row"
			onclick={() => sheet.open({ mode: 'value', kind: 'savings' })}
		>
			<span class="row-ico"><Icon name="piggy" /></span>
			<span class="row-main"
				><span class="row-name">Mis de côté</span><span class="row-sub">Virement épargne</span
				></span
			>
			<span class="row-end"><span class="row-amt num">{eur(m.savings.amount)}</span></span>
		</button>
	</div>

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

	<div class="balance" class:neg={free < 0}>
		<span class="k">{free < 0 ? 'Il manque' : 'Non alloué'}</span>
		<span class="v num">{eur(Math.abs(free))}</span>
	</div>
	<ClosePeriod month={m} class="btn-ghost" />
	<p class="footer-note">
		C'est ton salaire qui termine le mois : le jour où il arrive, clôture {name}.
		{monthLabel(m.period.nextMonth)} commence ce jour-là, avec les mêmes fixes, enveloppes et épargne.
	</p>

	<form method="POST" action="/auth/logout" class="logout">
		<button type="submit">Se déconnecter</button>
	</form>
</main>

<style>
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

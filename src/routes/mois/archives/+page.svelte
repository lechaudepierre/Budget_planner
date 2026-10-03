<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { eur } from '$lib/utils/currency';
	import { signed } from '$lib/utils/tone';
	import { monthLabel, periodLabel } from '$lib/utils/month';

	let { data } = $props();
</script>

<svelte:head>
	<title>Archives · Budget</title>
</svelte:head>

<main class="screen">
	<div class="topbar sub">
		<a href={resolve('/mois')} class="back" aria-label="Retour au mois"
			><Icon name="back" size={22} strokeWidth={2.2} /></a
		>
		<h1 class="title">Archives</h1>
	</div>

	{#if data.archives.length === 0}
		<p class="empty">
			Aucun mois clôturé pour l'instant.<br />Le résumé d'un mois apparaît ici quand tu le clôtures.
		</p>
	{:else}
		<div class="section-h">
			<h2>Mois clôturés</h2>
			<span>Épargne réelle</span>
		</div>
		<div class="list">
			{#each data.archives as a (a.id)}
				{@const real = a.totals.realSavings}
				<a href={resolve('/mois/archives/[id]', { id: a.id })} class="row">
					<span class="row-ico"><Icon name="calendar" /></span>
					<span class="row-main">
						<span class="row-name">{monthLabel(a.month)}</span>
						<span class="row-sub num">{periodLabel(a.startDate, a.endDate)}</span>
					</span>
					<span class="row-end">
						<span class="row-amt num" class:saved={real > 0} class:over={real < 0}
							>{signed(real, eur)}</span
						>
						<span class="row-hint">{real < 0 ? 'manque' : 'épargné'}</span>
					</span>
				</a>
			{/each}
		</div>
	{/if}
</main>

<style>
	.row-amt.saved {
		color: var(--accent);
	}
</style>

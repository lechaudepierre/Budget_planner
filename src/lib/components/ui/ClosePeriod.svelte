<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import { dashboardRefresh } from '$lib/stores/refresh';
	import { closeMonth } from '$lib/data/month';
	import { cap, monthName, monthLabel } from '$lib/utils/month';
	import type { MonthData } from '$lib/server/month';

	/** "Clôturer <mois>" — asks for confirmation, archives the period today and opens the next one (fixed costs kept, the rest from zero). */
	let { month, class: klass = '' }: { month: MonthData; class?: string } = $props();

	let open = $state(false);
	let visible = $state(false);
	let busy = $state(false);
	const name = $derived(monthName(month.budget.month));
	const next = $derived(monthLabel(month.period.nextMonth));

	function ask() {
		open = true;
		requestAnimationFrame(() => (visible = true));
	}

	function dismiss() {
		if (busy) return;
		visible = false;
		setTimeout(() => (open = false), 250);
	}

	async function confirm() {
		if (busy) return;
		busy = true;
		const closed = name;
		const res = await closeMonth(month);
		if (!res.error) await dashboardRefresh.trigger();
		busy = false;
		dismiss();
		if (res.error) toast.error(res.error);
		else toast.show(`${cap(closed)} clôturé · bienvenue en ${next}`);
	}

	function onKeydown(e: KeyboardEvent) {
		if (open && e.key === 'Escape') dismiss();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<button type="button" class={klass} onclick={ask}>Clôturer {name}</button>

{#if open}
	<button type="button" class="backdrop" class:in={visible} aria-label="Annuler" onclick={dismiss}
	></button>
	<div
		class="sheet"
		class:in={visible}
		role="alertdialog"
		aria-modal="true"
		aria-labelledby="close-title"
		aria-describedby="close-desc"
	>
		<div class="grab"></div>
		<h2 id="close-title">Clôturer {name} ?</h2>
		<p id="close-desc">
			{next} commence aujourd'hui. Les coûts fixes sont repris (à recocher) ; salaire, enveloppes et
			épargne repartent <b>à zéro</b>. Tes catégories et l'historique de {name} sont conservés.
		</p>
		<button type="button" class="cta" onclick={confirm} disabled={busy}>
			{busy ? 'Clôture en cours…' : `Oui, clôturer ${name}`}
		</button>
		<button type="button" class="cancel" onclick={dismiss} disabled={busy}>Annuler</button>
	</div>
{/if}

<style>
	.backdrop {
		position: absolute;
		inset: 0;
		z-index: 10;
		background: rgba(20, 17, 14, 0.35);
		opacity: 0;
		transition: opacity 0.2s;
		border-radius: 0;
	}
	.backdrop.in {
		opacity: 1;
	}
	.sheet {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 11;
		background: var(--sheet);
		color: var(--ink);
		text-align: left;
		border-radius: 28px 28px 0 0;
		padding: 10px 20px calc(16px + env(safe-area-inset-bottom, 0px));
		transform: translateY(100%);
		transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.sheet.in {
		transform: translateY(0);
	}
	.grab {
		width: 36px;
		height: 4px;
		border-radius: 2px;
		background: var(--line);
		margin: 0 auto 16px;
	}
	h2 {
		font-size: 18px;
		font-weight: 600;
	}
	p {
		margin-top: 8px;
		font-size: 14px;
		line-height: 1.45;
		color: var(--muted);
	}
	p b {
		color: var(--ink);
		font-weight: 600;
	}
	.cta {
		width: 100%;
		margin-top: 20px;
		padding: 16px;
		border-radius: 18px;
		background: var(--ink);
		color: var(--bg);
		font-weight: 600;
		font-size: 16px;
		transition: opacity 0.15s;
	}
	.cta:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.cancel {
		width: 100%;
		margin-top: 8px;
		padding: 12px;
		font-size: 14px;
		font-weight: 500;
		color: var(--muted);
	}
</style>

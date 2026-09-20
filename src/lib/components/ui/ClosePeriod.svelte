<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import { dashboardRefresh } from '$lib/stores/refresh';
	import { closeMonth } from '$lib/data/month';
	import { cap, monthName, monthLabel } from '$lib/utils/month';
	import type { MonthData } from '$lib/server/month';

	/** "Clôturer <mois>" — archives the period today and opens the next one (same amounts). */
	let { month, class: klass = '' }: { month: MonthData; class?: string } = $props();

	let busy = $state(false);
	const name = $derived(monthName(month.budget.month));

	async function close() {
		if (busy) return;
		const next = monthLabel(month.period.nextMonth);
		if (!confirm(`Clôturer ${name} ? ${next} commence aujourd'hui, avec les mêmes montants.`))
			return;
		busy = true;
		const res = await closeMonth(month);
		if (res.error) toast.error(res.error);
		else {
			await dashboardRefresh.trigger();
			toast.show(`${cap(name)} clôturé · bienvenue en ${next}`);
		}
		busy = false;
	}
</script>

<button type="button" class={klass} onclick={close} disabled={busy}>Clôturer {name}</button>

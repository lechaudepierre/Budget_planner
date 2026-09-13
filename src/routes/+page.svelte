<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import HeroRemaining from '$lib/components/dashboard/HeroRemaining.svelte';
	import TodoStrip from '$lib/components/dashboard/TodoStrip.svelte';
	import EnvelopeList from '$lib/components/dashboard/EnvelopeList.svelte';
	import FixedCostsChecklist from '$lib/components/dashboard/FixedCostsChecklist.svelte';
	import RecentTransactions from '$lib/components/dashboard/RecentTransactions.svelte';
	import SavingsSummary from '$lib/components/dashboard/SavingsSummary.svelte';
	import NetWorthTile from '$lib/components/dashboard/NetWorthTile.svelte';
	import CategoryExpensesModal from '$lib/components/dashboard/CategoryExpensesModal.svelte';
	import type { DashboardCategory } from '$lib/server/dashboard';

	let { data } = $props();
	const dashboard = $derived(data.dashboard);

	let selected = $state<DashboardCategory | null>(null);

	// Data comes from the server load; refresh it when the tab becomes visible again
	onMount(() => {
		const onVisible = () => {
			if (document.visibilityState === 'visible') void invalidate('app:dashboard');
		};
		document.addEventListener('visibilitychange', onVisible);
		return () => document.removeEventListener('visibilitychange', onVisible);
	});
</script>

<svelte:head>
	<title>Ce mois | Budget Planner</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-6">
	<div class="grid gap-4 lg:grid-cols-12">
		<div class="lg:col-span-8 xl:col-span-9"><HeroRemaining data={dashboard} /></div>
		<div class="lg:col-span-4 xl:col-span-3">
			<NetWorthTile accounts={dashboard.accounts} netWorth={dashboard.netWorth} />
		</div>
	</div>

	<TodoStrip todos={dashboard.todos} />

	<div class="grid gap-4 lg:grid-cols-12">
		<div class="lg:col-span-7 space-y-4">
			<EnvelopeList categories={dashboard.variable.categories} onSelect={(c) => (selected = c)} />
			<RecentTransactions items={dashboard.recent} />
		</div>
		<div class="lg:col-span-5 space-y-4">
			<FixedCostsChecklist
				categories={dashboard.fixed.categories}
				allocated={dashboard.fixed.allocated}
				spent={dashboard.fixed.spent}
				onSelect={(c) => (selected = c)}
			/>
			<SavingsSummary savings={dashboard.savings} />
		</div>
	</div>
</div>

{#if selected}
	<CategoryExpensesModal
		isOpen={true}
		categoryId={selected.id}
		categoryName={selected.name}
		categoryColor={selected.color}
		spent={selected.spent}
		budget={selected.allocated}
		onClose={() => (selected = null)}
	/>
{/if}

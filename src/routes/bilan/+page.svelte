<script lang="ts">
	import { onMount } from 'svelte';
	import { getCurrentMonth, navigateMonth, formatMonthDisplay } from '$lib/data/budgets';
	import { getMonthlyRecap, type MonthlyRecap } from '$lib/data/analytics';
	import RecapHeader from '$lib/components/bilan/RecapHeader.svelte';
	import RecapSummaryCard from '$lib/components/bilan/RecapSummaryCard.svelte';

	let currentMonth = $state(getCurrentMonth());
	let recapData = $state<MonthlyRecap | null>(null);
	let loading = $state(true);
	let isCurrentMonth = $derived(currentMonth === getCurrentMonth());

	async function loadData() {
		loading = true;
		const result = await getMonthlyRecap(currentMonth);
		recapData = result.data;
		loading = false;
	}

	function handlePrevMonth() {
		currentMonth = navigateMonth(currentMonth, 'prev');
		loadData();
	}

	function handleNextMonth() {
		currentMonth = navigateMonth(currentMonth, 'next');
		loadData();
	}

	onMount(() => {
		loadData();

		// Reload data when page becomes visible
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				loadData();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	});
</script>

<svelte:head>
	<title>Bilan - {formatMonthDisplay(currentMonth)}</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header with month navigation -->
	<RecapHeader
		month={currentMonth}
		{isCurrentMonth}
		onPrevMonth={handlePrevMonth}
		onNextMonth={handleNextMonth}
	/>

	<!-- Summary Cards -->
	{#if loading}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg text-sage"></span>
		</div>
	{:else if recapData}
		<RecapSummaryCard
			income={recapData.income}
			totalSpent={recapData.totalSpent}
			totalSaved={recapData.totalSaved}
			balance={recapData.balance}
		/>
	{:else}
		<div class="bg-cotton rounded-2xl p-8 text-center">
			<p class="text-stone-500">Aucune donnée pour ce mois</p>
		</div>
	{/if}
</div>

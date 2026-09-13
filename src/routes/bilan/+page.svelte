<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getActiveBudget,
		getAllBudgetPeriods,
		formatMonthDisplay,
		formatPeriodDisplay
	} from '$lib/data/budgets';
	import {
		getMonthlyRecap,
		getCategoryComparison,
		getSavingsProgress,
		type MonthlyRecap,
		type ComparisonResult,
		type SavingsProgressResult
	} from '$lib/data/analytics';
	import RecapHeader from '$lib/components/bilan/RecapHeader.svelte';
	import RecapSummaryCard from '$lib/components/bilan/RecapSummaryCard.svelte';
	import CategoryComparisonTable from '$lib/components/bilan/CategoryComparisonTable.svelte';
	import SavingsRecapCard from '$lib/components/bilan/SavingsRecapCard.svelte';
	import CategoryExpensesModal from '$lib/components/dashboard/CategoryExpensesModal.svelte';
	import ExpenseBreakdown from '$lib/components/dashboard/ExpenseBreakdown.svelte';
	import { archiveBudgetAndStartNew } from '$lib/data/budgets';
	import { finalizeMonthSavings } from '$lib/data/savings-allocations';
	import { formatCurrency } from '$lib/utils/currency';
	import { toast } from '$lib/stores/toast';

	// All budget periods in chronological order
	let periods = $state<string[]>([]);
	let currentIndex = $state(-1);
	let currentMonth = $derived(periods[currentIndex] ?? '');
	let activeBudgetMonth = $state('');
	let recapData = $state<MonthlyRecap | null>(null);
	let comparisonData = $state<ComparisonResult | null>(null);
	let savingsData = $state<SavingsProgressResult | null>(null);
	let loading = $state(true);
	let isCurrentMonth = $derived(currentMonth === activeBudgetMonth);
	let canGoPrev = $derived(currentIndex > 0);
	let canGoNext = $derived(currentIndex < periods.length - 1);
	let isArchiving = $state(false);
	let showArchiveModal = $state(false);
	let nextPeriodStartDate = $state(new Date().toISOString().split('T')[0]);

	// Modal state for category drill-down
	let showExpensesModal = $state(false);
	let selectedCategory = $state<{
		id: string;
		name: string;
		color: string;
		spent: number;
		budget: number;
	} | null>(null);

	async function loadData() {
		if (!currentMonth) return;
		loading = true;
		const [recapResult, comparisonResult, savingsResult] = await Promise.all([
			getMonthlyRecap(currentMonth),
			getCategoryComparison(currentMonth),
			getSavingsProgress(currentMonth)
		]);
		recapData = recapResult.data;
		comparisonData = comparisonResult.data;
		savingsData = savingsResult.data;
		loading = false;
	}

	function handlePrevMonth() {
		if (canGoPrev) {
			currentIndex--;
			loadData();
		}
	}

	function handleNextMonth() {
		if (canGoNext) {
			currentIndex++;
			loadData();
		}
	}

	function handleCategoryClick(categoryId: string) {
		const category = comparisonData?.categories.find((c) => c.categoryId === categoryId);
		if (category) {
			selectedCategory = {
				id: category.categoryId,
				name: category.name,
				color: category.color,
				spent: category.spent,
				budget: category.budget
			};
			showExpensesModal = true;
		}
	}

	function handleCloseModal() {
		showExpensesModal = false;
		selectedCategory = null;
	}

	async function handleArchive() {
		isArchiving = true;

		// 1. Finalize savings allocations before archiving
		const { error: finalizeError } = await finalizeMonthSavings(currentMonth);
		if (finalizeError) {
			toast.error("Erreur lors de la finalisation de l'épargne");
			isArchiving = false;
			return;
		}

		// 2. Perform the archive and start new period
		const { data: newBudget, error: archiveError } =
			await archiveBudgetAndStartNew(nextPeriodStartDate);

		isArchiving = false;
		showArchiveModal = false;

		if (archiveError) {
			toast.error(archiveError.message || "Erreur lors de l'archivage");
		} else if (newBudget) {
			// Reload all periods and jump to the new one
			const { data: allPeriods } = await getAllBudgetPeriods();
			periods = allPeriods;
			activeBudgetMonth = newBudget.month;
			currentIndex = periods.indexOf(newBudget.month);
			if (currentIndex === -1) currentIndex = periods.length - 1;
			toast.success('Période clôturée et épargne finalisée ! Nouvelle période créée.');
			await loadData();
		}
	}

	onMount(() => {
		(async () => {
			// Load all periods and active budget
			const [{ data: allPeriods }, { data: activeBudgetData }] = await Promise.all([
				getAllBudgetPeriods(),
				getActiveBudget()
			]);

			periods = allPeriods;

			if (activeBudgetData) {
				activeBudgetMonth = activeBudgetData.month;
				// Start on the active budget period
				currentIndex = periods.indexOf(activeBudgetData.month);
				if (currentIndex === -1) currentIndex = periods.length - 1;
			} else if (periods.length > 0) {
				currentIndex = periods.length - 1;
			}

			await loadData();
		})();

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
	<title
		>Bilan{recapData?.startDate
			? ' - ' + formatPeriodDisplay(recapData.startDate)
			: currentMonth
				? ' - ' + formatMonthDisplay(currentMonth)
				: ''}</title
	>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-6">
	<!-- Header with month navigation -->
	{#if currentMonth && recapData}
		<RecapHeader
			month={currentMonth}
			{isCurrentMonth}
			isArchived={recapData.isArchived}
			startDate={recapData.startDate}
			endDate={(recapData.isArchived ? recapData.endDate : null) ?? null}
			{canGoPrev}
			{canGoNext}
			onPrevMonth={handlePrevMonth}
			onNextMonth={handleNextMonth}
			onArchive={() => (showArchiveModal = true)}
		/>
	{/if}

	<!-- Summary Cards -->
	{#if loading}
		<div class="grid gap-4 md:grid-cols-4">
			{#each { length: 4 }, i (i)}
				<div class="card py-4">
					<div class="skeleton h-3 w-20 mb-3"></div>
					<div class="skeleton h-6 w-28"></div>
				</div>
			{/each}
		</div>
	{:else if recapData}
		<RecapSummaryCard
			income={recapData.income}
			totalSpent={recapData.totalSpent}
			totalSaved={recapData.totalSaved}
			balance={recapData.balance}
		/>

		<!-- Category Comparison Table -->
		{#if comparisonData}
			<CategoryComparisonTable
				categories={comparisonData.categories}
				totals={comparisonData.totals}
				onCategoryClick={handleCategoryClick}
			/>
		{/if}

		<!-- Savings Progress Card + spending breakdown -->
		<div class="grid gap-6 lg:grid-cols-2">
			<SavingsRecapCard savingsProgress={savingsData} />
			{#if comparisonData && comparisonData.categories.some((c) => c.spent > 0)}
				<ExpenseBreakdown
					categories={comparisonData.categories.map((c) => ({
						id: c.categoryId,
						name: c.name,
						color: c.color,
						type: 'variable' as const,
						allocated_amount: c.budget,
						spent: c.spent
					}))}
				/>
			{/if}
		</div>
	{:else}
		<div class="bg-cotton rounded-2xl p-8 text-center">
			<p class="text-stone-500">Aucune donnée pour ce mois</p>
		</div>
	{/if}
</div>

<!-- Category Expenses Modal -->
{#if selectedCategory}
	<CategoryExpensesModal
		isOpen={showExpensesModal}
		categoryId={selectedCategory.id}
		categoryName={selectedCategory.name}
		categoryColor={selectedCategory.color}
		spent={selectedCategory.spent}
		budget={selectedCategory.budget}
		month={currentMonth}
		onClose={handleCloseModal}
	/>
{/if}

<!-- Archive Period Confirmation Modal -->
{#if showArchiveModal}
	<div
		class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
		onclick={() => (showArchiveModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showArchiveModal = false)}
		role="button"
		tabindex="-1"
		aria-label="Fermer"
	></div>
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
		<div
			class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 pointer-events-auto animate-slide-up"
		>
			<h3 class="font-semibold text-xl text-coffee-900 mb-2">Clôturer la période ?</h3>
			<p class="text-stone-500 mb-4">
				Cette action va archiver la période actuelle et en créer une nouvelle.
			</p>

			<div class="bg-oat rounded-lg p-4 mb-6 space-y-4">
				<div class="flex flex-col gap-2">
					<label class="text-sm font-medium text-coffee-900" for="next-period-start">
						Date de début de la nouvelle période (réception salaire)
					</label>
					<input
						id="next-period-start"
						type="date"
						bind:value={nextPeriodStartDate}
						class="w-full px-3 py-2 border border-sand rounded-xl bg-white text-coffee-900 outline-none focus:ring-2 focus:ring-sage/50"
					/>
				</div>

				<div class="space-y-2 pt-2 border-t border-sand">
					<div class="flex justify-between text-sm">
						<span class="text-stone-500">Revenus</span>
						<span class="font-medium text-coffee-900">{formatCurrency(recapData?.income ?? 0)}</span
						>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-stone-500">Total dépensé</span>
						<span class="font-medium text-coffee-900"
							>{formatCurrency(recapData?.totalSpent ?? 0)}</span
						>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-stone-500">Total épargné</span>
						<span class="font-medium text-sage">{formatCurrency(recapData?.totalSaved ?? 0)}</span>
					</div>
				</div>
			</div>

			<div class="p-3 bg-sage/10 rounded-lg mb-6 flex items-start gap-2">
				<svg class="w-4 h-4 text-sage mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 13l4 4L19 7"
					/>
				</svg>
				<p class="text-xs text-sage leading-relaxed">
					La clôture finalise vos transferts d'épargne et prépare votre budget pour la nouvelle
					période.
				</p>
			</div>

			<div class="flex gap-3">
				<button
					type="button"
					onclick={() => (showArchiveModal = false)}
					class="btn flex-1 bg-oat border-sand text-coffee-900 hover:bg-sand"
					disabled={isArchiving}
				>
					Annuler
				</button>
				<button
					type="button"
					onclick={handleArchive}
					class="btn flex-1 bg-terracotta hover:bg-terracotta-dark border-none text-white gap-2"
					disabled={isArchiving}
				>
					{#if isArchiving}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					Clôturer la période
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(20px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.2s ease-out;
	}

	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}
</style>

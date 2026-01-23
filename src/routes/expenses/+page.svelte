<script lang="ts">
	import { onMount } from 'svelte';
	import { getExpenses } from '$lib/data/expenses';
	import { getCategories } from '$lib/data/budgets';
	import { formatCurrency } from '$lib/utils/currency';
	import type { ExpenseWithCategory } from '$lib/types/database';
	import type { Database } from '$lib/types/database';
	import ExpenseListItem from '$lib/components/expense/ExpenseListItem.svelte';
	import AddExpenseModal from '$lib/components/expense/AddExpenseModal.svelte';
	import EditExpenseModal from '$lib/components/expense/EditExpenseModal.svelte';

	type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];

	// State
	let expenses = $state<ExpenseWithCategory[]>([]);
	let categories = $state<BudgetCategory[]>([]);
	let loading = $state(true);
	let hasMore = $state(true);
	let page = $state(0);
	const PAGE_SIZE = 30;

	// Filters
	let selectedCategoryId = $state<string>('');
	let dateRange = $state<'this-month' | 'last-month' | 'last-3-months' | 'all' | 'custom'>(
		'this-month'
	);
	let customStartDate = $state('');
	let customEndDate = $state('');

	// Modals
	let showAddModal = $state(false);
	let showEditModal = $state(false);
	let selectedExpense = $state<ExpenseWithCategory | null>(null);

	// Computed total for filtered results
	let totalFiltered = $derived(expenses.reduce((sum, e) => sum + Number(e.amount), 0));

	// Date range presets
	const dateRangeOptions = [
		{ value: 'this-month', label: 'Ce mois' },
		{ value: 'last-month', label: 'Mois dernier' },
		{ value: 'last-3-months', label: '3 derniers mois' },
		{ value: 'all', label: 'Tout' },
		{ value: 'custom', label: 'Personnalisé' }
	] as const;

	function getDateRangeFromPreset(preset: string): { startDate: string; endDate: string } | null {
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth();

		switch (preset) {
			case 'this-month':
				return {
					startDate: new Date(year, month, 1).toISOString().split('T')[0],
					endDate: new Date(year, month + 1, 0).toISOString().split('T')[0]
				};
			case 'last-month':
				return {
					startDate: new Date(year, month - 1, 1).toISOString().split('T')[0],
					endDate: new Date(year, month, 0).toISOString().split('T')[0]
				};
			case 'last-3-months':
				return {
					startDate: new Date(year, month - 2, 1).toISOString().split('T')[0],
					endDate: new Date(year, month + 1, 0).toISOString().split('T')[0]
				};
			case 'all':
				return null;
			default:
				return null;
		}
	}

	onMount(async () => {
		const { data: cats } = await getCategories();
		categories = cats;
		await loadExpenses();
	});

	async function loadExpenses(reset = false) {
		if (reset) {
			page = 0;
			hasMore = true;
		}

		loading = true;

		// Build filter options
		const options: Parameters<typeof getExpenses>[0] = {
			limit: PAGE_SIZE,
			offset: page * PAGE_SIZE
		};

		if (selectedCategoryId) {
			options.categoryId = selectedCategoryId;
		}

		// Date range
		if (dateRange === 'custom') {
			if (customStartDate) options.startDate = customStartDate;
			if (customEndDate) options.endDate = customEndDate;
		} else {
			const range = getDateRangeFromPreset(dateRange);
			if (range) {
				options.startDate = range.startDate;
				options.endDate = range.endDate;
			}
		}

		const { data, count } = await getExpenses(options);

		if (data.length < PAGE_SIZE) {
			hasMore = false;
		}

		if (reset || page === 0) {
			expenses = data;
		} else {
			expenses = [...expenses, ...data];
		}

		loading = false;
	}

	async function loadMore() {
		page++;
		await loadExpenses();
	}

	function handleFilterChange() {
		loadExpenses(true);
	}

	function clearFilters() {
		selectedCategoryId = '';
		dateRange = 'this-month';
		customStartDate = '';
		customEndDate = '';
		loadExpenses(true);
	}

	function handleExpenseClick(expense: ExpenseWithCategory) {
		selectedExpense = expense;
		showEditModal = true;
	}

	function handleExpenseAdded() {
		loadExpenses(true);
	}

	function handleExpenseSaved() {
		loadExpenses(true);
	}

	function handleExpenseDeleted() {
		loadExpenses(true);
	}

	const hasActiveFilters = $derived(selectedCategoryId || dateRange !== 'this-month');
</script>

<svelte:head>
	<title>Transactions | Budget Planner</title>
</svelte:head>

<div class="max-w-4xl mx-auto">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-semibold text-coffee-900">Transactions</h1>
		<button
			class="btn bg-sage hover:bg-sage-dark text-white border-none gap-2 rounded-xl"
			onclick={() => (showAddModal = true)}
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5" />
			</svg>
			Ajouter
		</button>
	</div>

	<!-- Filters -->
	<div class="bg-cotton border border-sand rounded-xl p-4 mb-4">
		<div class="flex flex-wrap gap-4">
			<!-- Category Filter -->
			<div class="form-control w-full sm:w-auto">
				<label class="label py-1" for="category-filter">
					<span class="text-sm text-stone-500">Catégorie</span>
				</label>
				<select
					id="category-filter"
					class="select select-sm bg-white border-sand focus:border-sage focus:ring-sage text-coffee-900"
					bind:value={selectedCategoryId}
					onchange={handleFilterChange}
				>
					<option value="">Toutes les catégories</option>
					{#each categories as category}
						<option value={category.id}>{category.name}</option>
					{/each}
				</select>
			</div>

			<!-- Date Range Filter -->
			<div class="form-control w-full sm:w-auto">
				<label class="label py-1" for="date-range">
					<span class="text-sm text-stone-500">Période</span>
				</label>
				<select
					id="date-range"
					class="select select-sm bg-white border-sand focus:border-sage focus:ring-sage text-coffee-900"
					bind:value={dateRange}
					onchange={handleFilterChange}
				>
					{#each dateRangeOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<!-- Custom Date Range -->
			{#if dateRange === 'custom'}
				<div class="form-control">
					<label class="label py-1" for="start-date">
						<span class="text-sm text-stone-500">Du</span>
					</label>
					<input
						type="date"
						id="start-date"
						class="input input-sm bg-white border-sand focus:border-sage focus:ring-sage text-coffee-900"
						bind:value={customStartDate}
						onchange={handleFilterChange}
					/>
				</div>
				<div class="form-control">
					<label class="label py-1" for="end-date">
						<span class="text-sm text-stone-500">Au</span>
					</label>
					<input
						type="date"
						id="end-date"
						class="input input-sm bg-white border-sand focus:border-sage focus:ring-sage text-coffee-900"
						bind:value={customEndDate}
						onchange={handleFilterChange}
					/>
				</div>
			{/if}

			<!-- Clear Filters -->
			{#if hasActiveFilters}
				<div class="form-control justify-end">
					<label class="label py-1">
						<span class="text-sm invisible">Action</span>
					</label>
					<button class="btn btn-ghost btn-sm text-stone-500 hover:text-coffee-900" onclick={clearFilters}> Effacer les filtres </button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Summary -->
	{#if !loading && expenses.length > 0}
		<div class="bg-oat rounded-xl p-4 mb-4 flex justify-between items-center">
			<span class="text-sm text-stone-600">
				{expenses.length} transaction{expenses.length > 1 ? 's' : ''}
			</span>
			<span class="font-semibold text-coffee-900"> Total: <span class="text-terracotta">{formatCurrency(totalFiltered)}</span> </span>
		</div>
	{/if}

	<!-- Expense List -->
	{#if loading && expenses.length === 0}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg text-sage"></span>
		</div>
	{:else if expenses.length === 0}
		<div class="bg-cotton border border-sand rounded-xl p-8 text-center">
			<div class="w-16 h-16 bg-oat rounded-full flex items-center justify-center mx-auto mb-4">
				<svg class="w-8 h-8 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</div>
			{#if hasActiveFilters}
				<h2 class="text-lg font-semibold text-coffee-900 mb-2">Aucune dépense trouvée</h2>
				<p class="text-stone-500 mb-4">Aucune dépense ne correspond à vos filtres.</p>
				<button class="btn btn-outline border-sand text-stone-600 hover:bg-oat hover:border-sand btn-sm" onclick={clearFilters}> Effacer les filtres </button>
			{:else}
				<h2 class="text-lg font-semibold text-coffee-900 mb-2">Aucune transaction</h2>
				<p class="text-stone-500 mb-4">
					Ajoutez votre première dépense pour commencer à suivre vos finances.
				</p>
				<button
					class="btn bg-sage hover:bg-sage-dark text-white border-none rounded-xl"
					onclick={() => (showAddModal = true)}
				>
					Ajouter une dépense
				</button>
			{/if}
		</div>
	{:else}
		<div class="space-y-2">
			{#each expenses as expense (expense.id)}
				<ExpenseListItem {expense} onclick={() => handleExpenseClick(expense)} />
			{/each}
		</div>

		{#if hasMore}
			<div class="flex justify-center mt-6">
				<button class="btn btn-outline border-sage text-sage hover:bg-sage hover:text-white hover:border-sage rounded-xl" onclick={loadMore} disabled={loading}>
					{#if loading}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					Charger plus
				</button>
			</div>
		{/if}
	{/if}
</div>

<!-- Add Expense Modal -->
<AddExpenseModal bind:open={showAddModal} onExpenseAdded={handleExpenseAdded} />

<!-- Edit Expense Modal -->
{#if selectedExpense}
	<EditExpenseModal
		expense={selectedExpense}
		{categories}
		bind:open={showEditModal}
		onSave={handleExpenseSaved}
		onDelete={handleExpenseDeleted}
	/>
{/if}

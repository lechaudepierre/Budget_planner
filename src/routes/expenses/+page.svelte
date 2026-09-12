<script lang="ts">
	import { onMount } from 'svelte';
	import { getExpenses, createExpense } from '$lib/data/expenses';
	import { getCategories, getActiveBudget } from '$lib/data/budgets';
	import { getAccounts } from '$lib/data/accounts';
	import { formatCurrency } from '$lib/utils/currency';
	import { toast } from '$lib/stores/toast';
	import { dashboardRefresh } from '$lib/stores/refresh';
	import type { ExpenseWithCategory } from '$lib/types/database';
	import type { Database } from '$lib/types/database';
	import ExpenseListItem from '$lib/components/expense/ExpenseListItem.svelte';
	import InlineAddRow from '$lib/components/expense/inline-add-row.svelte';
	import MonthYearPicker from '$lib/components/ui/MonthYearPicker.svelte';

	type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];
	type Account = Database['public']['Tables']['accounts']['Row'];

	// State
	let expenses = $state<ExpenseWithCategory[]>([]);
	let categories = $state<BudgetCategory[]>([]);
	let accounts = $state<Account[]>([]);
	let loading = $state(true);
	let hasMore = $state(true);
	let page = $state(0);
	const PAGE_SIZE = 30;

	// Inline add row state
	let confirmedId = $state<string | null>(null);
	let isSubmitting = $state(false);
	let repopulateData = $state<{
		date: string;
		amount: number;
		category_id: string;
		account_id: string | null;
		description: string | null;
	} | null>(null);
	let ariaMessage = $state('');

	// Filters
	let selectedCategoryId = $state<string>('');
	let dateRange = $state<'active-period' | 'this-month' | 'last-month' | 'last-3-months' | 'all' | 'custom'>(
		'active-period'
	);
	// Active budget period dates (fetched on mount)
	let activePeriodStart = $state<string | null>(null);
	let activePeriodEnd = $state<string | null>(null);
	// Store as YYYY-MM format for month pickers
	let customStartMonth = $state('');
	let customEndMonth = $state('');

	// Computed total for filtered results
	let totalFiltered = $derived(expenses.reduce((sum, e) => sum + Number(e.amount), 0));

	// Date range presets
	const dateRangeOptions = [
		{ value: 'active-period', label: 'Période actuelle' },
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
		const [{ data: cats }, { data: accts }, { data: activeBudget }] = await Promise.all([
			getCategories(),
			getAccounts(),
			getActiveBudget()
		]);
		categories = cats;
		accounts = accts || [];
		if (activeBudget) {
			activePeriodStart = activeBudget.start_date;
			activePeriodEnd = activeBudget.end_date ?? null;
		}
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
		if (dateRange === 'active-period') {
			if (activePeriodStart) options.startDate = activePeriodStart;
			if (activePeriodEnd) options.endDate = activePeriodEnd;
		} else if (dateRange === 'custom') {
			// Convert YYYY-MM to first/last day of month
			if (customStartMonth) options.startDate = customStartMonth + '-01';
			if (customEndMonth) {
				// Get last day of the month
				const [year, month] = customEndMonth.split('-').map(Number);
				const lastDay = new Date(year, month, 0).getDate();
				options.endDate = `${customEndMonth}-${String(lastDay).padStart(2, '0')}`;
			}
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
			// Deduplicate: an optimistic insert may have shifted DB offsets,
			// causing the boundary item to come back in the next page.
			const existingIds = new Set(expenses.map((e) => e.id));
			expenses = [...expenses, ...data.filter((e) => !existingIds.has(e.id))];
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
		dateRange = 'active-period';
		customStartMonth = '';
		customEndMonth = '';
		loadExpenses(true);
	}

	function isDateInCurrentFilter(date: string): boolean {
		if (dateRange === 'all') return true;
		if (dateRange === 'active-period') {
			return (!activePeriodStart || date >= activePeriodStart) &&
				(!activePeriodEnd || date <= activePeriodEnd);
		}
		if (dateRange === 'custom') {
			const start = customStartMonth ? customStartMonth + '-01' : null;
			let end: string | null = null;
			if (customEndMonth) {
				const [year, month] = customEndMonth.split('-').map(Number);
				const lastDay = new Date(year, month, 0).getDate();
				end = `${customEndMonth}-${String(lastDay).padStart(2, '0')}`;
			}
			return (!start || date >= start) && (!end || date <= end);
		}
		const range = getDateRangeFromPreset(dateRange);
		if (!range) return true;
		return date >= range.startDate && date <= range.endDate;
	}

	async function handleInlineSubmit(data: {
		date: string;
		amount: number;
		category_id: string;
		account_id: string | null;
		description: string | null;
	}) {
		// Bug 1 fix: prevent double-submission during async save
		if (isSubmitting) return;
		isSubmitting = true;

		const tempId = `temp-${Date.now()}`;
		const inFilter = isDateInCurrentFilter(data.date);

		// Build optimistic expense object
		const category = categories.find((c) => c.id === data.category_id);
		const account = accounts.find((a) => a.id === data.account_id);

		const optimisticExpense: ExpenseWithCategory = {
			id: tempId,
			user_id: '',
			category_id: data.category_id,
			account_id: data.account_id,
			amount: data.amount,
			bank_amount: null,
			source: 'manual',
			merchant: null,
			is_pending: false,
			description: data.description,
			date: data.date,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			category: category
				? { id: category.id, name: category.name, color: category.color }
				: null,
			account: account ? { id: account.id, name: account.name } : null
		};

		// Bug 3 fix: only insert optimistically if the date falls within the current filter.
		// An out-of-filter insert would corrupt the visible list and disappear on next reload.
		if (inFilter) {
			// Insert at correct chronological position (date DESC, created_at DESC)
			const insertIndex = expenses.findIndex((e) => e.date <= data.date);
			if (insertIndex === -1) {
				expenses = [...expenses, optimisticExpense];
			} else {
				expenses = [
					...expenses.slice(0, insertIndex),
					optimisticExpense,
					...expenses.slice(insertIndex)
				];
			}

			// Sage fade animation
			confirmedId = tempId;
			setTimeout(() => {
				confirmedId = null;
			}, 400);
		}

		// Clear any previous repopulate data
		repopulateData = null;

		// Aria announcement
		ariaMessage = 'Transaction ajoutée';
		setTimeout(() => {
			ariaMessage = '';
		}, 1000);

		try {
			// Save to DB
			const { data: saved, error } = await createExpense(data);

			if (error) {
				// Remove optimistic row if it was inserted
				if (inFilter) {
					expenses = expenses.filter((e) => e.id !== tempId);
				}
				// Re-populate add row with failed data
				repopulateData = { ...data };
				toast.error(error.message);
				return;
			}

			if (inFilter && saved) {
				// Replace temp ID with real ID
				expenses = expenses.map((e) => (e.id === tempId ? { ...e, id: saved.id } : e));
			} else if (!inFilter) {
				// Expense saved but outside current filter: reload to keep list consistent
				await loadExpenses(true);
			}

			// Trigger dashboard refresh
			dashboardRefresh.trigger();
		} finally {
			isSubmitting = false;
		}
	}

	function handleExpenseSaved() {
		loadExpenses(true);
	}

	function handleExpenseDeleted() {
		loadExpenses(true);
	}

	const hasActiveFilters = $derived(selectedCategoryId || dateRange !== 'active-period');
</script>

<svelte:head>
	<title>Transactions | Budget Planner</title>
</svelte:head>

<div class="max-w-4xl mx-auto h-[calc(100vh-136px)] flex flex-col overflow-hidden">
	<!-- Header (Fixed) -->
	<div class="flex-none mb-6">
		<h1 class="text-2xl font-semibold text-coffee-900">Transactions</h1>
	</div>

	<!-- Filters & Summary Area (Fixed) -->
	<div class="flex-none pb-4 space-y-4">
		<!-- Filters -->
		<div class="bg-cotton border border-sand rounded-xl p-4 shadow-sm">
			<div class="flex flex-wrap gap-4 items-end">
				<!-- Category Filter -->
				<div class="w-full sm:w-auto sm:min-w-[180px]">
					<label class="block text-sm text-stone-500 mb-1.5" for="category-filter">
						Catégorie
					</label>
					<select
						id="category-filter"
						class="w-full px-3 py-2 border border-sand rounded-xl bg-white text-coffee-900 text-sm outline-none transition-all focus:ring-2 focus:ring-sage/50 focus:border-sage appearance-none cursor-pointer"
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
				<div class="w-full sm:w-auto sm:min-w-[160px]">
					<label class="block text-sm text-stone-500 mb-1.5" for="date-range"> Période </label>
					<select
						id="date-range"
						class="w-full px-3 py-2 border border-sand rounded-xl bg-white text-coffee-900 text-sm outline-none transition-all focus:ring-2 focus:ring-sage/50 focus:border-sage appearance-none cursor-pointer"
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
					<div class="w-full sm:w-auto sm:min-w-[180px]">
						<label class="block text-sm text-stone-500 mb-1.5" for="start-month"> Du </label>
						<MonthYearPicker
							id="start-month"
							bind:value={customStartMonth}
							placeholder="Mois de début"
							onchange={handleFilterChange}
						/>
					</div>
					<div class="w-full sm:w-auto sm:min-w-[180px]">
						<label class="block text-sm text-stone-500 mb-1.5" for="end-month"> Au </label>
						<MonthYearPicker
							id="end-month"
							bind:value={customEndMonth}
							placeholder="Mois de fin"
							onchange={handleFilterChange}
						/>
					</div>
				{/if}

				<!-- Clear Filters -->
				{#if hasActiveFilters}
					<button
						class="px-4 py-2 text-sm text-stone-500 hover:text-coffee-900 hover:bg-oat rounded-xl transition-colors"
						onclick={clearFilters}
					>
						Effacer les filtres
					</button>
				{/if}
			</div>
		</div>

		<!-- Summary Card -->
		{#if !loading && expenses.length > 0}
			<div
				class="bg-oat border border-stone-200 rounded-xl p-4 flex justify-between items-center shadow-sm"
			>
				<span class="text-sm text-stone-600">
					{expenses.length} transaction{expenses.length > 1 ? 's' : ''}
				</span>
				<span class="font-semibold text-coffee-900">
					Total: <span class="text-terracotta">{formatCurrency(totalFiltered)}</span>
				</span>
			</div>
		{/if}
	</div>

	<!-- Transaction Table (Internal Scrollable Area) -->
	<div class="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-8">
		{#if loading && expenses.length === 0}
			<div class="flex justify-center py-12">
				<span class="loading loading-spinner loading-lg text-sage"></span>
			</div>
		{:else}
			<div class="bg-cotton border border-sand/60 rounded-xl overflow-hidden shadow-sm">
			<div role="grid" aria-label="Liste des transactions">
				<!-- Inline Add Row -->
				<InlineAddRow
					{categories}
					{accounts}
					onSubmit={handleInlineSubmit}
					disabled={isSubmitting}
					{repopulateData}
				/>

				<!-- Transaction rows -->
				{#each expenses as expense (expense.id)}
					<ExpenseListItem
						{expense}
						{categories}
						{accounts}
						onSave={handleExpenseSaved}
						onDelete={handleExpenseDeleted}
						confirmState={confirmedId === expense.id ? 'confirmed' : 'idle'}
					/>
				{/each}
			</div>
			</div>

			{#if expenses.length === 0}
				<div class="py-8 text-center">
					{#if hasActiveFilters}
						<p class="text-stone-500 mb-3">Aucune dépense ne correspond à vos filtres.</p>
						<button
							class="px-4 py-2 text-sm border border-sand text-stone-600 hover:bg-oat rounded-xl transition-colors"
							onclick={clearFilters}
						>
							Effacer les filtres
						</button>
					{:else}
						<p class="text-stone-500">Ajoutez votre première dépense ci-dessus.</p>
					{/if}
				</div>
			{/if}

			{#if hasMore && expenses.length > 0}
				<div class="flex justify-center mt-6">
					<button
						class="px-6 py-2.5 border border-sage text-sage hover:bg-sage hover:text-white rounded-xl transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
						onclick={loadMore}
						disabled={loading}
					>
						{#if loading}
							<span class="loading loading-spinner loading-sm"></span>
						{/if}
						Charger plus
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Aria live region for screen readers -->
<div aria-live="polite" class="sr-only">
	{#if ariaMessage}{ariaMessage}{/if}
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #e5e7eb;
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #d1d5db;
	}
</style>

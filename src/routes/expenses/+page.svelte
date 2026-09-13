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
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

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
	let search = $state('');
	let searchTimer: ReturnType<typeof setTimeout> | null = null;
	let selectedCategoryId = $state<string>('');
	let dateRange = $state<
		'active-period' | 'this-month' | 'last-month' | 'last-3-months' | 'all' | 'custom'
	>('active-period');
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
		{ value: 'active-period', label: 'Période' },
		{ value: 'this-month', label: 'Ce mois' },
		{ value: 'last-month', label: 'Mois dernier' },
		{ value: 'last-3-months', label: '3 mois' },
		{ value: 'all', label: 'Tout' },
		{ value: 'custom', label: 'Perso' }
	] as const;
	type DateRange = (typeof dateRangeOptions)[number]['value'];

	// Transactions grouped by day (list is already sorted date desc)
	const groups = $derived.by(() => {
		const out: { date: string; label: string; total: number; items: ExpenseWithCategory[] }[] = [];
		for (const e of expenses) {
			const last = out[out.length - 1];
			if (last && last.date === e.date) {
				last.items.push(e);
				last.total += Number(e.amount);
			} else {
				out.push({ date: e.date, label: dayLabel(e.date), total: Number(e.amount), items: [e] });
			}
		}
		return out;
	});

	function dayLabel(date: string): string {
		const d = new Date(date + 'T00:00:00');
		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);
		const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
		if (same(d, today)) return "Aujourd'hui";
		if (same(d, yesterday)) return 'Hier';
		const label = d.toLocaleDateString('fr-FR', {
			weekday: 'short',
			day: 'numeric',
			month: 'long'
		});
		return label.charAt(0).toUpperCase() + label.slice(1);
	}

	function handleSearchInput() {
		if (searchTimer) clearTimeout(searchTimer);
		searchTimer = setTimeout(() => loadExpenses(true), 250);
	}

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
		if (search.trim()) {
			options.search = search;
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
		search = '';
		selectedCategoryId = '';
		dateRange = 'active-period';
		customStartMonth = '';
		customEndMonth = '';
		loadExpenses(true);
	}

	function isDateInCurrentFilter(date: string): boolean {
		if (dateRange === 'all') return true;
		if (dateRange === 'active-period') {
			return (
				(!activePeriodStart || date >= activePeriodStart) &&
				(!activePeriodEnd || date <= activePeriodEnd)
			);
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
			category: category ? { id: category.id, name: category.name, color: category.color } : null,
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

	const hasActiveFilters = $derived(
		Boolean(search.trim()) || Boolean(selectedCategoryId) || dateRange !== 'active-period'
	);
</script>

<svelte:head>
	<title>Transactions | Budget Planner</title>
</svelte:head>

<div class="max-w-5xl mx-auto space-y-4">
	<!-- Filters -->
	<div class="card py-3 px-4 space-y-3">
		<div class="flex flex-wrap items-center gap-3">
			<label class="relative flex-1 min-w-52">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
					<Icon name="search" size={16} />
				</span>
				<input
					type="search"
					class="input-base pl-9"
					placeholder="Rechercher un commerçant, une description…"
					bind:value={search}
					oninput={handleSearchInput}
					aria-label="Rechercher"
				/>
			</label>

			<select
				class="input-base w-auto min-w-44 cursor-pointer"
				bind:value={selectedCategoryId}
				onchange={handleFilterChange}
				aria-label="Catégorie"
			>
				<option value="">Toutes les catégories</option>
				{#each categories as category (category.id)}
					<option value={category.id}>{category.name}</option>
				{/each}
			</select>
		</div>

		<div class="flex flex-wrap items-center gap-3">
			<div class="overflow-x-auto -mx-1 px-1">
				<SegmentedControl
					options={[...dateRangeOptions]}
					bind:value={dateRange}
					onchange={(v: DateRange) => {
						dateRange = v;
						handleFilterChange();
					}}
				/>
			</div>

			{#if dateRange === 'custom'}
				<div class="flex items-center gap-2">
					<MonthYearPicker
						id="start-month"
						bind:value={customStartMonth}
						placeholder="Du"
						onchange={handleFilterChange}
					/>
					<span class="text-stone-400 text-sm">→</span>
					<MonthYearPicker
						id="end-month"
						bind:value={customEndMonth}
						placeholder="Au"
						onchange={handleFilterChange}
					/>
				</div>
			{/if}

			<div class="ml-auto flex items-center gap-3 text-sm">
				{#if !loading || expenses.length > 0}
					<span class="text-stone-500">
						<strong class="text-coffee-900 num">{expenses.length}</strong>
						transaction{expenses.length > 1 ? 's' : ''}
						· <strong class="text-terracotta num">{formatCurrency(totalFiltered)}</strong>
					</span>
				{/if}
				{#if hasActiveFilters}
					<button type="button" class="btn-ghost-soft py-1.5" onclick={clearFilters}>Effacer</button
					>
				{/if}
			</div>
		</div>
	</div>

	<!-- List -->
	<div class="card p-0 overflow-hidden">
		<div class="overflow-x-auto">
			<div class="min-w-[680px]" role="grid" aria-label="Liste des transactions">
				<InlineAddRow
					{categories}
					{accounts}
					onSubmit={handleInlineSubmit}
					disabled={isSubmitting}
					{repopulateData}
				/>

				{#if loading && expenses.length === 0}
					<div class="px-4 py-3 space-y-3" aria-busy="true">
						{#each { length: 8 }, i (i)}
							<div class="flex items-center gap-4">
								<div class="skeleton h-4 w-20"></div>
								<div class="skeleton h-4 w-16"></div>
								<div class="skeleton h-4 w-28"></div>
								<div class="skeleton h-4 flex-1"></div>
							</div>
						{/each}
					</div>
				{:else}
					{#each groups as group (group.date)}
						<div
							class="flex items-center justify-between px-4 py-1.5 bg-oat/70 border-b border-sand/60 text-xs"
						>
							<span class="font-medium text-coffee-900">{group.label}</span>
							<span class="num text-stone-500"
								>{group.items.length} ·
								<span class="text-terracotta">-{formatCurrency(group.total)}</span></span
							>
						</div>
						{#each group.items as expense (expense.id)}
							<ExpenseListItem
								{expense}
								{categories}
								{accounts}
								onSave={handleExpenseSaved}
								onDelete={handleExpenseDeleted}
								confirmState={confirmedId === expense.id ? 'confirmed' : 'idle'}
							/>
						{/each}
					{/each}
				{/if}
			</div>
		</div>

		{#if !loading && expenses.length === 0}
			{#if hasActiveFilters}
				<EmptyState
					compact
					icon="search"
					title="Aucune transaction ne correspond"
					text="Essaie d'élargir la période ou d'effacer les filtres."
					ctaLabel="Effacer les filtres"
					onCta={clearFilters}
				/>
			{:else}
				<EmptyState
					compact
					icon="upload"
					title="Aucune transaction sur la période"
					text="Importe un relevé bancaire ou ajoute une dépense sur la ligne du haut."
					ctaLabel="Importer un relevé"
					ctaHref="/import"
				/>
			{/if}
		{/if}
	</div>

	{#if hasMore && expenses.length > 0}
		<div class="flex justify-center">
			<button type="button" class="btn-secondary" onclick={loadMore} disabled={loading}>
				{#if loading}<span class="loading loading-spinner loading-xs"></span>{/if}
				Charger plus
			</button>
		</div>
	{/if}
</div>

<!-- Aria live region for screen readers -->
<div aria-live="polite" class="sr-only">
	{#if ariaMessage}{ariaMessage}{/if}
</div>

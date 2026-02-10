<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getActiveBudget,
		getLastArchivedBudget,
		saveMonthlyBudget,
		updateBudgetStartDate,
		formatMonthDisplay,
		getCurrentMonth,
		getCategories,
		createCategory,
		deleteCategory,
		updateCategory,
		getCategoryBudgets,
		saveCategoryBudget,
		getBudgetHistory,
		archiveBudgetAndStartNew,
		type BudgetHistoryMonth
	} from '$lib/data/budgets';
	import {
		getPreviousMonthComparison,
		getSavingsProgress,
		type PreviousMonthData
	} from '$lib/data/analytics';
	import { finalizeMonthSavings } from '$lib/data/savings-allocations';
	import { formatCurrency } from '$lib/utils/currency';
	import { validateMonthlyBudget } from '$lib/schemas/budget';
	import { toast } from '$lib/stores/toast';
	import CategoryForm from '$lib/components/budget/CategoryForm.svelte';
	import AllocationRow from '$lib/components/budget/AllocationRow.svelte';
	import BudgetSummary from '$lib/components/budget/BudgetSummary.svelte';
	import BudgetHistorySection from '$lib/components/budget/BudgetHistorySection.svelte';
	import IncomeEntries from '$lib/components/budget/IncomeEntries.svelte';
	import type { Database } from '$lib/types/database';

	type MonthlyBudget = Database['public']['Tables']['monthly_budgets']['Row'];
	type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];

	// State
	let budget = $state<MonthlyBudget | null>(null);
	let categories = $state<BudgetCategory[]>([]);
	let allocations = $state<Map<string, number>>(new Map());
	let incomeTotal = $state(0);
	let incomeLoaded = $state(false);
	let incomeInput = $state('');
	let isLoading = $state(true);
	let isSaving = $state(false);
	let error = $state('');
	let showAddCategoryModal = $state(false);
	let isAddingCategory = $state(false);
	let categoryToDelete = $state<BudgetCategory | null>(null);
	let isEditingIncome = $state(false);
	let isEditingStartDate = $state(false);
	let startDateInput = $state('');
	let previousMonthData = $state<Map<string, PreviousMonthData>>(new Map());
	let showPreviousMonthHints = $state(true);
	let totalSavingsAllocated = $state(0);

	const HINTS_PREFERENCE_KEY = 'budget_show_previous_month_hints';

	// Derived
	let monthDisplay = $derived(budget ? formatMonthDisplay(budget.month) : 'Nouvelle période');
	let totalAllocated = $derived(
		Array.from(allocations.values()).reduce((sum, amt) => sum + amt, 0)
	);
	let currentIncome = $derived(incomeLoaded ? incomeTotal : (budget?.income ?? 0));
	let currentMonth = $derived(budget?.month ?? getNewMonth());

	// Separate categories by type
	let fixedCategories = $derived(categories.filter((c) => c.type === 'fixed'));
	let variableCategories = $derived(categories.filter((c) => c.type === 'variable'));

	// Calculate totals by type
	let fixedTotal = $derived(
		fixedCategories.reduce((sum, c) => sum + (allocations.get(c.id) ?? 0), 0)
	);
	let variableTotal = $derived(
		variableCategories.reduce((sum, c) => sum + (allocations.get(c.id) ?? 0), 0)
	);

	function getNewMonth(): string {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
	}

	onMount(() => {
		loadData();

		// Load user preference for showing previous month hints
		const savedPref = localStorage.getItem(HINTS_PREFERENCE_KEY);
		if (savedPref !== null) {
			showPreviousMonthHints = savedPref === 'true';
		}

		// Reload data when page becomes visible (user navigates back)
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

	// Save hints preference when it changes
	$effect(() => {
		localStorage.setItem(HINTS_PREFERENCE_KEY, String(showPreviousMonthHints));
	});

	// History logic removed - handled in Bilan page

	async function loadData() {
		isLoading = true;
		error = '';
		incomeLoaded = false;

		// Load active budget and categories
		const [budgetResult, categoriesResult] = await Promise.all([
			getActiveBudget(),
			getCategories()
		]);

		if (budgetResult.error) {
			error = 'Erreur lors du chargement';
			toast.error('Erreur lors du chargement du budget');
		} else if (budgetResult.data) {
			budget = budgetResult.data;
			incomeInput = budgetResult.data.income.toString();
			startDateInput = budgetResult.data.start_date;

			// Auto-fix start_date if it defaults to month-01 but a previous period exists
			const expectedDefault = `${budgetResult.data.month}-01`;
			if (budgetResult.data.start_date === expectedDefault) {
				const { data: lastArchived } = await getLastArchivedBudget();
				if (lastArchived?.end_date) {
					const d = new Date(lastArchived.end_date);
					d.setDate(d.getDate() + 1);
					const correctStart = d.toISOString().split('T')[0];
					if (correctStart !== expectedDefault) {
						const { data: fixed } = await updateBudgetStartDate(budgetResult.data.id, correctStart);
						if (fixed) {
							budget = fixed;
							startDateInput = fixed.start_date;
						}
					}
				}
			}

			// Load allocations for this budget's month
			const { data: allocs } = await getCategoryBudgets(budgetResult.data.month);
			if (allocs) {
				const newAllocations = new Map<string, number>();
				for (const alloc of allocs) {
					// Convert NUMERIC from Supabase (can be string) to number
					newAllocations.set(alloc.category_id, Number(alloc.amount) || 0);
				}
				allocations = newAllocations;
			}
		} else {
			// No active budget, try to get last archived for pre-fill
			budget = null;
			allocations = new Map();
			const { data: lastBudget } = await getLastArchivedBudget();
			if (lastBudget) {
				incomeInput = lastBudget.income.toString();
			} else {
				incomeInput = '';
			}
		}

		if (categoriesResult.error) {
			toast.error('Erreur lors du chargement des catégories');
		} else {
			categories = categoriesResult.data;
		}

		// Load savings allocations for this month
		if (budgetResult.data?.month) {
			const { data: savings } = await getSavingsProgress(budgetResult.data.month);
			if (savings) {
				totalSavingsAllocated = savings.totalAllocated;
			}
		}

		// Load previous month comparison data for hints
		if (budgetResult.data?.month) {
			const { data: prevData } = await getPreviousMonthComparison(budgetResult.data.month);
			if (prevData) {
				previousMonthData = prevData;
			}
		}

		isLoading = false;
	}

	async function handleIncomeTotalChange(newTotal: number) {
		incomeLoaded = true;
		incomeTotal = newTotal;

		// Auto-update budget income when total changes
		// Save when income > 0, or when income becomes 0 and we have an existing budget
		if (newTotal > 0 || (newTotal === 0 && budget)) {
			const monthToUse = budget?.month ?? getNewMonth();
			const { data } = await saveMonthlyBudget(monthToUse, newTotal);
			if (data) {
				budget = data;
			}
		}
	}

	async function handleSave() {
		const incomeValue = parseFloat(incomeInput) || 0;

		// Use current budget's month or generate current month for new budget
		const monthToUse = budget?.month ?? getNewMonth();

		const validation = validateMonthlyBudget({
			month: monthToUse,
			income: incomeValue
		});

		if (!validation.success) {
			error = validation.errors?.income ?? 'Valeur invalide';
			return;
		}

		isSaving = true;
		error = '';

		const { data, error: saveError } = await saveMonthlyBudget(monthToUse, incomeValue);

		isSaving = false;

		if (saveError) {
			error = 'Erreur lors de la sauvegarde';
			toast.error('Erreur lors de la sauvegarde');
		} else if (data) {
			budget = data;
			toast.success('Revenu enregistré');
		}
	}

	async function handleStartDateSave() {
		if (!budget || !startDateInput) return;
		const { data, error: err } = await updateBudgetStartDate(budget.id, startDateInput);
		if (err) {
			toast.error('Erreur lors de la sauvegarde');
		} else if (data) {
			budget = data;
			toast.success('Date de début mise à jour');
		}
		isEditingStartDate = false;
	}

	async function handleAddCategory(data: { name: string; color: string; type: 'fixed' | 'variable' }) {
		isAddingCategory = true;

		const { data: newCategory, error } = await createCategory(data.name, data.color, data.type);

		isAddingCategory = false;

		if (error) {
			toast.error('Erreur lors de la création');
		} else if (newCategory) {
			categories = [...categories, newCategory];
			const typeLabel = data.type === 'fixed' ? 'Coût fixe' : 'Coût variable';
			toast.success(`Catégorie ajoutée (${typeLabel})`);
			showAddCategoryModal = false;
		}
	}

	async function handleDeleteCategory() {
		if (!categoryToDelete) return;

		const { error } = await deleteCategory(categoryToDelete.id);

		if (error) {
			toast.error('Erreur lors de la suppression');
		} else {
			categories = categories.filter((c) => c.id !== categoryToDelete!.id);
			// Remove allocation for deleted category
			const newAllocations = new Map(allocations);
			newAllocations.delete(categoryToDelete!.id);
			allocations = newAllocations;
			toast.success('Catégorie supprimée');
		}
		categoryToDelete = null;
	}

	async function handleCategoryUpdate(id: string, updates: { name?: string; color?: string; type?: 'fixed' | 'variable' }) {
		const { data, error } = await updateCategory(id, updates);

		if (error) {
			toast.error('Erreur lors de la modification');
		} else if (data) {
			// Update category in list
			categories = categories.map((c) => (c.id === id ? data : c));
			if (updates.type) {
				const typeLabel = updates.type === 'fixed' ? 'Coût fixe' : 'Coût variable';
				toast.success(`Catégorie déplacée vers ${typeLabel}`);
			} else {
				toast.success('Catégorie modifiée');
			}
		}
	}

	function handleAllocationChange(categoryId: string, amount: number) {
		const newAllocations = new Map(allocations);
		newAllocations.set(categoryId, amount);
		allocations = newAllocations;
	}

	async function handleSaveAllocation(
		categoryId: string,
		amount: number
	): Promise<{ error: string | null }> {
		// If no budget exists, create one first
		let monthToUse = budget?.month;
		if (!budget) {
			const newMonth = getNewMonth();
			const { data: newBudget, error: budgetError } = await saveMonthlyBudget(
				newMonth,
				currentIncome
			);
			if (budgetError || !newBudget) {
				return { error: 'Erreur lors de la création du budget' };
			}
			budget = newBudget;
			monthToUse = newBudget.month;
		}

		const { error } = await saveCategoryBudget(categoryId, monthToUse!, amount);

		if (error) {
			return { error: error.message };
		}
		return { error: null };
	}

	function handleIncomeInput(e: Event) {
		const target = e.target as HTMLInputElement;
		incomeInput = target.value;
		error = '';
	}
</script>

<svelte:head>
	<title>Budget - Budget Planner</title>
</svelte:head>

<div class="space-y-6">
	<!-- Month Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-semibold text-coffee-900 capitalize">{monthDisplay}</h1>
			{#if budget}
				<div class="flex items-center gap-2 mt-1">
					{#if isEditingStartDate}
						<input
							type="date"
							bind:value={startDateInput}
							class="text-sm px-2 py-1 border border-sand rounded-lg bg-white text-coffee-900 outline-none focus:ring-2 focus:ring-sage/50"
						/>
						<button
							onclick={handleStartDateSave}
							class="text-xs px-2 py-1 bg-sage text-white rounded-lg hover:bg-sage-dark transition-colors"
						>
							OK
						</button>
						<button
							onclick={() => { isEditingStartDate = false; startDateInput = budget?.start_date ?? ''; }}
							class="text-xs px-2 py-1 text-stone-500 hover:text-coffee-900 transition-colors"
						>
							Annuler
						</button>
					{:else}
						<p class="text-sm text-stone-500">
							Début de période : {new Date(budget.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
						</p>
						<button
							onclick={() => isEditingStartDate = true}
							class="text-stone-400 hover:text-sage transition-colors"
							aria-label="Modifier la date de début"
						>
							<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
								<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
							</svg>
						</button>
					{/if}
				</div>
			{:else}
				<p class="text-sm text-stone-500 mt-1">Nouvelle période</p>
			{/if}
		</div>
	</div>

	{#if isLoading}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg text-sage"></span>
		</div>
	{:else}
		<!-- Income Section: Left (Revenus + Résumé) | Right (Sources) -->
		<div class="income-section">
			<!-- Left Column: Income Display + Summary - defines the height -->
			<div class="left-column">
				<!-- Income Display Card (Total) -->
				<div
					class="card bg-gradient-to-br from-sage to-accent text-white p-6 rounded-2xl shadow-lg"
				>
					<div class="flex justify-between items-start">
						<div>
							<p class="text-white/80 text-sm font-medium mb-1">Revenus de la période</p>
							<p class="text-3xl font-bold">{formatCurrency(currentIncome)}</p>
							{#if incomeTotal === 0 && !budget}
								<p class="text-white/60 text-sm mt-2">Ajoutez vos sources de revenus →</p>
							{/if}
						</div>
						<div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
							<svg
								class="w-5 h-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
							</svg>
						</div>
					</div>
				</div>

				<!-- Budget Summary Card -->
				<BudgetSummary
					income={currentIncome}
					{totalAllocated}
					savingsAllocated={totalSavingsAllocated}
				/>
			</div>

			<!-- Right Column Wrapper - constrains the height -->
			<div class="right-column-wrapper">
				<div class="right-column bg-cotton border border-sand rounded-2xl p-4">
					<IncomeEntries month={currentMonth} onTotalChange={handleIncomeTotalChange} />
				</div>
			</div>
		</div>

		<!-- Budget Categories Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<h2 class="text-lg font-semibold text-coffee-900">Catégories de budget</h2>
				{#if previousMonthData.size > 0}
					<label class="flex items-center gap-2 text-xs text-stone-500 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={showPreviousMonthHints}
							class="toggle toggle-xs toggle-sage"
						/>
						Historique
					</label>
				{/if}
			</div>
			<button
				type="button"
				class="btn bg-sage hover:bg-sage-dark border-none text-white gap-2 rounded-xl btn-sm"
				onclick={() => (showAddCategoryModal = true)}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 5v14m7-7H5"
					/>
				</svg>
				Ajouter
			</button>
		</div>

		{#if categories.length === 0}
			<!-- Empty State -->
			<div class="text-center py-12 bg-cotton rounded-2xl border border-sand">
				<div class="w-16 h-16 bg-oat rounded-full flex items-center justify-center mx-auto mb-4">
					<svg
						class="w-8 h-8 text-stone-500"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path
							d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
						/>
					</svg>
				</div>
				<h3 class="text-lg font-medium text-coffee-900 mb-2">Aucune catégorie</h3>
				<p class="text-stone-500 mb-6">Créez des catégories pour organiser votre budget</p>
				<button
					type="button"
					onclick={() => (showAddCategoryModal = true)}
					class="btn bg-sage hover:bg-sage-dark border-none text-white gap-2"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 5v14m7-7H5"
						/>
					</svg>
					Ajouter une catégorie
				</button>
			</div>
		{:else}
			<div class="space-y-6">
				<!-- Fixed Costs Section -->
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-base font-semibold text-coffee-900">Coûts fixes</h3>
							<p class="text-xs text-stone-500">Dépenses récurrentes et incompressibles</p>
						</div>
						<span class="text-sm font-medium text-coffee-900">
							Total: {formatCurrency(fixedTotal)}
						</span>
					</div>

					{#if fixedCategories.length === 0}
						<div class="text-center py-6 bg-stone-50 rounded-xl border border-stone-200">
							<p class="text-sm text-stone-500">
								Aucun coût fixe défini. Ajoutez vos dépenses récurrentes comme le loyer ou les abonnements.
							</p>
						</div>
					{:else}
						<div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
							{#each fixedCategories as category (category.id)}
								<AllocationRow
									{category}
									amount={allocations.get(category.id) ?? 0}
									totalIncome={currentIncome}
									onAmountChange={(amount) => handleAllocationChange(category.id, amount)}
									onAmountSave={handleSaveAllocation}
									onDelete={() => (categoryToDelete = category)}
									onCategoryUpdate={handleCategoryUpdate}
									previousMonthData={previousMonthData.get(category.id) ?? null}
									showHints={showPreviousMonthHints}
								/>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Variable Costs Section -->
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-base font-semibold text-coffee-900">Coûts variables</h3>
							<p class="text-xs text-stone-500">Enveloppes budgétaires ajustables</p>
						</div>
						<span class="text-sm font-medium text-coffee-900">
							Total: {formatCurrency(variableTotal)}
						</span>
					</div>

					{#if variableCategories.length === 0}
						<div class="text-center py-6 bg-oat/50 rounded-xl border border-sand">
							<p class="text-sm text-stone-500">
								Aucune catégorie variable. Créez des enveloppes pour gérer vos dépenses courantes.
							</p>
						</div>
					{:else}
						<div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
							{#each variableCategories as category (category.id)}
								<AllocationRow
									{category}
									amount={allocations.get(category.id) ?? 0}
									totalIncome={currentIncome}
									onAmountChange={(amount) => handleAllocationChange(category.id, amount)}
									onAmountSave={handleSaveAllocation}
									onDelete={() => (categoryToDelete = category)}
									onCategoryUpdate={handleCategoryUpdate}
									previousMonthData={previousMonthData.get(category.id) ?? null}
									showHints={showPreviousMonthHints}
								/>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</div>

<!-- Add Category Modal -->
{#if showAddCategoryModal}
	<div
		class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
		onclick={() => (showAddCategoryModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showAddCategoryModal = false)}
		role="button"
		tabindex="-1"
		aria-label="Fermer"
	></div>
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
		<div
			class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 pointer-events-auto animate-slide-up"
		>
			<h3 class="font-semibold text-xl text-coffee-900 mb-6">Ajouter une catégorie</h3>
			<CategoryForm
				onSubmit={handleAddCategory}
				onCancel={() => (showAddCategoryModal = false)}
				isSubmitting={isAddingCategory}
			/>
		</div>
	</div>
{/if}

<!-- Delete Category Confirmation Modal -->
{#if categoryToDelete}
	<div
		class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
		onclick={() => (categoryToDelete = null)}
		onkeydown={(e) => e.key === 'Escape' && (categoryToDelete = null)}
		role="button"
		tabindex="-1"
		aria-label="Fermer"
	></div>
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
		<div
			class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 pointer-events-auto animate-slide-up"
		>
			<h3 class="font-semibold text-xl text-coffee-900 mb-2">Supprimer la catégorie</h3>
			<p class="text-stone-500 mb-4">
				Êtes-vous sûr de vouloir supprimer <strong class="text-coffee-900"
					>{categoryToDelete.name}</strong
				> ?
			</p>
			<div class="flex items-center gap-3 p-3 bg-oat rounded-lg mb-6">
				<div class="w-4 h-4 rounded-full" style="background-color: {categoryToDelete.color}"></div>
				<span class="font-medium text-coffee-900">{categoryToDelete.name}</span>
			</div>
			<div class="flex gap-3">
				<button
					type="button"
					onclick={() => (categoryToDelete = null)}
					class="btn flex-1 bg-oat border-sand text-coffee-900 hover:bg-sand"
				>
					Annuler
				</button>
				<button
					type="button"
					onclick={handleDeleteCategory}
					class="btn flex-1 bg-terracotta hover:bg-terracotta/90 border-none text-white"
				>
					Supprimer
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Modal animations */
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

	/* Income section layout */
	.income-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (min-width: 768px) {
		.income-section {
			display: flex;
			flex-direction: row;
			gap: 1rem;
		}

		/* Left column - defines the height naturally */
		.income-section > .left-column {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}

		/* Right column wrapper - uses position relative to constrain child */
		.income-section > .right-column-wrapper {
			flex: 1;
			position: relative;
		}

		/* Right column - absolutely positioned to match wrapper height */
		.income-section > .right-column-wrapper > .right-column {
			position: absolute;
			inset: 0;
			display: flex;
			flex-direction: column;
			overflow: hidden;
		}
	}
</style>

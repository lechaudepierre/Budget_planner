<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getActiveBudget,
		getLastArchivedBudget,
		saveMonthlyBudget,
		formatMonthDisplay,
		getCurrentMonth,
		getCategories,
		createCategory,
		deleteCategory,
		updateCategory,
		getCategoryBudgets,
		saveAllCategoryBudgets,
		getBudgetHistory,
		archiveBudgetAndStartNew,
		type BudgetHistoryMonth
	} from '$lib/data/budgets';
	import { formatCurrency } from '$lib/utils/currency';
	import { validateMonthlyBudget } from '$lib/schemas/budget';
	import { toast } from '$lib/stores/toast';
	import CategoryForm from '$lib/components/budget/CategoryForm.svelte';
	import AllocationRow from '$lib/components/budget/AllocationRow.svelte';
	import BudgetSummary from '$lib/components/budget/BudgetSummary.svelte';
	import BudgetHistorySection from '$lib/components/budget/BudgetHistorySection.svelte';
	import type { Database } from '$lib/types/database';

	type MonthlyBudget = Database['public']['Tables']['monthly_budgets']['Row'];
	type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];

	// State
	let budget = $state<MonthlyBudget | null>(null);
	let categories = $state<BudgetCategory[]>([]);
	let allocations = $state<Map<string, number>>(new Map());
	let history = $state<BudgetHistoryMonth[]>([]);
	let incomeInput = $state('');
	let isLoading = $state(true);
	let isLoadingHistory = $state(true);
	let isSaving = $state(false);
	let isSavingAllocations = $state(false);
	let isArchiving = $state(false);
	let error = $state('');
	let showAddCategoryModal = $state(false);
	let isAddingCategory = $state(false);
	let categoryToDelete = $state<BudgetCategory | null>(null);
	let showArchiveModal = $state(false);

	// Derived
	let monthDisplay = $derived(budget ? formatMonthDisplay(budget.month) : 'Nouveau mois');
	let totalAllocated = $derived(
		Array.from(allocations.values()).reduce((sum, amt) => sum + amt, 0)
	);
	let currentIncome = $derived(budget?.income ?? 0);

	onMount(async () => {
		await loadData();
		await loadHistory();
	});

	async function loadHistory() {
		isLoadingHistory = true;
		const { data } = await getBudgetHistory(12);
		history = data;
		isLoadingHistory = false;
	}

	async function loadData() {
		isLoading = true;
		error = '';

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

			// Load allocations for this budget's month
			const { data: allocs } = await getCategoryBudgets(budgetResult.data.month);
			if (allocs) {
				const newAllocations = new Map<string, number>();
				for (const alloc of allocs) {
					newAllocations.set(alloc.category_id, alloc.amount);
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

		isLoading = false;
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

	async function handleArchive() {
		isArchiving = true;

		const { data: newBudget, error } = await archiveBudgetAndStartNew();

		isArchiving = false;
		showArchiveModal = false;

		if (error) {
			toast.error(error.message || 'Erreur lors de l\'archivage');
		} else if (newBudget) {
			budget = newBudget;
			incomeInput = newBudget.income.toString();
			// Reset allocations for new month
			allocations = new Map();
			toast.success('Mois archivé ! Nouveau budget créé.');
			// Reload history
			await loadHistory();
		}
	}

	function getNewMonth(): string {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
	}

	async function handleAddCategory(data: { name: string; color: string }) {
		isAddingCategory = true;

		const { data: newCategory, error } = await createCategory(data.name, data.color);

		isAddingCategory = false;

		if (error) {
			toast.error('Erreur lors de la création');
		} else if (newCategory) {
			categories = [...categories, newCategory];
			toast.success('Catégorie ajoutée');
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

	async function handleCategoryUpdate(id: string, updates: { name?: string; color?: string }) {
		const { data, error } = await updateCategory(id, updates);

		if (error) {
			toast.error('Erreur lors de la modification');
		} else if (data) {
			// Update category in list
			categories = categories.map((c) => (c.id === id ? data : c));
			toast.success('Catégorie modifiée');
		}
	}

	function handleAllocationChange(categoryId: string, amount: number) {
		const newAllocations = new Map(allocations);
		newAllocations.set(categoryId, amount);
		allocations = newAllocations;
	}

	async function handleSaveAllocations() {
		isSavingAllocations = true;

		const allocationEntries = categories.map((cat) => ({
			categoryId: cat.id,
			amount: allocations.get(cat.id) ?? 0
		}));

		if (!budget) {
			toast.error('Aucun budget actif');
			isSavingAllocations = false;
			return;
		}

		const { error } = await saveAllCategoryBudgets(allocationEntries, budget.month);

		isSavingAllocations = false;

		if (error) {
			toast.error('Erreur lors de la sauvegarde des allocations');
		} else {
			toast.success('Allocations enregistrées');
		}
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
	<!-- Month Header with Archive Button -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-semibold text-coffee-900 capitalize">{monthDisplay}</h1>
			<p class="text-sm text-stone-500 mt-1">Budget en cours</p>
		</div>
		{#if budget}
			<button
				type="button"
				class="btn bg-amber hover:bg-amber/90 border-none text-white gap-2 rounded-xl"
				onclick={() => (showArchiveModal = true)}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
				</svg>
				Clôturer ce mois
			</button>
		{/if}
	</div>

	{#if isLoading}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg text-sage"></span>
		</div>
	{:else}
		<!-- Income Card -->
		<div class="card bg-gradient-to-br from-sage to-accent text-white p-6 rounded-2xl shadow-lg">
			<div class="flex justify-between items-start mb-6">
				<div>
					<p class="text-white/80 text-sm font-medium mb-1">Revenus du mois</p>
					{#if budget}
						<p class="text-4xl font-bold">{formatCurrency(budget.income)}</p>
					{:else}
						<p class="text-4xl font-bold text-white/50">Non défini</p>
					{/if}
				</div>
				<div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
					<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
					</svg>
				</div>
			</div>
		</div>

		<!-- Income Form -->
		<div class="bg-cotton border border-sand rounded-2xl p-6">
			<h2 class="text-lg font-semibold text-coffee-900 mb-4">Définir les revenus</h2>

			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-stone-500 mb-2" for="income-input">
						Revenus mensuels
					</label>
					<div class="relative">
						<input
							id="income-input"
							type="number"
							value={incomeInput}
							oninput={handleIncomeInput}
							placeholder="0"
							class="input input-bordered w-full pr-12 text-right text-xl bg-white border-sand focus:border-sage focus:ring-sage"
							class:border-terracotta={error}
							min="0"
							step="100"
						/>
						<span class="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 font-medium">€</span>
					</div>
					{#if error}
						<p class="text-sm text-terracotta mt-2">{error}</p>
					{/if}
				</div>

				<div class="flex justify-end pt-2">
					<button
						type="button"
						class="btn bg-sage hover:bg-sage-dark border-none text-white gap-2 rounded-xl"
						onclick={handleSave}
						disabled={isSaving || !incomeInput}
					>
						{#if isSaving}
							<span class="loading loading-spinner loading-sm"></span>
						{/if}
						Enregistrer
					</button>
				</div>
			</div>
		</div>

		<!-- Budget Categories Section -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold text-coffee-900">Catégories de budget</h2>
				<button
					type="button"
					class="btn bg-sage hover:bg-sage-dark border-none text-white gap-2 rounded-xl btn-sm"
					onclick={() => (showAddCategoryModal = true)}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5" />
					</svg>
					Ajouter
				</button>
			</div>

			{#if categories.length === 0}
				<!-- Empty State -->
				<div class="text-center py-12 bg-cotton rounded-2xl border border-sand">
					<div class="w-16 h-16 bg-oat rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
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
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5" />
						</svg>
						Ajouter une catégorie
					</button>
				</div>
			{:else}
				<!-- Allocations List -->
				<div class="space-y-3">
					{#each categories as category (category.id)}
						<AllocationRow
							{category}
							amount={allocations.get(category.id) ?? 0}
							totalIncome={currentIncome}
							onAmountChange={(amount) => handleAllocationChange(category.id, amount)}
							onDelete={() => (categoryToDelete = category)}
							onCategoryUpdate={handleCategoryUpdate}
						/>
					{/each}
				</div>

				<!-- Budget Summary -->
				<BudgetSummary income={currentIncome} {totalAllocated} />

				<!-- Save Allocations Button -->
				<div class="flex justify-end">
					<button
						type="button"
						class="btn bg-sage hover:bg-sage-dark border-none text-white gap-2 rounded-xl"
						onclick={handleSaveAllocations}
						disabled={isSavingAllocations}
					>
						{#if isSavingAllocations}
							<span class="loading loading-spinner loading-sm"></span>
						{/if}
						Enregistrer les allocations
					</button>
				</div>
			{/if}
		</div>

		<!-- Budget History Section -->
		<BudgetHistorySection {history} isLoading={isLoadingHistory} />
	{/if}
</div>

<!-- Add Category Modal -->
{#if showAddCategoryModal}
	<div class="modal modal-open">
		<div class="modal-box bg-linen max-w-md">
			<h3 class="font-semibold text-xl text-coffee-900 mb-6">Ajouter une catégorie</h3>
			<CategoryForm
				onSubmit={handleAddCategory}
				onCancel={() => (showAddCategoryModal = false)}
				isSubmitting={isAddingCategory}
			/>
		</div>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="modal-backdrop bg-black/40"
			onclick={() => (showAddCategoryModal = false)}
			onkeydown={(e) => e.key === 'Escape' && (showAddCategoryModal = false)}
			role="button"
			tabindex="-1"
			aria-label="Fermer"
		></div>
	</div>
{/if}

<!-- Delete Category Confirmation Modal -->
{#if categoryToDelete}
	<div class="modal modal-open">
		<div class="modal-box bg-linen max-w-sm">
			<h3 class="font-semibold text-xl text-coffee-900 mb-2">Supprimer la catégorie</h3>
			<p class="text-stone-500 mb-4">
				Êtes-vous sûr de vouloir supprimer <strong class="text-coffee-900">{categoryToDelete.name}</strong> ?
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
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="modal-backdrop bg-black/40"
			onclick={() => (categoryToDelete = null)}
			onkeydown={(e) => e.key === 'Escape' && (categoryToDelete = null)}
			role="button"
			tabindex="-1"
			aria-label="Fermer"
		></div>
	</div>
{/if}

<!-- Archive Budget Confirmation Modal -->
{#if showArchiveModal}
	<div class="modal modal-open">
		<div class="modal-box bg-linen max-w-md">
			<h3 class="font-semibold text-xl text-coffee-900 mb-2">Clôturer ce mois ?</h3>
			<p class="text-stone-500 mb-4">
				Cette action va archiver le budget de <strong class="text-coffee-900 capitalize">{monthDisplay}</strong> et créer un nouveau mois.
			</p>
			<div class="bg-oat rounded-lg p-4 mb-6 space-y-2">
				<div class="flex justify-between text-sm">
					<span class="text-stone-500">Revenus</span>
					<span class="font-medium text-coffee-900">{formatCurrency(currentIncome)}</span>
				</div>
				<div class="flex justify-between text-sm">
					<span class="text-stone-500">Total alloué</span>
					<span class="font-medium text-coffee-900">{formatCurrency(totalAllocated)}</span>
				</div>
				<div class="flex justify-between text-sm pt-2 border-t border-sand">
					<span class="text-stone-500">Restant</span>
					<span class="font-medium" class:text-sage={currentIncome - totalAllocated >= 0} class:text-terracotta={currentIncome - totalAllocated < 0}>
						{formatCurrency(currentIncome - totalAllocated)}
					</span>
				</div>
			</div>
			<p class="text-xs text-stone-400 mb-6">
				Le nouveau mois reprendra vos catégories mais les allocations seront remises à zéro.
			</p>
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
					class="btn flex-1 bg-amber hover:bg-amber/90 border-none text-white gap-2"
					disabled={isArchiving}
				>
					{#if isArchiving}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					Clôturer et continuer
				</button>
			</div>
		</div>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="modal-backdrop bg-black/40"
			onclick={() => (showArchiveModal = false)}
			onkeydown={(e) => e.key === 'Escape' && (showArchiveModal = false)}
			role="button"
			tabindex="-1"
			aria-label="Fermer"
		></div>
	</div>
{/if}

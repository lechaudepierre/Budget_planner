<script lang="ts">
	import { updateExpense, deleteExpense, getCategorySpending } from '$lib/data/expenses';
	import { validateExpense } from '$lib/schemas/expense';
	import { formatCurrency } from '$lib/utils/currency';
	import { toast } from '$lib/stores/toast';
	import type { ExpenseWithCategory } from '$lib/types/database';
	import type { Database } from '$lib/types/database';
	import MonthYearPicker from '$lib/components/ui/MonthYearPicker.svelte';

	type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];

	let {
		expense,
		categories,
		open = $bindable(false),
		onSave,
		onDelete
	}: {
		expense: ExpenseWithCategory;
		categories: BudgetCategory[];
		open: boolean;
		onSave: () => void;
		onDelete: () => void;
	} = $props();

	// Form state initialized from expense
	let categoryId = $state(expense.category_id || '');
	let amount = $state(expense.amount.toString());
	let description = $state(expense.description || '');
	// Convert YYYY-MM-DD to YYYY-MM for month picker
	let dateMonth = $state(expense.date.substring(0, 7));
	let errors = $state<Record<string, string>>({});
	let saving = $state(false);
	let deleting = $state(false);
	let showDeleteConfirm = $state(false);

	// Budget preview
	let categorySpending = $state<{
		budget: number;
		spent: number;
		remaining: number;
	} | null>(null);

	// Preview with entered amount
	let previewWithAmount = $derived.by(() => {
		if (!categorySpending) return null;
		// Subtract the original expense amount first, then add the new amount
		const originalAmount = expense.category_id === categoryId ? expense.amount : 0;
		const enteredAmount = parseFloat(amount) || 0;
		const spentWithNew = categorySpending.spent - originalAmount + enteredAmount;
		const remaining = categorySpending.budget - spentWithNew;
		const percentage =
			categorySpending.budget > 0
				? Math.round((spentWithNew / categorySpending.budget) * 100)
				: 0;

		return {
			budget: categorySpending.budget,
			spent: categorySpending.spent,
			spentWithNew,
			remaining,
			percentage
		};
	});

	// Load initial spending on mount
	$effect(() => {
		if (open && categoryId) {
			loadCategorySpending();
		}
	});

	async function loadCategorySpending() {
		if (categoryId) {
			categorySpending = await getCategorySpending(categoryId);
		} else {
			categorySpending = null;
		}
	}

	async function handleCategoryChange() {
		await loadCategorySpending();
	}

	async function handleSave() {
		errors = {};

		// Convert YYYY-MM to YYYY-MM-01 for database
		const date = dateMonth + '-01';

		// Validate
		const result = validateExpense({
			category_id: categoryId,
			amount: parseFloat(amount) || 0,
			description: description.trim() || null,
			date
		});

		if (!result.success) {
			errors = result.errors || {};
			return;
		}

		saving = true;
		const { error } = await updateExpense(expense.id, result.data!);
		saving = false;

		if (error) {
			toast.error(error.message);
			return;
		}

		toast.success('Dépense modifiée');
		open = false;
		onSave();
	}

	async function handleDelete() {
		deleting = true;
		const { error } = await deleteExpense(expense.id);
		deleting = false;

		if (error) {
			toast.error(error.message);
			return;
		}

		toast.success('Dépense supprimée');
		showDeleteConfirm = false;
		open = false;
		onDelete();
	}

	function handleClose() {
		open = false;
		showDeleteConfirm = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			if (showDeleteConfirm) {
				showDeleteConfirm = false;
			} else {
				handleClose();
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
		onclick={handleClose}
		role="button"
		tabindex="-1"
		aria-label="Fermer"
	></div>

	<!-- Modal -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
		<div
			class="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto animate-slide-up"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-sand">
				<h3 class="font-semibold text-lg text-coffee-900">Modifier la dépense</h3>
				<button
					type="button"
					class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-oat transition-colors text-stone-400 hover:text-stone-600"
					onclick={handleClose}
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSave();
				}}
				class="p-6 space-y-4"
			>
				<!-- Amount -->
				<div>
					<label class="block text-sm font-medium text-stone-600 mb-1" for="edit-amount">
						Montant *
					</label>
					<div class="relative">
						<input
							type="number"
							id="edit-amount"
							step="0.01"
							min="0.01"
							bind:value={amount}
							class="w-full px-4 py-3 pr-10 border rounded-xl bg-cotton text-coffee-900 placeholder-stone-400 transition-colors"
							class:border-sand={!errors.amount}
							class:focus:border-sage={!errors.amount}
							class:focus:ring-1={!errors.amount}
							class:focus:ring-sage={!errors.amount}
							class:border-terracotta={errors.amount}
							placeholder="0.00"
						/>
						<span class="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500">€</span>
					</div>
					{#if errors.amount}
						<p class="text-sm text-terracotta mt-1">{errors.amount}</p>
					{/if}
				</div>

				<!-- Category -->
				<div>
					<label class="block text-sm font-medium text-stone-600 mb-1" for="edit-category">
						Catégorie *
					</label>
					<select
						id="edit-category"
						bind:value={categoryId}
						onchange={handleCategoryChange}
						class="w-full px-4 py-3 border rounded-xl bg-cotton text-coffee-900 transition-colors appearance-none cursor-pointer"
						class:border-sand={!errors.category_id}
						class:focus:border-sage={!errors.category_id}
						class:focus:ring-1={!errors.category_id}
						class:focus:ring-sage={!errors.category_id}
						class:border-terracotta={errors.category_id}
					>
						<option value="">Sélectionner une catégorie</option>
						{#each categories as category}
							<option value={category.id}>
								{category.name}
							</option>
						{/each}
					</select>
					{#if errors.category_id}
						<p class="text-sm text-terracotta mt-1">{errors.category_id}</p>
					{/if}
				</div>

				<!-- Budget Preview -->
				{#if previewWithAmount}
					<div class="bg-oat rounded-xl p-4">
						<div class="flex justify-between text-sm mb-2">
							<span class="text-stone-600">Budget: {formatCurrency(previewWithAmount.budget)}</span>
							<span
								class:text-terracotta={previewWithAmount.remaining < 0}
								class:text-sage={previewWithAmount.remaining >= 0}
								class="font-medium"
							>
								Reste: {formatCurrency(previewWithAmount.remaining)}
							</span>
						</div>
						<div class="w-full bg-sand rounded-full h-2">
							<div
								class="h-2 rounded-full transition-all duration-300"
								class:bg-sage={previewWithAmount.percentage <= 75}
								class:bg-amber={previewWithAmount.percentage > 75 &&
									previewWithAmount.percentage <= 100}
								class:bg-terracotta={previewWithAmount.percentage > 100}
								style="width: {Math.min(previewWithAmount.percentage, 100)}%"
							></div>
						</div>
						<p class="text-xs text-stone-500 mt-2">{previewWithAmount.percentage}% du budget</p>
					</div>
				{/if}

				<!-- Date -->
				<div>
					<label class="block text-sm font-medium text-stone-600 mb-1" for="edit-date">
						Mois *
					</label>
					<MonthYearPicker
						id="edit-date"
						bind:value={dateMonth}
						placeholder="Sélectionner un mois"
						class={errors.date ? 'border-terracotta' : ''}
					/>
					{#if errors.date}
						<p class="text-sm text-terracotta mt-1">{errors.date}</p>
					{/if}
				</div>

				<!-- Description -->
				<div>
					<label class="block text-sm font-medium text-stone-600 mb-1" for="edit-description">
						Description (optionnel)
					</label>
					<input
						type="text"
						id="edit-description"
						bind:value={description}
						class="w-full px-4 py-3 border border-sand rounded-xl bg-cotton text-coffee-900 placeholder-stone-400 focus:border-sage focus:ring-1 focus:ring-sage transition-colors"
						placeholder="Ex: Courses au Carrefour"
						maxlength="200"
					/>
				</div>

				<!-- Actions -->
				<div class="flex justify-between pt-4">
					<button
						type="button"
						class="px-4 py-2 rounded-xl text-terracotta border border-terracotta hover:bg-terracotta/10 font-medium transition-colors"
						onclick={() => (showDeleteConfirm = true)}
					>
						Supprimer
					</button>
					<div class="flex gap-2">
						<button
							type="button"
							class="px-4 py-2 rounded-xl text-stone-600 hover:bg-oat font-medium transition-colors"
							onclick={handleClose}
						>
							Annuler
						</button>
						<button
							type="submit"
							class="px-6 py-2 rounded-xl bg-sage hover:bg-sage-dark text-white font-medium transition-colors disabled:opacity-50"
							disabled={saving}
						>
							{#if saving}
								<span class="loading loading-spinner loading-sm"></span>
							{/if}
							Enregistrer
						</button>
					</div>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] animate-fade-in"
		onclick={() => (showDeleteConfirm = false)}
		role="button"
		tabindex="-1"
		aria-label="Fermer"
	></div>

	<!-- Confirmation Modal -->
	<div class="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
		<div
			class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 pointer-events-auto animate-slide-up"
			onclick={(e) => e.stopPropagation()}
		>
			<h3 class="font-semibold text-lg text-coffee-900 mb-2">Supprimer cette dépense ?</h3>
			<p class="text-stone-600 mb-6">
				Cette action est irréversible. La dépense de
				<strong class="text-terracotta">{formatCurrency(expense.amount)}</strong>
				sera définitivement supprimée.
			</p>
			<div class="flex justify-end gap-2">
				<button
					class="px-4 py-2 rounded-xl text-stone-600 hover:bg-oat font-medium transition-colors"
					onclick={() => (showDeleteConfirm = false)}
				>
					Annuler
				</button>
				<button
					class="px-4 py-2 rounded-xl bg-terracotta hover:bg-terracotta/90 text-white font-medium transition-colors disabled:opacity-50"
					onclick={handleDelete}
					disabled={deleting}
				>
					{#if deleting}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					Supprimer
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
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

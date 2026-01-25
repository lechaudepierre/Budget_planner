<script lang="ts">
	import { createExpense, getCategorySpending } from '$lib/data/expenses';
	import { getCategories } from '$lib/data/budgets';
	import { validateExpense } from '$lib/schemas/expense';
	import { formatCurrency } from '$lib/utils/currency';
	import { toast } from '$lib/stores/toast';
	import { dashboardRefresh } from '$lib/stores/refresh';
	import { onMount } from 'svelte';
	import type { Database } from '$lib/types/database';

	type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];

	let {
		open = $bindable(false),
		onExpenseAdded
	}: {
		open: boolean;
		onExpenseAdded?: () => void;
	} = $props();

	// Form state
	let amount = $state('');
	let categoryId = $state('');
	let description = $state('');
	// Store as YYYY-MM-DD format
	const now = new Date();
	let date = $state(now.toISOString().split('T')[0]);
	let errors = $state<Record<string, string>>({});
	let saving = $state(false);

	// Categories
	let categories = $state<BudgetCategory[]>([]);
	let loadingCategories = $state(true);

	// Budget preview
	let categorySpending = $state<{
		budget: number;
		spent: number;
		remaining: number;
	} | null>(null);
	let loadingSpending = $state(false);

	// Preview with entered amount
	let previewWithAmount = $derived.by(() => {
		if (!categorySpending) return null;
		const enteredAmount = parseFloat(amount) || 0;
		const spentWithNew = categorySpending.spent + enteredAmount;
		const remaining = categorySpending.budget - spentWithNew;
		const percentage =
			categorySpending.budget > 0 ? Math.round((spentWithNew / categorySpending.budget) * 100) : 0;

		return {
			budget: categorySpending.budget,
			spent: categorySpending.spent,
			spentWithNew,
			remaining,
			percentage
		};
	});

	onMount(async () => {
		await loadCategories();
	});

	// Reload categories when modal opens
	$effect(() => {
		if (open) {
			loadCategories();
		}
	});

	async function loadCategories() {
		loadingCategories = true;
		const { data } = await getCategories();
		categories = data;
		loadingCategories = false;
	}

	async function handleCategoryChange() {
		if (categoryId) {
			loadingSpending = true;
			categorySpending = await getCategorySpending(categoryId);
			loadingSpending = false;
		} else {
			categorySpending = null;
		}
	}

	async function handleSubmit() {
		errors = {};

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
		const { error } = await createExpense(result.data!);
		saving = false;

		if (error) {
			toast.error(error.message);
			return;
		}

		toast.success('Dépense ajoutée');

		// Notify dashboard to refresh
		dashboardRefresh.trigger();
		onExpenseAdded?.();

		// Close modal after successful add
		handleClose();
	}

	function handleClose() {
		open = false;
		// Reset form
		amount = '';
		categoryId = '';
		description = '';
		const now = new Date();
		date = now.toISOString().split('T')[0];
		errors = {};
		categorySpending = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
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
				<h3 class="text-xl font-semibold text-coffee-900">Ajouter une dépense</h3>
				<button
					type="button"
					class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-oat transition-colors"
					onclick={handleClose}
				>
					<svg class="w-5 h-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
				class="p-6 space-y-5"
			>
				<!-- Amount -->
				<div>
					<label class="block text-sm font-medium text-coffee-900 mb-2" for="amount">
						Montant *
					</label>
					<div
						class="flex items-center border rounded-xl px-4 py-3 bg-cotton focus-within:ring-2 focus-within:ring-sage/50 focus-within:border-sage transition-all"
						class:border-red-400={errors.amount}
						class:border-sand={!errors.amount}
					>
						<input
							type="number"
							id="amount"
							step="0.01"
							min="0.01"
							bind:value={amount}
							class="flex-1 bg-transparent outline-none text-coffee-900 placeholder-stone-400"
							placeholder="0.00"
							autofocus
						/>
						<span class="text-stone-500 font-medium ml-2">€</span>
					</div>
					{#if errors.amount}
						<p class="text-sm text-red-500 mt-1">{errors.amount}</p>
					{/if}
				</div>

				<!-- Category -->
				<div>
					<label class="block text-sm font-medium text-coffee-900 mb-2" for="category">
						Catégorie *
					</label>
					<select
						id="category"
						bind:value={categoryId}
						onchange={handleCategoryChange}
						class="w-full border rounded-xl px-4 py-3 bg-cotton text-coffee-900 outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage transition-all appearance-none cursor-pointer"
						class:border-red-400={errors.category_id}
						class:border-sand={!errors.category_id}
						disabled={loadingCategories}
					>
						<option value="">Sélectionner une catégorie</option>
						{#each categories as category}
							<option value={category.id}>
								{category.name}
							</option>
						{/each}
					</select>
					{#if errors.category_id}
						<p class="text-sm text-red-500 mt-1">{errors.category_id}</p>
					{/if}
				</div>

				<!-- Budget Preview -->
				{#if loadingSpending}
					<div class="bg-oat rounded-xl p-4">
						<div class="flex justify-center">
							<span class="loading loading-spinner loading-sm text-sage"></span>
						</div>
					</div>
				{:else if previewWithAmount}
					<div class="bg-oat rounded-xl p-4">
						<div class="flex justify-between text-sm text-stone-600 mb-2">
							<span>Budget: {formatCurrency(previewWithAmount.budget)}</span>
							<span
								class:text-terracotta={previewWithAmount.remaining < 0}
								class:font-semibold={previewWithAmount.remaining < 0}
							>
								Reste: {formatCurrency(previewWithAmount.remaining)}
							</span>
						</div>
						<div class="w-full bg-sand rounded-full h-2.5">
							<div
								class="h-2.5 rounded-full transition-all duration-300"
								class:bg-sage={previewWithAmount.percentage <= 75}
								class:bg-amber={previewWithAmount.percentage > 75 &&
									previewWithAmount.percentage <= 100}
								class:bg-terracotta={previewWithAmount.percentage > 100}
								style="width: {Math.min(previewWithAmount.percentage, 100)}%"
							></div>
						</div>
						{#if previewWithAmount.percentage > 100}
							<p class="text-xs text-terracotta mt-2 font-medium">
								⚠️ {previewWithAmount.percentage}% du budget (dépassement)
							</p>
						{:else}
							<p class="text-xs text-stone-500 mt-2">
								{previewWithAmount.percentage}% du budget utilisé
							</p>
						{/if}
					</div>
				{/if}

				<!-- Date -->
				<div>
					<label class="block text-sm font-medium text-coffee-900 mb-2" for="date"> Date * </label>
					<input
						type="date"
						id="date"
						bind:value={date}
						class="w-full border rounded-xl px-4 py-3 bg-cotton text-coffee-900 outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage transition-all"
						class:border-red-400={errors.date}
						class:border-sand={!errors.date}
					/>
					{#if errors.date}
						<p class="text-sm text-red-500 mt-1">{errors.date}</p>
					{/if}
				</div>

				<!-- Description -->
				<div>
					<label class="block text-sm font-medium text-coffee-900 mb-2" for="description">
						Description <span class="text-stone-400 font-normal">(optionnel)</span>
					</label>
					<input
						type="text"
						id="description"
						bind:value={description}
						class="w-full border border-sand rounded-xl px-4 py-3 bg-cotton text-coffee-900 placeholder-stone-400 outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage transition-all"
						placeholder="Ex: Courses au Carrefour"
						maxlength="200"
					/>
				</div>

				<!-- Actions -->
				<div class="flex justify-end gap-3 pt-2">
					<button
						type="button"
						class="px-5 py-2.5 rounded-xl text-stone-600 hover:bg-oat transition-colors font-medium"
						onclick={handleClose}
					>
						Fermer
					</button>
					<button
						type="submit"
						class="px-5 py-2.5 rounded-xl bg-sage hover:bg-sage-dark text-white font-medium transition-colors flex items-center gap-2"
						disabled={saving}
					>
						{#if saving}
							<span class="loading loading-spinner loading-sm"></span>
						{/if}
						Ajouter
					</button>
				</div>
			</form>
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

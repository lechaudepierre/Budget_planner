<script lang="ts">
	import type { ExpenseWithCategory } from '$lib/types/database';
	import type { Database } from '$lib/types/database';
	import { formatCurrency } from '$lib/utils/currency';
	import { updateExpense, deleteExpense } from '$lib/data/expenses';
	import { validateExpense } from '$lib/schemas/expense';
	import { toast } from '$lib/stores/toast';
	import { dashboardRefresh } from '$lib/stores/refresh';
	import InlineDropdown from './inline-dropdown.svelte';

	type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];
	type Account = Database['public']['Tables']['accounts']['Row'];

	let {
		expense,
		categories,
		accounts,
		onSave,
		onDelete,
		confirmState = 'idle'
	}: {
		expense: ExpenseWithCategory;
		categories: BudgetCategory[];
		accounts: Account[];
		onSave: () => void;
		onDelete: () => void;
		confirmState?: 'idle' | 'confirmed';
	} = $props();

	// Edit mode state
	let isEditing = $state(false);
	let saving = $state(false);
	let editDate = $state(expense.date);
	let editAmount = $state(expense.amount.toString());
	let editCategoryId = $state(expense.category_id || '');
	let editAccountId = $state(expense.account_id || '');
	let editDescription = $state(expense.description || '');
	let errors = $state<Record<string, string>>({});

	// Delete confirmation
	let showDeleteConfirm = $state(false);
	let deleting = $state(false);

	// Refs
	let amountInput: HTMLInputElement;

	// Dropdown items
	const categoryItems = $derived(
		categories.map((c) => ({ id: c.id, name: c.name, color: c.color }))
	);
	const accountItems = $derived(accounts.map((a) => ({ id: a.id, name: a.name })));

	// Rows sit under a day header, so the date only needs to be a short reminder
	function formatDate(dateStr: string): string {
		const date = new Date(dateStr + 'T00:00:00');
		return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date);
	}

	function enterEdit() {
		editDate = expense.date;
		editAmount = expense.amount.toString();
		editCategoryId = expense.category_id || '';
		editAccountId = expense.account_id || '';
		editDescription = expense.description || '';
		errors = {};
		showDeleteConfirm = false;
		isEditing = true;
		requestAnimationFrame(() => {
			amountInput?.focus();
		});
	}

	function cancelEdit() {
		isEditing = false;
		errors = {};
		showDeleteConfirm = false;
	}

	async function handleSave() {
		errors = {};

		const result = validateExpense({
			category_id: editCategoryId,
			amount: parseFloat(editAmount) || 0,
			description: editDescription.trim() || null,
			date: editDate
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
		isEditing = false;
		dashboardRefresh.trigger();
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
		dashboardRefresh.trigger();
		onDelete();
	}

	function handleInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSave();
		}
		if (e.key === 'Escape') {
			e.stopPropagation();
			cancelEdit();
		}
	}

	function clearError(field: string) {
		if (errors[field]) {
			const newErrors = { ...errors };
			delete newErrors[field];
			errors = newErrors;
		}
	}
</script>

{#if isEditing}
	<!-- Edit mode -->
	<div
		role="row"
		class="grid grid-cols-[120px_100px_150px_130px_1fr_80px] gap-0 items-center px-4 border-b border-sage/15 bg-linen py-2.5"
	>
		<!-- Date -->
		<div role="gridcell" class="pr-2 py-1">
			<input
				type="date"
				bind:value={editDate}
				class="w-full text-sm bg-transparent outline-none text-coffee-900 rounded px-1 py-0.5 border border-transparent focus:ring-2 focus:ring-[#639A88]/30
					{errors.date ? 'ring-2 ring-terracotta' : ''}"
				onkeydown={handleInputKeydown}
				oninput={() => clearError('date')}
				aria-invalid={errors.date ? 'true' : undefined}
			/>
			{#if errors.date}
				<p class="text-[11px] text-terracotta leading-tight">{errors.date}</p>
			{/if}
		</div>

		<!-- Amount -->
		<div role="gridcell" class="pr-2 py-1">
			<input
				bind:this={amountInput}
				type="number"
				step="0.01"
				min="0.01"
				bind:value={editAmount}
				class="w-full text-sm bg-transparent outline-none text-coffee-900 rounded px-1 py-0.5 border border-transparent focus:ring-2 focus:ring-[#639A88]/30
					{errors.amount ? 'ring-2 ring-terracotta' : ''}"
				onkeydown={handleInputKeydown}
				oninput={() => clearError('amount')}
				aria-invalid={errors.amount ? 'true' : undefined}
			/>
			{#if errors.amount}
				<p class="text-[11px] text-terracotta leading-tight">{errors.amount}</p>
			{/if}
		</div>

		<!-- Category -->
		<div role="gridcell" class="pr-2 py-1">
			<InlineDropdown
				items={categoryItems}
				selected={editCategoryId}
				placeholder="Catégorie..."
				error={!!errors.category_id}
				onSelect={(item) => {
					editCategoryId = item.id;
					clearError('category_id');
				}}
				onEnterClosed={handleSave}
			/>
			{#if errors.category_id}
				<p class="text-[11px] text-terracotta leading-tight">{errors.category_id}</p>
			{/if}
		</div>

		<!-- Account -->
		<div role="gridcell" class="pr-2 py-1">
			<InlineDropdown
				items={accountItems}
				selected={editAccountId}
				placeholder="Compte..."
				onSelect={(item) => {
					editAccountId = item.id;
				}}
				onEnterClosed={handleSave}
			/>
		</div>

		<!-- Description -->
		<div role="gridcell" class="pr-2 py-1">
			<input
				type="text"
				bind:value={editDescription}
				placeholder="Description (optionnel)"
				maxlength="200"
				class="w-full text-sm bg-transparent outline-none text-coffee-900 placeholder-stone-400 rounded px-1 py-0.5 border border-transparent focus:ring-2 focus:ring-[#639A88]/30"
				onkeydown={handleInputKeydown}
			/>
		</div>

		<!-- Actions -->
		<div role="gridcell" class="flex items-center justify-center gap-1">
			{#if showDeleteConfirm}
				<!-- Delete confirmation -->
				<button
					type="button"
					class="w-7 h-7 flex items-center justify-center rounded-lg text-terracotta hover:bg-terracotta/10 transition-colors disabled:opacity-50"
					onclick={handleDelete}
					disabled={deleting}
					aria-label="Confirmer la suppression"
					title="Confirmer"
				>
					{#if deleting}
						<span class="loading loading-spinner loading-xs"></span>
					{:else}
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
					{/if}
				</button>
				<button
					type="button"
					class="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:bg-oat transition-colors"
					onclick={() => (showDeleteConfirm = false)}
					aria-label="Annuler la suppression"
					title="Annuler"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			{:else}
				<!-- Save -->
				<button
					type="button"
					class="w-7 h-7 flex items-center justify-center rounded-lg text-sage hover:bg-sage/10 transition-colors disabled:opacity-50"
					onclick={handleSave}
					disabled={saving}
					aria-label="Enregistrer"
					title="Enregistrer"
				>
					{#if saving}
						<span class="loading loading-spinner loading-xs"></span>
					{:else}
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
					{/if}
				</button>
				<!-- Cancel -->
				<button
					type="button"
					class="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:bg-oat transition-colors"
					onclick={cancelEdit}
					aria-label="Annuler"
					title="Annuler"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
				<!-- Delete -->
				<button
					type="button"
					class="w-7 h-7 flex items-center justify-center rounded-lg text-stone-300 hover:text-terracotta hover:bg-terracotta/10 transition-colors"
					onclick={() => (showDeleteConfirm = true)}
					aria-label="Supprimer"
					title="Supprimer"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
				</button>
			{/if}
		</div>
	</div>
{:else}
	<!-- View mode -->
	<div
		role="row"
		class="grid grid-cols-[120px_100px_150px_130px_1fr_80px] gap-0 items-center px-4 border-b border-sand/40 bg-cotton hover:bg-oat/70 cursor-pointer transition-colors duration-200 py-3
			{confirmState === 'confirmed' ? 'animate-sage-fade' : ''}"
		onclick={enterEdit}
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enterEdit(); } }}
		tabindex="0"
	>
		<!-- Date -->
		<div role="gridcell" class="text-xs text-stone-400 num truncate pr-2">
			{formatDate(expense.date)}
		</div>

		<!-- Amount (my share; bank amount shown when the expense was shared) -->
		<div role="gridcell" class="text-sm font-medium text-terracotta truncate pr-2">
			-{formatCurrency(expense.amount)}
			{#if expense.bank_amount !== null && Math.abs(expense.bank_amount - expense.amount) >= 0.01}
				<span class="block text-[11px] font-normal text-stone-400" title="Montant payé à la banque, ma part = {formatCurrency(expense.amount)}">
					sur {formatCurrency(expense.bank_amount)}
				</span>
			{/if}
		</div>

		<!-- Category -->
		<div role="gridcell" class="flex items-center gap-2 min-w-0 pr-2">
			{#if expense.category}
				<span
					class="w-2.5 h-2.5 rounded-full shrink-0"
					style="background-color: {expense.category.color}"
				></span>
				<span class="text-sm text-coffee-900 truncate">{expense.category.name}</span>
			{:else}
				<span class="text-sm text-stone-400">Aucune</span>
			{/if}
		</div>

		<!-- Account -->
		<div role="gridcell" class="text-sm text-stone-500 truncate pr-2">
			{expense.account?.name || '—'}
		</div>

		<!-- Description -->
		<div role="gridcell" class="text-sm text-coffee-900 truncate pr-2 min-w-0 flex items-center gap-2">
			<span class="truncate">{expense.description || ''}</span>
			{#if expense.is_pending}
				<span class="shrink-0 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber/15 text-amber">en attente</span>
			{/if}
			{#if expense.source !== 'manual'}
				<span class="shrink-0 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-sage/10 text-sage" title="Importé depuis un relevé">
					{expense.source}
				</span>
			{/if}
		</div>

		<!-- Actions (empty in view mode) -->
		<div role="gridcell"></div>
	</div>
{/if}

<style>
	@keyframes sage-fade {
		from {
			background-color: rgba(99, 154, 136, 0.08);
		}
		to {
			background-color: #fdfbf8;
		}
	}
	.animate-sage-fade {
		animation: sage-fade 400ms ease-out;
	}
</style>

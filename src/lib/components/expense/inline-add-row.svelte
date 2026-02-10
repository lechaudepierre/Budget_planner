<script lang="ts">
	import InlineDropdown from './inline-dropdown.svelte';
	import { validateExpense } from '$lib/schemas/expense';
	import { onMount } from 'svelte';
	import type { Database } from '$lib/types/database';

	type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];
	type Account = Database['public']['Tables']['accounts']['Row'];

	let {
		categories,
		accounts,
		onSubmit,
		disabled = false,
		repopulateData = null
	}: {
		categories: BudgetCategory[];
		accounts: Account[];
		onSubmit: (data: {
			date: string;
			amount: number;
			category_id: string;
			account_id: string | null;
			description: string | null;
		}) => void;
		disabled?: boolean;
		repopulateData?: {
			date: string;
			amount: number;
			category_id: string;
			account_id: string | null;
			description: string | null;
		} | null;
	} = $props();

	// Form state
	let date = $state(new Date().toISOString().split('T')[0]);
	let amount = $state('');
	let categoryId = $state('');
	let accountId = $state('');
	let description = $state('');
	let errors = $state<Record<string, string>>({});

	// Refs
	let amountInput: HTMLInputElement;
	let dateInput: HTMLInputElement;
	let rowEl: HTMLDivElement;

	// Dropdown items
	const categoryItems = $derived(
		categories.map((c) => ({ id: c.id, name: c.name, color: c.color }))
	);
	const accountItems = $derived(accounts.map((a) => ({ id: a.id, name: a.name })));

	// Auto-select default account: localStorage preference > checking > first
	$effect(() => {
		if (accounts.length > 0 && !accountId) {
			const saved = localStorage.getItem('budget_planner_default_account');
			if (saved && accounts.some((a) => a.id === saved)) {
				accountId = saved;
			} else {
				const checking = accounts.find((a) => a.account_type === 'checking');
				accountId = checking ? checking.id : accounts[0].id;
			}
		}
	});

	// Re-populate form on failure
	$effect(() => {
		if (repopulateData) {
			date = repopulateData.date;
			amount = String(repopulateData.amount);
			categoryId = repopulateData.category_id;
			if (repopulateData.account_id) accountId = repopulateData.account_id;
			description = repopulateData.description || '';
		}
	});

	// Auto-focus amount on mount
	onMount(() => {
		amountInput?.focus();
	});

	function handleSubmit() {
		errors = {};

		const result = validateExpense({
			category_id: categoryId,
			account_id: accountId || null,
			amount: parseFloat(amount) || 0,
			description: description.trim() || null,
			date
		});

		if (!result.success) {
			errors = result.errors || {};
			// Focus first invalid field (field order: Date -> Amount -> Category)
			if (errors.date) {
				dateInput?.focus();
			} else if (errors.amount) {
				amountInput?.focus();
			} else if (errors.category_id) {
				const catBtn = rowEl?.querySelector('[data-field="category"] button') as HTMLElement;
				catBtn?.focus();
			}
			return;
		}

		onSubmit({
			date: result.data!.date,
			amount: result.data!.amount,
			category_id: result.data!.category_id,
			account_id: result.data!.account_id ?? null,
			description: result.data!.description ?? null
		});
		resetForm();
	}

	function resetForm() {
		date = new Date().toISOString().split('T')[0];
		amount = '';
		categoryId = '';
		// accountId stays as default (don't reset)
		description = '';
		errors = {};
		requestAnimationFrame(() => {
			amountInput?.focus();
		});
	}

	function handleInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSubmit();
		}
		if (e.key === 'Escape') {
			resetForm();
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

<div
	bind:this={rowEl}
	role="row"
	class="grid grid-cols-[120px_100px_150px_130px_1fr_80px] gap-0 items-center px-4 border-b border-sage/15 bg-sage/[0.04] border-l-2 border-l-sage/40 py-2.5"
>
	<!-- Date -->
	<div role="gridcell" class="pr-2 py-1" data-field="date">
		<input
			bind:this={dateInput}
			type="date"
			bind:value={date}
			class="w-full text-sm bg-transparent outline-none text-coffee-900 rounded px-1 py-0.5 border border-transparent focus:ring-2 focus:ring-[#639A88]/30
				{errors.date ? 'ring-2 ring-terracotta' : ''}"
			onkeydown={handleInputKeydown}
			oninput={() => clearError('date')}
			{disabled}
			aria-invalid={errors.date ? 'true' : undefined}
		/>
		{#if errors.date}
			<p class="text-[11px] text-terracotta leading-tight">{errors.date}</p>
		{/if}
	</div>

	<!-- Amount -->
	<div role="gridcell" class="pr-2 py-1" data-field="amount">
		<input
			bind:this={amountInput}
			type="number"
			step="0.01"
			min="0.01"
			bind:value={amount}
			placeholder="0,00 €"
			class="w-full text-sm bg-transparent outline-none text-coffee-900 rounded px-1 py-0.5 border border-transparent focus:ring-2 focus:ring-[#639A88]/30
				{errors.amount ? 'ring-2 ring-terracotta' : ''}"
			onkeydown={handleInputKeydown}
			oninput={() => clearError('amount')}
			{disabled}
			aria-invalid={errors.amount ? 'true' : undefined}
		/>
		{#if errors.amount}
			<p class="text-[11px] text-terracotta leading-tight">{errors.amount}</p>
		{/if}
	</div>

	<!-- Category -->
	<div role="gridcell" class="pr-2 py-1" data-field="category">
		<InlineDropdown
			items={categoryItems}
			selected={categoryId}
			placeholder="Catégorie..."
			error={!!errors.category_id}
			{disabled}
			onSelect={(item) => {
				categoryId = item.id;
				clearError('category_id');
			}}
			onEnterClosed={handleSubmit}
		/>
		{#if errors.category_id}
			<p class="text-[11px] text-terracotta leading-tight">{errors.category_id}</p>
		{/if}
	</div>

	<!-- Account -->
	<div role="gridcell" class="pr-2 py-1" data-field="account">
		<InlineDropdown
			items={accountItems}
			selected={accountId}
			placeholder="Compte..."
			{disabled}
			onSelect={(item) => {
				accountId = item.id;
			}}
			onEnterClosed={handleSubmit}
		/>
	</div>

	<!-- Description -->
	<div role="gridcell" class="pr-2 py-1" data-field="description">
		<input
			type="text"
			bind:value={description}
			placeholder="Description (optionnel)"
			maxlength="200"
			class="w-full text-sm bg-transparent outline-none text-coffee-900 placeholder-stone-400 rounded px-1 py-0.5 border border-transparent focus:ring-2 focus:ring-[#639A88]/30"
			onkeydown={handleInputKeydown}
			{disabled}
		/>
	</div>

	<!-- Actions -->
	<div role="gridcell" class="flex justify-center">
		<button
			type="button"
			class="w-7 h-7 flex items-center justify-center rounded-lg bg-sage/10 text-sage hover:bg-sage/20 transition-colors disabled:opacity-50"
			onclick={handleSubmit}
			{disabled}
			aria-label="Ajouter la transaction"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2.5"
					d="M12 5v14m7-7H5"
				/>
			</svg>
		</button>
	</div>
</div>

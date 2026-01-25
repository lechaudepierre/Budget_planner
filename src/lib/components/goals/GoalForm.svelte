<script lang="ts">
	import { goalSchema, type GoalFormData, type BreakdownItemFormData } from '$lib/schemas/goal';
	import type { SavingsGoalWithBreakdown } from '$lib/types/database';
	import { formatCurrency } from '$lib/utils/currency';
	import MonthYearPicker from '$lib/components/ui/MonthYearPicker.svelte';

	interface Props {
		goal?: SavingsGoalWithBreakdown | null;
		onSubmit: (data: GoalFormData) => Promise<void>;
		onCancel: () => void;
		isSubmitting?: boolean;
	}

	let { goal = null, onSubmit, onCancel, isSubmitting = false }: Props = $props();

	let name = $state(goal?.name ?? '');
	let targetAmount = $state(goal?.target_amount ?? 0);
	// Convert YYYY-MM-DD to YYYY-MM if present
	let targetDateMonth = $state(goal?.target_date ? goal.target_date.substring(0, 7) : '');
	let showBreakdown = $state((goal?.breakdown_items?.length ?? 0) > 0);
	let breakdownItems = $state<BreakdownItemFormData[]>(
		goal?.breakdown_items?.map((item) => ({ name: item.name, amount: item.amount })) ?? []
	);
	let errors = $state<Record<string, string>>({});

	// Calculate total from breakdown items
	let breakdownTotal = $derived(breakdownItems.reduce((sum, item) => sum + (item.amount || 0), 0));

	// Use breakdown total as target amount when breakdown is active
	let effectiveTargetAmount = $derived(showBreakdown && breakdownItems.length > 0 ? breakdownTotal : targetAmount);

	function addBreakdownItem() {
		breakdownItems = [...breakdownItems, { name: '', amount: 0 }];
	}

	function removeBreakdownItem(index: number) {
		breakdownItems = breakdownItems.filter((_, i) => i !== index);
	}

	function updateBreakdownItem(index: number, field: 'name' | 'amount', value: string | number) {
		breakdownItems = breakdownItems.map((item, i) => {
			if (i === index) {
				return { ...item, [field]: value };
			}
			return item;
		});
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errors = {};

		// Convert YYYY-MM to YYYY-MM-01 for database if set
		const targetDate = targetDateMonth ? targetDateMonth + '-01' : null;

		const formData: GoalFormData = {
			name,
			target_amount: effectiveTargetAmount,
			target_date: targetDate,
			breakdown_items: showBreakdown ? breakdownItems.filter((item) => item.name.trim()) : undefined
		};

		const result = goalSchema.safeParse(formData);

		if (!result.success) {
			for (const issue of result.error.issues) {
				const field = issue.path[0] as string;
				errors[field] = issue.message;
			}
			return;
		}

		await onSubmit(result.data);
	}
</script>

<form onsubmit={handleSubmit} class="space-y-5">
	<!-- Goal Name -->
	<div>
		<label class="block text-sm font-medium text-coffee-900 mb-2" for="goal-name">
			Nom de l'objectif
		</label>
		<input
			id="goal-name"
			type="text"
			bind:value={name}
			placeholder="Ex: Voyage au Japon, Nouveau PC..."
			class="w-full px-4 py-3 border rounded-xl bg-cotton text-coffee-900 placeholder-stone-400 outline-none transition-all focus:ring-2 focus:ring-sage/50"
			class:border-sand={!errors.name}
			class:focus:border-sage={!errors.name}
			class:border-terracotta={errors.name}
		/>
		{#if errors.name}
			<p class="text-sm text-terracotta mt-1">{errors.name}</p>
		{/if}
	</div>

	<!-- Target Amount (only show if no breakdown) -->
	{#if !showBreakdown}
		<div>
			<label class="block text-sm font-medium text-coffee-900 mb-2" for="target-amount">
				Montant cible
			</label>
			<div class="relative">
				<input
					id="target-amount"
					type="number"
					step="0.01"
					min="0"
					bind:value={targetAmount}
					placeholder="0.00"
					class="w-full px-4 py-3 pr-10 border rounded-xl bg-cotton text-coffee-900 placeholder-stone-400 outline-none transition-all focus:ring-2 focus:ring-sage/50"
					class:border-sand={!errors.target_amount}
					class:focus:border-sage={!errors.target_amount}
					class:border-terracotta={errors.target_amount}
				/>
				<span class="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500">€</span>
			</div>
			{#if errors.target_amount}
				<p class="text-sm text-terracotta mt-1">{errors.target_amount}</p>
			{/if}
		</div>
	{/if}

	<!-- Target Date (Optional) -->
	<div>
		<div class="flex justify-between items-center mb-2">
			<label class="block text-sm font-medium text-coffee-900" for="target-date">
				Mois cible
			</label>
			<span class="text-xs text-stone-500">Optionnel</span>
		</div>
		<MonthYearPicker
			id="target-date"
			bind:value={targetDateMonth}
			placeholder="Sélectionner un mois"
		/>
	</div>

	<!-- Budget Breakdown Toggle -->
	<div class="border-t border-sand pt-4">
		<button
			type="button"
			onclick={() => {
				showBreakdown = !showBreakdown;
				if (showBreakdown && breakdownItems.length === 0) {
					addBreakdownItem();
				}
			}}
			class="flex items-center gap-2 text-sm font-medium text-sage hover:text-sage-dark transition-colors"
		>
			<svg
				class="w-4 h-4 transition-transform"
				class:rotate-90={showBreakdown}
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
			Détailler le budget
		</button>

		{#if showBreakdown}
			<div class="mt-4 space-y-3">
				{#each breakdownItems as item, index}
					<div class="flex gap-2 items-start">
						<div class="flex-1">
							<input
								type="text"
								placeholder="Ex: Transport, Logement..."
								value={item.name}
								oninput={(e) => updateBreakdownItem(index, 'name', (e.target as HTMLInputElement).value)}
								class="w-full px-3 py-2 border border-sand rounded-xl bg-cotton text-coffee-900 placeholder-stone-400 text-sm outline-none transition-all focus:ring-2 focus:ring-sage/50 focus:border-sage"
							/>
						</div>
						<div class="w-28">
							<div class="relative">
								<input
									type="number"
									step="0.01"
									min="0"
									placeholder="0"
									value={item.amount || ''}
									oninput={(e) => updateBreakdownItem(index, 'amount', parseFloat((e.target as HTMLInputElement).value) || 0)}
									class="w-full px-3 py-2 pr-7 border border-sand rounded-xl bg-cotton text-coffee-900 text-sm outline-none transition-all focus:ring-2 focus:ring-sage/50 focus:border-sage"
								/>
								<span class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">€</span>
							</div>
						</div>
						<button
							type="button"
							onclick={() => removeBreakdownItem(index)}
							class="p-2 text-stone-400 hover:text-terracotta transition-colors"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				{/each}

				<button
					type="button"
					onclick={addBreakdownItem}
					class="flex items-center gap-2 text-sm text-sage hover:text-sage-dark transition-colors"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5" />
					</svg>
					Ajouter une ligne
				</button>

				{#if breakdownItems.length > 0}
					<div class="mt-4 p-3 bg-oat rounded-xl">
						<div class="flex justify-between items-center">
							<span class="text-sm text-stone-600">Total</span>
							<span class="font-semibold text-coffee-900">{formatCurrency(breakdownTotal)}</span>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Preview -->
	<div class="p-4 bg-oat rounded-xl">
		<p class="text-sm text-stone-500 mb-2">Aperçu</p>
		<div class="flex items-center justify-between">
			<span class="font-medium text-coffee-900">{name || "Nom de l'objectif"}</span>
			<span class="text-lg font-semibold text-sage">{formatCurrency(effectiveTargetAmount)}</span>
		</div>
		{#if targetDateMonth}
			<p class="text-sm text-stone-500 mt-1">
				Objectif: {new Date(targetDateMonth + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
			</p>
		{/if}
	</div>

	<!-- Actions -->
	<div class="flex gap-3 pt-2">
		<button
			type="button"
			onclick={onCancel}
			class="flex-1 px-5 py-3 rounded-xl text-coffee-900 bg-oat hover:bg-sand font-medium transition-colors"
			disabled={isSubmitting}
		>
			Annuler
		</button>
		<button
			type="submit"
			class="flex-1 px-5 py-3 rounded-xl bg-sage hover:bg-sage-dark text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
			disabled={isSubmitting || !name.trim() || effectiveTargetAmount <= 0}
		>
			{#if isSubmitting}
				<span class="loading loading-spinner loading-sm"></span>
			{/if}
			{goal ? 'Modifier' : 'Créer'}
		</button>
	</div>
</form>

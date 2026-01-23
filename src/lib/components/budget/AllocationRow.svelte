<script lang="ts">
	import type { Database } from '$lib/types/database';
	import { CATEGORY_COLORS } from '$lib/schemas/budget';

	type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];

	let {
		category,
		amount,
		totalIncome,
		onAmountChange,
		onDelete,
		onCategoryUpdate
	} = $props<{
		category: BudgetCategory;
		amount: number;
		totalIncome: number;
		onAmountChange: (amount: number) => void;
		onDelete: () => void;
		onCategoryUpdate: (id: string, updates: { name?: string; color?: string }) => Promise<void>;
	}>();

	// Edit mode state
	let isEditing = $state(false);
	let editName = $state(category.name);
	let editColor = $state(category.color);
	let editAmount = $state(amount);
	let showColorPicker = $state(false);
	let nameError = $state('');
	let isSaving = $state(false);

	// Derived calculations
	let percentage = $derived(totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0);
	let progressWidth = $derived(Math.min(percentage, 100));

	function startEditing() {
		editName = category.name;
		editColor = category.color;
		editAmount = amount;
		nameError = '';
		isEditing = true;
	}

	function cancelEditing() {
		editName = category.name;
		editColor = category.color;
		editAmount = amount;
		nameError = '';
		showColorPicker = false;
		isEditing = false;
	}

	function validateName(): boolean {
		const trimmed = editName.trim();
		if (!trimmed) {
			nameError = 'Le nom est requis';
			return false;
		}
		if (trimmed.length > 50) {
			nameError = 'Maximum 50 caractères';
			return false;
		}
		nameError = '';
		return true;
	}

	async function saveChanges() {
		if (!validateName()) return;

		const trimmedName = editName.trim();
		const hasNameColorChanges = trimmedName !== category.name || editColor !== category.color;
		const hasAmountChanges = editAmount !== amount;

		isSaving = true;

		// Save name/color changes if any
		if (hasNameColorChanges) {
			const updates: { name?: string; color?: string } = {};
			if (trimmedName !== category.name) updates.name = trimmedName;
			if (editColor !== category.color) updates.color = editColor;
			await onCategoryUpdate(category.id, updates);
		}

		// Save amount changes
		if (hasAmountChanges) {
			onAmountChange(editAmount);
		}

		isSaving = false;
		isEditing = false;
		showColorPicker = false;
	}

	function handleNameKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			saveChanges();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			cancelEditing();
		}
	}

	function handleAmountKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			saveChanges();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			cancelEditing();
		}
	}

	function selectColor(color: string) {
		editColor = color;
		showColorPicker = false;
	}
</script>

<div
	class="bg-cotton border rounded-xl p-3 transition-all duration-150"
	class:border-sage={isEditing}
	class:border-sand={!isEditing}
	class:shadow-md={isEditing}
	class:hover:shadow-md={!isEditing}
>
	<div class="flex items-center gap-3">
		<!-- Color indicator / picker -->
		<div class="relative">
			{#if isEditing}
				<button
					type="button"
					onclick={() => (showColorPicker = !showColorPicker)}
					class="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-sage/50 transition-all"
					style="background-color: {editColor}20"
					title="Changer la couleur"
				>
					<div class="w-3 h-3 rounded-full" style="background-color: {editColor}"></div>
				</button>

				<!-- Color picker dropdown -->
				{#if showColorPicker}
					<div class="absolute top-12 left-0 z-10 bg-white border border-sand rounded-xl p-4 shadow-lg min-w-[220px]">
						<p class="text-xs text-stone-500 mb-3">Choisir une couleur</p>
						<div class="grid grid-cols-5 gap-4">
							{#each CATEGORY_COLORS as colorOption (colorOption.value)}
								<button
									type="button"
									onclick={() => selectColor(colorOption.value)}
									class="w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
									class:ring-2={editColor === colorOption.value}
									class:ring-sage={editColor === colorOption.value}
									class:ring-offset-2={editColor === colorOption.value}
									style="background-color: {colorOption.value}30"
									title={colorOption.label}
								>
									<div
										class="w-5 h-5 rounded-full"
										style="background-color: {colorOption.value}"
									></div>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			{:else}
				<div
					class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
					style="background-color: {category.color}20"
				>
					<div class="w-3 h-3 rounded-full" style="background-color: {category.color}"></div>
				</div>
			{/if}
		</div>

		<!-- Name and progress -->
		<div class="flex-1 min-w-0">
			<div class="flex items-center justify-between mb-1">
				{#if isEditing}
					<div class="flex-1 mr-2">
						<input
							type="text"
							bind:value={editName}
							onkeydown={handleNameKeydown}
							class="input input-sm input-bordered w-full bg-white border-sand focus:border-sage focus:ring-sage"
							class:border-terracotta={nameError}
							placeholder="Nom de la catégorie"
							maxlength="50"
						/>
						{#if nameError}
							<p class="text-xs text-terracotta mt-1">{nameError}</p>
						{/if}
					</div>
				{:else}
					<span class="font-medium text-coffee-900 truncate">
						{category.name}
					</span>
				{/if}
				<span class="text-xs text-stone-500 ml-2 shrink-0">{percentage}%</span>
			</div>

			<!-- Progress bar -->
			<div class="h-1.5 bg-oat rounded-full overflow-hidden">
				<div
					class="h-full rounded-full transition-all duration-300"
					style="width: {progressWidth}%; background-color: {isEditing ? editColor : category.color}"
				></div>
			</div>
		</div>

		<!-- Amount display/input -->
		<div class="flex items-center gap-1 shrink-0">
			{#if isEditing}
				<div class="relative">
					<input
						type="number"
						bind:value={editAmount}
						onkeydown={handleAmountKeydown}
						class="input input-sm input-bordered w-20 text-right text-sm bg-white border-sand focus:border-sage focus:ring-sage pr-6 h-8"
						min="0"
						step="10"
					/>
					<span class="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 text-xs">€</span>
				</div>
			{:else}
				<span class="text-sm font-medium text-coffee-900 w-20 text-right">
					{amount.toLocaleString('fr-FR')} €
				</span>
			{/if}

			<!-- Edit/Cancel or Delete button -->
			{#if isEditing}
				<button
					type="button"
					onclick={cancelEditing}
					class="btn btn-ghost btn-sm text-stone-500 hover:text-coffee-900"
					title="Annuler (Échap)"
					disabled={isSaving}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
				<button
					type="button"
					onclick={saveChanges}
					class="btn btn-ghost btn-sm text-sage hover:text-sage-dark hover:bg-sage/10"
					title="Enregistrer (Entrée)"
					disabled={isSaving}
				>
					{#if isSaving}
						<span class="loading loading-spinner loading-xs"></span>
					{:else}
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
					{/if}
				</button>
			{:else}
				<button
					type="button"
					onclick={startEditing}
					class="btn btn-ghost btn-sm text-stone-500 hover:text-sage hover:bg-sage/10"
					title="Modifier"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
					</svg>
				</button>
				<button
					type="button"
					onclick={onDelete}
					class="btn btn-ghost btn-sm text-stone-500 hover:text-terracotta hover:bg-terracotta/10"
					title="Supprimer"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</div>
</div>

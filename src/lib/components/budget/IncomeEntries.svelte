<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';
	import { INCOME_TYPES, type IncomeEntry } from '$lib/types/database';
	import {
		getIncomeEntries,
		createIncomeEntry,
		updateIncomeEntry,
		deleteIncomeEntry
	} from '$lib/data/income';
	import { toast } from '$lib/stores/toast';

	let {
		month,
		onTotalChange
	}: {
		month: string;
		onTotalChange: (total: number) => void;
	} = $props();

	// State
	let entries = $state<IncomeEntry[]>([]);
	let loading = $state(true);
	let showAddForm = $state(false);
	let editingId = $state<string | null>(null);

	// Add form state
	let newType = $state('salaire');
	let newLabel = $state('');
	let newAmount = $state('');
	let addingSaving = $state(false);

	// Edit form state
	let editType = $state('');
	let editLabel = $state('');
	let editAmount = $state('');
	let editSaving = $state(false);

	// Computed total
	let total = $derived(entries.reduce((sum, e) => sum + Number(e.amount), 0));

	// Notify parent when total changes
	$effect(() => {
		onTotalChange(total);
	});

	// Load entries when month changes
	$effect(() => {
		if (month) {
			loadEntries();
		}
	});

	async function loadEntries() {
		loading = true;
		const { data } = await getIncomeEntries(month);
		entries = data;
		loading = false;
	}

	function getTypeInfo(type: string) {
		return INCOME_TYPES.find((t) => t.value === type) || INCOME_TYPES[INCOME_TYPES.length - 1];
	}

	async function handleAdd() {
		if (!newAmount || parseFloat(newAmount) <= 0) {
			toast.error('Montant invalide');
			return;
		}

		addingSaving = true;
		const { data, error } = await createIncomeEntry({
			month,
			type: newType,
			label: newLabel.trim() || null,
			amount: parseFloat(newAmount)
		});

		addingSaving = false;

		if (error) {
			toast.error('Erreur lors de l\'ajout');
			return;
		}

		if (data) {
			entries = [...entries, data];
			// Reset form
			newType = 'salaire';
			newLabel = '';
			newAmount = '';
			showAddForm = false;
			toast.success('Revenu ajouté');
		}
	}

	function startEdit(entry: IncomeEntry) {
		editingId = entry.id;
		editType = entry.type;
		editLabel = entry.label || '';
		editAmount = entry.amount.toString();
	}

	function cancelEdit() {
		editingId = null;
		editType = '';
		editLabel = '';
		editAmount = '';
	}

	async function handleSaveEdit(id: string) {
		if (!editAmount || parseFloat(editAmount) <= 0) {
			toast.error('Montant invalide');
			return;
		}

		editSaving = true;
		const { data, error } = await updateIncomeEntry(id, {
			type: editType,
			label: editLabel.trim() || null,
			amount: parseFloat(editAmount)
		});

		editSaving = false;

		if (error) {
			toast.error('Erreur lors de la modification');
			return;
		}

		if (data) {
			entries = entries.map((e) => (e.id === id ? data : e));
			cancelEdit();
			toast.success('Revenu modifié');
		}
	}

	async function handleDelete(id: string) {
		const { error } = await deleteIncomeEntry(id);

		if (error) {
			toast.error('Erreur lors de la suppression');
			return;
		}

		entries = entries.filter((e) => e.id !== id);
		toast.success('Revenu supprimé');
	}
</script>

<div class="flex flex-col h-full min-h-0">
	<!-- Header -->
	<div class="flex items-center justify-between mb-3 flex-shrink-0">
		<h2 class="text-base font-semibold text-coffee-900">Sources de revenus</h2>
		{#if !showAddForm}
			<button
				type="button"
				class="w-8 h-8 flex items-center justify-center rounded-lg text-sage hover:bg-sage/10 transition-colors"
				onclick={() => (showAddForm = true)}
				title="Ajouter un revenu"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5" />
				</svg>
			</button>
		{/if}
	</div>

	{#if loading}
		<div class="flex justify-center items-center flex-1">
			<span class="loading loading-spinner loading-sm text-sage"></span>
		</div>
	{:else}
		<!-- Scrollable content area -->
		<div class="flex-1 overflow-y-auto pr-1 scrollbar-thin min-h-0">
			{#if entries.length > 0}
				<div class="space-y-2">
				{#each entries as entry (entry.id)}
					{@const typeInfo = getTypeInfo(entry.type)}
					{#if editingId === entry.id}
						<!-- Edit mode -->
						<div class="bg-white border border-sage rounded-xl p-3 space-y-2">
							<div class="flex gap-2">
								<select
									bind:value={editType}
									class="select select-sm bg-cotton border-sand focus:border-sage flex-1"
								>
									{#each INCOME_TYPES as type}
										<option value={type.value}>{type.label}</option>
									{/each}
								</select>
								<div class="relative flex-1">
									<input
										type="number"
										bind:value={editAmount}
										class="input input-sm w-full pr-7 text-right bg-cotton border-sand focus:border-sage"
										min="0.01"
										step="0.01"
									/>
									<span class="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 text-xs">€</span>
								</div>
							</div>
							<input
								type="text"
								bind:value={editLabel}
								class="input input-sm w-full bg-cotton border-sand focus:border-sage"
								placeholder="Description (optionnel)"
							/>
							<div class="flex justify-end gap-2">
								<button
									type="button"
									class="btn btn-xs btn-ghost text-stone-500"
									onclick={cancelEdit}
									disabled={editSaving}
								>
									Annuler
								</button>
								<button
									type="button"
									class="btn btn-xs bg-sage hover:bg-sage-dark text-white border-none"
									onclick={() => handleSaveEdit(entry.id)}
									disabled={editSaving}
								>
									{#if editSaving}
										<span class="loading loading-spinner loading-xs"></span>
									{/if}
									Enregistrer
								</button>
							</div>
						</div>
					{:else}
						<!-- Display mode -->
						<div class="flex items-center gap-3 bg-oat/50 rounded-xl p-3 group">
							<span class="text-sm font-medium text-stone-500">{typeInfo.label}</span>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-coffee-900 truncate">
									{entry.label || typeInfo.label}
								</p>
								{#if entry.label}
									<p class="text-xs text-stone-500">{typeInfo.label}</p>
								{/if}
							</div>
							<span class="font-semibold text-sage">{formatCurrency(entry.amount)}</span>
							<div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
								<button
									type="button"
									class="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-sage hover:bg-sage/10 transition-colors"
									onclick={() => startEdit(entry)}
									title="Modifier"
								>
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
									</svg>
								</button>
								<button
									type="button"
									class="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-terracotta hover:bg-terracotta/10 transition-colors"
									onclick={() => handleDelete(entry.id)}
									title="Supprimer"
								>
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</button>
							</div>
						</div>
					{/if}
				{/each}
				</div>
			{:else if !showAddForm}
				<div class="flex items-center justify-center h-full">
					<p class="text-sm text-stone-500 text-center">
						Aucun revenu enregistré ce mois
					</p>
				</div>
			{/if}

			<!-- Add form -->
			{#if showAddForm}
				<div class="bg-white border border-sage rounded-xl p-3 space-y-2 mt-2">
					<div class="flex gap-2">
						<select
							bind:value={newType}
							class="select select-sm bg-cotton border-sand focus:border-sage flex-1"
						>
							{#each INCOME_TYPES as type}
								<option value={type.value}>{type.label}</option>
							{/each}
						</select>
						<div class="relative flex-1">
							<input
							type="number"
							bind:value={newAmount}
							class="input input-sm w-full pr-7 text-right bg-cotton border-sand focus:border-sage"
							placeholder="0"
							min="0.01"
							step="0.01"
						/>
						<span class="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 text-xs">€</span>
					</div>
				</div>
				<input
					type="text"
					bind:value={newLabel}
					class="input input-sm w-full bg-cotton border-sand focus:border-sage"
					placeholder="Description (optionnel)"
				/>
				<div class="flex justify-end gap-2">
					<button
						type="button"
						class="btn btn-xs btn-ghost text-stone-500"
						onclick={() => {
							showAddForm = false;
							newType = 'salaire';
							newLabel = '';
							newAmount = '';
						}}
						disabled={addingSaving}
					>
						Annuler
					</button>
					<button
						type="button"
						class="btn btn-xs bg-sage hover:bg-sage-dark text-white border-none"
						onclick={handleAdd}
						disabled={addingSaving || !newAmount}
					>
						{#if addingSaving}
							<span class="loading loading-spinner loading-xs"></span>
						{/if}
						Ajouter
					</button>
				</div>
				</div>
			{/if}
		</div>

		<!-- Total - always at bottom -->
		{#if entries.length > 0}
			<div class="flex justify-between items-center pt-3 border-t border-sand flex-shrink-0">
				<span class="text-sm text-stone-600">Total</span>
				<span class="font-bold text-coffee-900">{formatCurrency(total)}</span>
			</div>
		{/if}
	{/if}
</div>

<style>
	/* Custom thin scrollbar for the entries list */
	.scrollbar-thin::-webkit-scrollbar {
		width: 4px;
	}
	.scrollbar-thin::-webkit-scrollbar-track {
		background: transparent;
	}
	.scrollbar-thin::-webkit-scrollbar-thumb {
		background: #E2DCD2;
		border-radius: 4px;
	}
	.scrollbar-thin::-webkit-scrollbar-thumb:hover {
		background: #C4BFB6;
	}
</style>

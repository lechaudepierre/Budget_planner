<script lang="ts">
	import { getExpenses } from '$lib/data/expenses';
	import { formatCurrency } from '$lib/utils/currency';
	import { getGaugeColor } from '$lib/utils/gauge-colors';
	import type { ExpenseWithCategory } from '$lib/types/database';

	let {
		isOpen = false,
		categoryId,
		categoryName,
		categoryColor,
		spent,
		budget,
		month,
		onClose
	}: {
		isOpen: boolean;
		categoryId: string;
		categoryName: string;
		categoryColor: string;
		spent: number;
		budget: number;
		month?: string;
		onClose: () => void;
	} = $props();

	let expenses = $state<ExpenseWithCategory[]>([]);
	let loading = $state(false);

	// Calculate percentage and status
	let percentage = $derived(budget > 0 ? (spent / budget) * 100 : 0);
	let remaining = $derived(budget - spent);
	let gaugeColor = $derived(getGaugeColor(percentage));

	// Load expenses when modal opens
	$effect(() => {
		if (isOpen && categoryId) {
			loadExpenses();
		}
	});

	async function loadExpenses() {
		loading = true;
		
		// Prepare options for getExpenses
		const options: {
			categoryId: string;
			limit: number;
			startDate?: string;
			endDate?: string;
		} = {
			categoryId,
			limit: 20
		};
		
		// If month is provided, filter by date range
		if (month) {
			const [year, monthNum] = month.split('-').map(Number);
			options.startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
			const lastDay = new Date(year, monthNum, 0).getDate();
			options.endDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
		}
		
		const { data } = await getExpenses(options);
		expenses = data;
		loading = false;
	}

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short'
		});
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in"
		onclick={onClose}
		role="button"
		tabindex="-1"
		aria-label="Fermer"
	></div>

	<!-- Modal Container -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<!-- Modal -->
		<div
			class="bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up pointer-events-auto"
		>
			<!-- Header -->
			<div class="p-5 border-b border-sand">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div
							class="w-4 h-4 rounded-full shrink-0"
							style="background-color: {categoryColor}"
						></div>
						<h2 id="modal-title" class="text-lg font-semibold text-coffee-900">
							{categoryName}
						</h2>
					</div>
					<button
						onclick={onClose}
						class="p-2 hover:bg-oat rounded-lg transition-colors text-stone-500 hover:text-coffee-900"
						aria-label="Fermer"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<!-- Budget Summary -->
				<div class="mt-4 p-4 bg-oat rounded-xl">
					<div class="flex justify-between items-center mb-2">
						<span class="text-sm text-stone-500">Progression</span>
						<span class="text-sm font-medium" style="color: {gaugeColor}">
							{Math.round(percentage)}%
						</span>
					</div>
					<div class="w-full bg-sand rounded-full h-2 mb-3">
						<div
							class="h-2 rounded-full transition-all duration-500"
							style="width: {Math.min(percentage, 100)}%; background-color: {gaugeColor}"
						></div>
					</div>
					<div class="grid grid-cols-3 gap-2 text-center">
						<div>
							<p class="text-xs text-stone-500">Budget</p>
							<p class="text-sm font-semibold text-coffee-900">{formatCurrency(budget)}</p>
						</div>
						<div>
							<p class="text-xs text-stone-500">Dépensé</p>
							<p class="text-sm font-semibold" style="color: {gaugeColor}">{formatCurrency(spent)}</p>
						</div>
						<div>
							<p class="text-xs text-stone-500">Restant</p>
							<p class="text-sm font-semibold" class:text-sage={remaining >= 0} class:text-terracotta={remaining < 0}>
								{formatCurrency(remaining)}
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Expenses List -->
			<div class="px-5 pt-5 pb-2">
				<h3 class="text-sm font-medium text-stone-500 mb-3">Historique des dépenses</h3>

				{#if loading}
					<div class="space-y-2 max-h-[200px]">
						{#each [1, 2, 3] as _}
							<div class="animate-pulse flex justify-between items-center p-3 bg-oat rounded-lg">
								<div class="space-y-2">
									<div class="h-3 w-24 bg-sand rounded"></div>
									<div class="h-2 w-16 bg-sand rounded"></div>
								</div>
								<div class="h-4 w-16 bg-sand rounded"></div>
							</div>
						{/each}
					</div>
				{:else if expenses.length === 0}
					<div class="text-center py-6">
						<div class="w-12 h-12 bg-oat rounded-full flex items-center justify-center mx-auto mb-3">
							<svg class="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
						<p class="text-stone-500 text-sm">Aucune dépense ce mois</p>
					</div>
				{:else}
					<div class="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
						{#each expenses as expense (expense.id)}
							<div class="flex justify-between items-center p-3 bg-cotton hover:bg-oat rounded-lg transition-colors">
								<div>
									<p class="text-sm text-coffee-900 font-medium">
										{expense.description || 'Dépense'}
									</p>
									<p class="text-xs text-stone-500">{formatDate(expense.date)}</p>
								</div>
								<span class="text-sm font-semibold text-coffee-900">
									-{formatCurrency(expense.amount)}
								</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="p-4 border-t border-sand">
				<a
					href="/expenses?category={categoryId}"
					class="block w-full text-center py-2.5 px-4 bg-sage hover:bg-sage-dark text-white rounded-xl transition-colors text-sm font-medium"
				>
					Voir toutes les dépenses
				</a>
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

	/* Custom scrollbar for expenses list */
	.scrollbar-thin::-webkit-scrollbar {
		width: 6px;
	}

	.scrollbar-thin::-webkit-scrollbar-track {
		background: transparent;
	}

	.scrollbar-thin::-webkit-scrollbar-thumb {
		background-color: #E2DCD2;
		border-radius: 3px;
	}

	.scrollbar-thin::-webkit-scrollbar-thumb:hover {
		background-color: #C5BEB3;
	}
</style>

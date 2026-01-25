<script lang="ts">
	import { onMount } from 'svelte';
	import { getGoals } from '$lib/data/goals';
	import { getAccounts } from '$lib/data/accounts';
	import {
		getSavingsAllocations,
		upsertGoalAllocation,
		upsertAccountAllocation,
		transferToGoal,
		transferToAccount
	} from '$lib/data/savings-allocations';
	import { formatCurrency } from '$lib/utils/currency';
	import { calculateProgress } from '$lib/schemas/goal';
	import { toast } from '$lib/stores/toast';
	import type { SavingsGoal, SavingsAllocationWithDetails } from '$lib/types/database';
	import type { Database } from '$lib/types/database';

	type Account = Database['public']['Tables']['accounts']['Row'];

	interface Props {
		month: string;
		onTotalChange?: (total: number) => void;
	}

	let { month, onTotalChange }: Props = $props();

	let goals = $state<SavingsGoal[]>([]);
	let savingsAccounts = $state<Account[]>([]);
	let allocations = $state<SavingsAllocationWithDetails[]>([]);
	let loading = $state(true);
	let isSaving = $state(false);

	// Local state for editing amounts
	let goalAmounts = $state<Map<string, number>>(new Map());
	let accountAmounts = $state<Map<string, number>>(new Map());

	// Calculate total allocated to savings
	let totalSavingsAllocated = $derived(() => {
		let total = 0;
		for (const amt of goalAmounts.values()) total += amt;
		for (const amt of accountAmounts.values()) total += amt;
		return total;
	});

	$effect(() => {
		onTotalChange?.(totalSavingsAllocated());
	});

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;

		const [goalsResult, accountsResult, allocationsResult] = await Promise.all([
			getGoals(),
			getAccounts(),
			getSavingsAllocations(month)
		]);

		goals = goalsResult.data || [];
		// Filter only savings accounts
		savingsAccounts = (accountsResult.data || []).filter((a) => a.account_type === 'savings');
		allocations = allocationsResult.data || [];

		// Initialize amounts from existing allocations
		const newGoalAmounts = new Map<string, number>();
		const newAccountAmounts = new Map<string, number>();

		for (const alloc of allocations) {
			if (alloc.goal_id) {
				newGoalAmounts.set(alloc.goal_id, alloc.allocated_amount);
			} else if (alloc.account_id) {
				newAccountAmounts.set(alloc.account_id, alloc.allocated_amount);
			}
		}

		goalAmounts = newGoalAmounts;
		accountAmounts = newAccountAmounts;

		loading = false;
	}

	async function handleGoalAmountChange(goalId: string, amount: number) {
		goalAmounts.set(goalId, amount);
		goalAmounts = new Map(goalAmounts);
	}

	async function handleAccountAmountChange(accountId: string, amount: number) {
		accountAmounts.set(accountId, amount);
		accountAmounts = new Map(accountAmounts);
	}

	async function handleSaveAllocations() {
		isSaving = true;

		// Save goal allocations
		for (const [goalId, amount] of goalAmounts) {
			if (amount > 0) {
				await upsertGoalAllocation(month, goalId, amount);
			}
		}

		// Save account allocations
		for (const [accountId, amount] of accountAmounts) {
			if (amount > 0) {
				await upsertAccountAllocation(month, accountId, amount);
			}
		}

		// Reload allocations
		const { data } = await getSavingsAllocations(month);
		allocations = data || [];

		isSaving = false;
		toast.success('Allocations épargne enregistrées');
	}

	async function handleTransferToGoal(goalId: string) {
		const alloc = allocations.find((a) => a.goal_id === goalId);
		if (!alloc) return;

		const amountToTransfer = alloc.allocated_amount - alloc.transferred_amount;
		if (amountToTransfer <= 0) {
			toast.error('Montant déjà transféré');
			return;
		}

		const { error } = await transferToGoal(alloc.id, amountToTransfer);
		if (error) {
			toast.error('Erreur lors du transfert');
		} else {
			toast.success(`${formatCurrency(amountToTransfer)} ajoutés à l'objectif`);
			await loadData();
		}
	}

	async function handleTransferToAccount(accountId: string) {
		const alloc = allocations.find((a) => a.account_id === accountId);
		if (!alloc) return;

		const amountToTransfer = alloc.allocated_amount - alloc.transferred_amount;
		if (amountToTransfer <= 0) {
			toast.error('Montant déjà transféré');
			return;
		}

		const { error } = await transferToAccount(alloc.id, amountToTransfer);
		if (error) {
			toast.error('Erreur lors du transfert');
		} else {
			toast.success(`${formatCurrency(amountToTransfer)} ajoutés au compte`);
			await loadData();
		}
	}

	function getAllocationForGoal(goalId: string): SavingsAllocationWithDetails | undefined {
		return allocations.find((a) => a.goal_id === goalId);
	}

	function getAllocationForAccount(accountId: string): SavingsAllocationWithDetails | undefined {
		return allocations.find((a) => a.account_id === accountId);
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<div class="w-8 h-8 bg-sage/10 rounded-lg flex items-center justify-center">
				<svg class="w-4 h-4 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" stroke-linecap="round" stroke-linejoin="round" />
					<path d="M2 9v1c0 1.1.9 2 2 2h1" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</div>
			<h2 class="text-lg font-semibold text-coffee-900">Épargne mensuelle</h2>
		</div>
		<a href="/epargne" class="text-sm text-sage hover:text-sage-dark font-medium">
			Gérer les objectifs →
		</a>
	</div>

	{#if loading}
		<div class="flex justify-center py-8">
			<span class="loading loading-spinner loading-md text-sage"></span>
		</div>
	{:else if goals.length === 0 && savingsAccounts.length === 0}
		<div class="text-center py-8 bg-cotton rounded-2xl border border-sand">
			<div class="w-12 h-12 bg-oat rounded-full flex items-center justify-center mx-auto mb-3">
				<svg class="w-6 h-6 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</div>
			<p class="text-stone-500 text-sm mb-3">Aucun objectif ou compte épargne</p>
			<div class="flex gap-2 justify-center">
				<a
					href="/epargne"
					class="px-4 py-2 bg-sage hover:bg-sage-dark text-white text-sm rounded-xl font-medium transition-colors"
				>
					Créer un objectif
				</a>
				<a
					href="/patrimoine"
					class="px-4 py-2 bg-oat hover:bg-sand text-coffee-900 text-sm rounded-xl font-medium transition-colors"
				>
					Ajouter un compte
				</a>
			</div>
		</div>
	{:else}
		<div class="space-y-3">
			<!-- Goals Section -->
			{#if goals.length > 0}
				<div class="bg-cotton border border-sand rounded-xl p-4">
					<h3 class="text-sm font-medium text-stone-500 mb-3 flex items-center gap-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Objectifs d'épargne
					</h3>
					<div class="space-y-3">
						{#each goals as goal (goal.id)}
							{@const progress = calculateProgress(goal.current_amount, goal.target_amount)}
							{@const alloc = getAllocationForGoal(goal.id)}
							{@const allocated = goalAmounts.get(goal.id) ?? 0}
							{@const transferred = alloc?.transferred_amount ?? 0}
							{@const canTransfer = alloc && allocated > transferred}
							<div class="flex items-center gap-3 p-3 bg-white rounded-xl">
								<!-- Progress indicator -->
								<div class="w-10 h-10 relative flex-shrink-0">
									<svg class="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
										<circle cx="20" cy="20" r="16" fill="none" stroke="#E5E0DB" stroke-width="4" />
										<circle
											cx="20"
											cy="20"
											r="16"
											fill="none"
											stroke="#639A88"
											stroke-width="4"
											stroke-linecap="round"
											stroke-dasharray={100.53}
											stroke-dashoffset={100.53 - (Math.min(progress, 100) / 100) * 100.53}
										/>
									</svg>
									<span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-sage">
										{progress}%
									</span>
								</div>

								<!-- Goal info -->
								<div class="flex-1 min-w-0">
									<p class="font-medium text-coffee-900 truncate">{goal.name}</p>
									<p class="text-xs text-stone-400">
										{formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
									</p>
								</div>

								<!-- Amount input -->
								<div class="flex items-center gap-2">
									<div class="relative w-24">
										<input
											type="number"
											step="0.01"
											min="0"
											placeholder="0"
											value={allocated || ''}
											oninput={(e) => handleGoalAmountChange(goal.id, parseFloat((e.target as HTMLInputElement).value) || 0)}
											class="w-full px-3 py-2 pr-7 border border-sand rounded-lg bg-cotton text-coffee-900 text-sm outline-none transition-all focus:ring-2 focus:ring-sage/50 focus:border-sage text-right"
										/>
										<span class="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 text-sm">€</span>
									</div>

									<!-- Transfer button -->
									{#if canTransfer}
										<button
											type="button"
											onclick={() => handleTransferToGoal(goal.id)}
											class="p-2 text-sage hover:bg-sage/10 rounded-lg transition-colors"
											title="Transférer vers l'objectif"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
											</svg>
										</button>
									{:else if transferred > 0}
										<div class="p-2 text-sage" title="Déjà transféré">
											<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
												<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Savings Accounts Section -->
			{#if savingsAccounts.length > 0}
				<div class="bg-cotton border border-sand rounded-xl p-4">
					<h3 class="text-sm font-medium text-stone-500 mb-3 flex items-center gap-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
						</svg>
						Comptes épargne
					</h3>
					<div class="space-y-3">
						{#each savingsAccounts as account (account.id)}
							{@const alloc = getAllocationForAccount(account.id)}
							{@const allocated = accountAmounts.get(account.id) ?? 0}
							{@const transferred = alloc?.transferred_amount ?? 0}
							{@const canTransfer = alloc && allocated > transferred}
							<div class="flex items-center gap-3 p-3 bg-white rounded-xl">
								<!-- Account icon -->
								<div class="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center flex-shrink-0">
									<svg class="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
									</svg>
								</div>

								<!-- Account info -->
								<div class="flex-1 min-w-0">
									<p class="font-medium text-coffee-900 truncate">{account.name}</p>
									<p class="text-xs text-stone-400">
										Solde: {formatCurrency(account.balance)}
									</p>
								</div>

								<!-- Amount input -->
								<div class="flex items-center gap-2">
									<div class="relative w-24">
										<input
											type="number"
											step="0.01"
											min="0"
											placeholder="0"
											value={allocated || ''}
											oninput={(e) => handleAccountAmountChange(account.id, parseFloat((e.target as HTMLInputElement).value) || 0)}
											class="w-full px-3 py-2 pr-7 border border-sand rounded-lg bg-cotton text-coffee-900 text-sm outline-none transition-all focus:ring-2 focus:ring-sage/50 focus:border-sage text-right"
										/>
										<span class="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 text-sm">€</span>
									</div>

									<!-- Transfer button -->
									{#if canTransfer}
										<button
											type="button"
											onclick={() => handleTransferToAccount(account.id)}
											class="p-2 text-sage hover:bg-sage/10 rounded-lg transition-colors"
											title="Transférer vers le compte"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
											</svg>
										</button>
									{:else if transferred > 0}
										<div class="p-2 text-sage" title="Déjà transféré">
											<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
												<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Summary & Save -->
			<div class="flex items-center justify-between pt-2">
				<div class="text-sm text-stone-500">
					Total épargne: <span class="font-semibold text-sage">{formatCurrency(totalSavingsAllocated())}</span>
				</div>
				<button
					type="button"
					onclick={handleSaveAllocations}
					disabled={isSaving}
					class="px-4 py-2 bg-sage hover:bg-sage-dark text-white text-sm rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
				>
					{#if isSaving}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					Enregistrer
				</button>
			</div>
		</div>
	{/if}
</div>

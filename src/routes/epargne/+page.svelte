<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getGoals,
		getGoalWithBreakdown,
		createGoal,
		updateGoal,
		deleteGoal,
		addSavingsToGoal
	} from '$lib/data/goals';
	import { getAvailableSavings, getActiveBudget, getCurrentMonth } from '$lib/data/budgets';
	import {
		getSavingsAllocations,
		getAllAccountsForSavings,
		upsertGoalAllocation,
		upsertAccountAllocation,
		transferToGoal,
		transferToAccount
	} from '$lib/data/savings-allocations';
	import { formatCurrency } from '$lib/utils/currency';
	import type {
		SavingsGoal,
		SavingsGoalWithBreakdown,
		SavingsAllocationWithDetails
	} from '$lib/types/database';
	import type { Database } from '$lib/types/database';
	import type { GoalFormData } from '$lib/schemas/goal';
	import GoalCard from '$lib/components/goals/GoalCard.svelte';
	import GoalForm from '$lib/components/goals/GoalForm.svelte';
	import SavingsAllocationRow from '$lib/components/savings/SavingsAllocationRow.svelte';
	import { calculateProgress } from '$lib/schemas/goal';
	import { toast } from '$lib/stores/toast';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';
	import AnimatedNumber from '$lib/components/ui/AnimatedNumber.svelte';

	type Account = Database['public']['Tables']['accounts']['Row'];

	// State
	let goals = $state<SavingsGoal[]>([]);
	let accounts = $state<Account[]>([]);
	let allocations = $state<SavingsAllocationWithDetails[]>([]);
	let loading = $state(true);
	let isSubmitting = $state(false);

	// Budget data
	let budgetIncome = $state(0);
	let budgetAllocated = $state(0);
	let savingsAvailable = $state(0);
	let currentMonth = $state(getCurrentMonth());

	// Allocation amounts (local state for editing)
	let goalAmounts = $state<Map<string, number>>(new Map());
	let accountAmounts = $state<Map<string, number>>(new Map());

	// Modals
	let showAddModal = $state(false);
	let showEditModal = $state(false);
	let showAddSavingsModal = $state(false);
	let showDeleteConfirm = $state(false);
	let selectedGoal = $state<SavingsGoalWithBreakdown | null>(null);
	let savingsAmount = $state(0);

	// Totals (including pending allocations that haven't been transferred yet)
	let totalGoalsSaved = $derived(goals.reduce((sum, g) => sum + g.current_amount, 0));
	let totalGoalsTarget = $derived(goals.reduce((sum, g) => sum + g.target_amount, 0));

	// Get the effective amount for a goal (current + pending allocation)
	function getGoalEffectiveAmount(goal: SavingsGoal): number {
		const allocated = goalAmounts.get(goal.id) ?? 0;
		const alloc = allocations.find((a) => a.goal_id === goal.id);
		const transferred = alloc?.transferred_amount ?? 0;
		const pending = allocated - transferred;
		return goal.current_amount + Math.max(0, pending);
	}

	// Get color based on savings progress
	// For savings: low = needs attention (terracotta), high = on track (sage)
	type ProgressColors = { stroke: string; strokeLight: string; textClass: string };

	function getProgressColors(progress: number): ProgressColors {
		if (progress >= 75) {
			// On track - green/sage
			return { stroke: '#639A88', strokeLight: '#639A8880', textClass: 'text-sage' };
		} else if (progress >= 40) {
			// In progress - amber
			return { stroke: '#D4A574', strokeLight: '#D4A57480', textClass: 'text-amber' };
		} else {
			// Needs attention - terracotta
			return { stroke: '#C17C60', strokeLight: '#C17C6080', textClass: 'text-terracotta' };
		}
	}

	// Total allocated this month
	let totalAllocatedThisMonth = $derived(() => {
		let total = 0;
		for (const amt of goalAmounts.values()) total += amt;
		for (const amt of accountAmounts.values()) total += amt;
		return total;
	});

	// Remaining to allocate
	let remainingToAllocate = $derived(savingsAvailable - totalAllocatedThisMonth());
	let isOverAllocated = $derived(remainingToAllocate < 0);

	onMount(() => {
		loadAllData();

		// Reload data when page becomes visible (user navigates back)
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				loadAllData();
			}
		};
		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	});

	async function loadAllData() {
		loading = true;

		// Fetch active budget first to determine the correct month
		const { data: activeBudget } = await getActiveBudget();
		if (activeBudget) {
			currentMonth = activeBudget.month;
		}

		const [goalsResult, accountsResult, budgetResult, allocationsResult] = await Promise.all([
			getGoals(),
			getAllAccountsForSavings(),
			getAvailableSavings(currentMonth),
			getSavingsAllocations(currentMonth)
		]);

		goals = goalsResult.data || [];
		accounts = accountsResult.data || [];
		allocations = allocationsResult.data || [];

		if (budgetResult.data) {
			budgetIncome = budgetResult.data.income;
			budgetAllocated = budgetResult.data.totalAllocated;
			savingsAvailable = budgetResult.data.available;
		}

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

	async function handleGoalClick(goal: SavingsGoal) {
		const { data } = await getGoalWithBreakdown(goal.id);
		if (data) {
			selectedGoal = data;
			showEditModal = true;
		}
	}

	async function handleCreateGoal(data: GoalFormData) {
		isSubmitting = true;
		const { error } = await createGoal(data);
		isSubmitting = false;

		if (!error) {
			showAddModal = false;
			await loadAllData();
		}
	}

	async function handleUpdateGoal(data: GoalFormData) {
		if (!selectedGoal) return;

		isSubmitting = true;
		const { error } = await updateGoal(selectedGoal.id, data);
		isSubmitting = false;

		if (!error) {
			showEditModal = false;
			selectedGoal = null;
			await loadAllData();
		}
	}

	async function handleDeleteGoal() {
		if (!selectedGoal) return;

		isSubmitting = true;
		const { error } = await deleteGoal(selectedGoal.id);
		isSubmitting = false;

		if (!error) {
			showDeleteConfirm = false;
			showEditModal = false;
			selectedGoal = null;
			await loadAllData();
		}
	}

	function openAddSavingsModal() {
		savingsAmount = 0;
		showAddSavingsModal = true;
	}

	async function handleAddSavings() {
		if (!selectedGoal || savingsAmount <= 0) return;

		isSubmitting = true;
		const { error } = await addSavingsToGoal(selectedGoal.id, savingsAmount);
		isSubmitting = false;

		if (!error) {
			showAddSavingsModal = false;
			showEditModal = false;
			selectedGoal = null;
			await loadAllData();
		}
	}

	// Allocation handlers - save directly to DB
	async function handleSaveGoalAllocation(
		goalId: string,
		amount: number
	): Promise<{ error: string | null }> {
		const { error } = await upsertGoalAllocation(currentMonth, goalId, amount);
		if (error) {
			return { error };
		}

		// Update local state
		goalAmounts.set(goalId, amount);
		goalAmounts = new Map(goalAmounts);

		// Reload allocations to get updated data
		const { data } = await getSavingsAllocations(currentMonth);
		allocations = data || [];

		return { error: null };
	}

	async function handleSaveAccountAllocation(
		accountId: string,
		amount: number
	): Promise<{ error: string | null }> {
		const { error } = await upsertAccountAllocation(currentMonth, accountId, amount);
		if (error) {
			return { error };
		}

		// Update local state
		accountAmounts.set(accountId, amount);
		accountAmounts = new Map(accountAmounts);

		// Reload allocations to get updated data
		const { data } = await getSavingsAllocations(currentMonth);
		allocations = data || [];

		return { error: null };
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
			await loadAllData();
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
			await loadAllData();
		}
	}

	function getAllocationForGoal(goalId: string): SavingsAllocationWithDetails | undefined {
		return allocations.find((a) => a.goal_id === goalId);
	}

	function getAllocationForAccount(accountId: string): SavingsAllocationWithDetails | undefined {
		return allocations.find((a) => a.account_id === accountId);
	}

	function getAccountTypeIcon(type: string | null): string {
		switch (type) {
			case 'checking':
				return 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z';
			case 'savings':
				return 'M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z';
			case 'investment':
				return 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6';
			case 'insurance':
				return 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z';
			default:
				return 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
		}
	}
</script>

<svelte:head>
	<title>Épargne | Budget Planner</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6">
	{#if loading}
		<div class="card"><Skeleton lines={4} /></div>
	{:else}
		<!-- Available savings + action -->
		<div class="flex flex-wrap items-end justify-between gap-4">
			<div class="card flex-1 min-w-64">
				<p class="card-title">Épargne mensuelle disponible</p>
				<p class="mt-1 text-4xl font-semibold text-sage">
					<AnimatedNumber value={savingsAvailable} />
				</p>
				<p class="text-xs text-stone-400 mt-1 num">
					{formatCurrency(budgetIncome)} de revenus − {formatCurrency(budgetAllocated)} de dépenses prévues
					·
					<a href="/budgets" class="text-sage hover:underline">ajuster le budget</a>
				</p>
			</div>
			<button type="button" class="btn-primary-sage" onclick={() => (showAddModal = true)}>
				<Icon name="plus" size={16} strokeWidth={2.4} />
				Nouvel objectif
			</button>
		</div>

		<!-- Savings Distribution Section -->
		{#if savingsAvailable > 0 || totalAllocatedThisMonth() > 0}
			<div class="bg-white rounded-2xl border border-sand p-6 space-y-6">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-semibold text-coffee-900">Répartition mensuelle</h2>
					<div class="text-sm">
						{#if isOverAllocated}
							<span class="text-terracotta font-medium">
								Dépassement: {formatCurrency(Math.abs(remainingToAllocate))}
							</span>
						{:else}
							<span class="text-stone-500">
								Restant: <span class="font-medium text-sage"
									>{formatCurrency(remainingToAllocate)}</span
								>
							</span>
						{/if}
					</div>
				</div>

				<!-- Warning if over-allocated -->
				{#if isOverAllocated}
					<div class="flex items-center gap-3 p-4 bg-terracotta/10 rounded-xl">
						<svg
							class="w-5 h-5 text-terracotta flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
						<p class="text-sm text-terracotta">
							Vous avez alloué plus que votre épargne disponible. Ajustez vos allocations ou
							augmentez vos revenus dans le budget.
						</p>
					</div>
				{/if}

				<!-- Goals Allocation -->
				{#if goals.length > 0}
					<div class="space-y-3">
						<h3 class="text-sm font-medium text-stone-500 flex items-center gap-2">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							Objectifs d'épargne
						</h3>
						<div class="space-y-2">
							{#each goals as goal (goal.id)}
								{@const alloc = getAllocationForGoal(goal.id)}
								<SavingsAllocationRow
									type="goal"
									{goal}
									allocatedAmount={goalAmounts.get(goal.id) ?? 0}
									transferredAmount={alloc?.transferred_amount ?? 0}
									effectiveAmount={getGoalEffectiveAmount(goal)}
									onSave={(amount) => handleSaveGoalAllocation(goal.id, amount)}
									onTransfer={() => handleTransferToGoal(goal.id)}
								/>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Accounts Allocation -->
				{#if accounts.length > 0}
					<div class="space-y-3">
						<h3 class="text-sm font-medium text-stone-500 flex items-center gap-2">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
								/>
							</svg>
							Comptes Patrimoine
						</h3>
						<div class="space-y-2">
							{#each accounts as account (account.id)}
								{@const alloc = getAllocationForAccount(account.id)}
								<SavingsAllocationRow
									type="account"
									{account}
									allocatedAmount={accountAmounts.get(account.id) ?? 0}
									transferredAmount={alloc?.transferred_amount ?? 0}
									onSave={(amount) => handleSaveAccountAllocation(account.id, amount)}
									onTransfer={() => handleTransferToAccount(account.id)}
								/>
							{/each}
						</div>
					</div>
				{/if}

				<!-- No goals or accounts -->
				{#if goals.length === 0 && accounts.length === 0}
					<div class="text-center py-8">
						<div
							class="w-12 h-12 bg-oat rounded-full flex items-center justify-center mx-auto mb-3"
						>
							<svg
								class="w-6 h-6 text-stone-400"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path
									d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</div>
						<p class="text-stone-500 text-sm mb-3">
							Créez des objectifs ou ajoutez des comptes pour répartir votre épargne
						</p>
						<div class="flex gap-2 justify-center">
							<button
								onclick={() => (showAddModal = true)}
								class="px-4 py-2 bg-sage hover:bg-sage-dark text-white text-sm rounded-xl font-medium transition-colors"
							>
								Créer un objectif
							</button>
							<a
								href="/patrimoine"
								class="px-4 py-2 bg-oat hover:bg-sand text-coffee-900 text-sm rounded-xl font-medium transition-colors"
							>
								Gérer le patrimoine
							</a>
						</div>
					</div>
				{:else}
					<!-- Summary footer -->
					<div class="pt-4 border-t border-sand">
						<div class="flex items-center justify-between text-sm">
							<span class="text-stone-500">Total alloué ce mois</span>
							<span
								class="font-semibold"
								class:text-sage={!isOverAllocated}
								class:text-terracotta={isOverAllocated}
							>
								{formatCurrency(totalAllocatedThisMonth())}
							</span>
						</div>
						{#if isOverAllocated}
							<p class="text-xs text-terracotta mt-1">
								Attention : vous avez alloué plus que votre épargne disponible
							</p>
						{/if}
					</div>
				{/if}
			</div>
		{:else}
			<!-- No savings available message -->
			<div class="bg-cotton border border-sand rounded-xl p-6 text-center">
				<div class="w-12 h-12 bg-oat rounded-full flex items-center justify-center mx-auto mb-3">
					<svg
						class="w-6 h-6 text-stone-400"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path
							d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</div>
				<h3 class="text-lg font-medium text-coffee-900 mb-2">Pas d'épargne disponible</h3>
				<p class="text-stone-500 text-sm mb-4">
					Configurez d'abord vos revenus et dépenses dans le budget pour avoir de l'épargne à
					répartir.
				</p>
				<a
					href="/budgets"
					class="inline-flex items-center gap-2 px-5 py-2.5 bg-sage hover:bg-sage-dark text-white rounded-xl font-medium transition-colors"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
					Configurer le budget
				</a>
			</div>
		{/if}

		<!-- Goals Summary & List -->
		{#if goals.length > 0}
			{@const totalWithPending = goals.reduce((sum, g) => sum + getGoalEffectiveAmount(g), 0)}
			{@const totalProgress = calculateProgress(totalWithPending, totalGoalsTarget)}
			{@const totalColors = getProgressColors(totalProgress)}
			<div class="bg-cotton border border-sand rounded-xl p-6">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold text-coffee-900">Mes objectifs</h2>
					<div class="text-sm text-stone-500">
						{formatCurrency(totalWithPending)} / {formatCurrency(totalGoalsTarget)}
						<span class="{totalColors.textClass} font-medium ml-1">({totalProgress}%)</span>
						{#if totalWithPending > totalGoalsSaved}
							<span class="text-xs text-stone-400 ml-1"
								>(+{formatCurrency(totalWithPending - totalGoalsSaved)} en attente)</span
							>
						{/if}
					</div>
				</div>
				<div class="grid gap-4">
					{#each goals as goal (goal.id)}
						{@const effectiveAmount = getGoalEffectiveAmount(goal)}
						{@const baseProgress = calculateProgress(goal.current_amount, goal.target_amount)}
						{@const effectiveProgress = calculateProgress(effectiveAmount, goal.target_amount)}
						{@const hasPending = effectiveAmount > goal.current_amount}
						{@const goalColors = getProgressColors(effectiveProgress)}
						<button
							type="button"
							onclick={() => handleGoalClick(goal)}
							class="w-full text-left bg-white border border-sand rounded-xl p-4 hover:shadow-md transition-all group"
						>
							<div class="flex items-center gap-4">
								<!-- Progress Circle -->
								<div class="w-14 h-14 relative flex-shrink-0">
									<svg class="w-14 h-14 transform -rotate-90" viewBox="0 0 56 56">
										<circle cx="28" cy="28" r="24" fill="none" stroke="#E5E0DB" stroke-width="5" />
										<!-- Pending allocation (lighter) -->
										{#if hasPending}
											<circle
												cx="28"
												cy="28"
												r="24"
												fill="none"
												stroke={goalColors.strokeLight}
												stroke-width="5"
												stroke-linecap="round"
												stroke-dasharray={150.8}
												stroke-dashoffset={150.8 - (Math.min(effectiveProgress, 100) / 100) * 150.8}
											/>
										{/if}
										<!-- Base progress (already saved) -->
										<circle
											cx="28"
											cy="28"
											r="24"
											fill="none"
											stroke={goalColors.stroke}
											stroke-width="5"
											stroke-linecap="round"
											stroke-dasharray={150.8}
											stroke-dashoffset={150.8 - (Math.min(baseProgress, 100) / 100) * 150.8}
										/>
									</svg>
									<span
										class="absolute inset-0 flex items-center justify-center text-sm font-bold {goalColors.textClass}"
									>
										{effectiveProgress}%
									</span>
								</div>

								<!-- Goal Info -->
								<div class="flex-1 min-w-0">
									<h3 class="font-semibold text-coffee-900 group-hover:text-sage transition-colors">
										{goal.name}
									</h3>
									<p class="text-sm text-stone-500">
										<span class="font-medium">{formatCurrency(effectiveAmount)}</span>
										<span class="text-stone-400"> / {formatCurrency(goal.target_amount)}</span>
										{#if hasPending}
											<span class="text-xs {goalColors.textClass} ml-1"
												>(+{formatCurrency(effectiveAmount - goal.current_amount)} alloué)</span
											>
										{/if}
									</p>
								</div>

								<!-- Arrow -->
								<svg
									class="w-5 h-5 text-stone-300 group-hover:text-sage transition-colors"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</div>
						</button>
					{/each}
				</div>
			</div>
		{:else}
			<!-- Empty State for Goals -->
			<div class="bg-cotton border border-sand rounded-xl p-8 text-center">
				<div class="w-16 h-16 bg-oat rounded-full flex items-center justify-center mx-auto mb-4">
					<svg
						class="w-8 h-8 text-sage"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path
							d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path d="M2 9v1c0 1.1.9 2 2 2h1" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</div>
				<h2 class="text-lg font-semibold text-coffee-900 mb-2">Aucun objectif d'épargne</h2>
				<p class="text-stone-500 mb-4">Créez votre premier objectif pour commencer à épargner.</p>
				<button
					class="px-5 py-2.5 bg-sage hover:bg-sage-dark text-white rounded-xl font-medium transition-colors"
					onclick={() => (showAddModal = true)}
				>
					Créer un objectif
				</button>
			</div>
		{/if}
	{/if}
</div>

<!-- Add Goal Modal -->
{#if showAddModal}
	<div
		class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
		onclick={() => (showAddModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showAddModal = false)}
		role="button"
		tabindex="-1"
	></div>
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
		<div
			class="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto animate-slide-up"
		>
			<div class="p-6">
				<h2 class="text-xl font-semibold text-coffee-900 mb-4">Nouvel objectif</h2>
				<GoalForm
					onSubmit={handleCreateGoal}
					onCancel={() => (showAddModal = false)}
					{isSubmitting}
				/>
			</div>
		</div>
	</div>
{/if}

<!-- Edit Goal Modal -->
{#if showEditModal && selectedGoal}
	<div
		class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
		onclick={() => {
			showEditModal = false;
			selectedGoal = null;
		}}
		onkeydown={(e) => e.key === 'Escape' && (showEditModal = false)}
		role="button"
		tabindex="-1"
	></div>
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
		<div
			class="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto animate-slide-up"
		>
			<div class="p-6">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-xl font-semibold text-coffee-900">Modifier l'objectif</h2>
					<div class="flex gap-2">
						<button
							type="button"
							onclick={openAddSavingsModal}
							class="p-2 text-sage hover:bg-sage/10 rounded-lg transition-colors"
							title="Ajouter de l'épargne"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 6v12m6-6H6"
								/>
							</svg>
						</button>
						<button
							type="button"
							onclick={() => (showDeleteConfirm = true)}
							class="p-2 text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors"
							title="Supprimer"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
						</button>
					</div>
				</div>

				<!-- Current Progress -->
				{#if selectedGoal}
					{@const modalEffectiveAmount = getGoalEffectiveAmount(selectedGoal)}
					{@const modalHasPending = modalEffectiveAmount > selectedGoal.current_amount}
					{@const modalBaseProgress = calculateProgress(
						selectedGoal.current_amount,
						selectedGoal.target_amount
					)}
					{@const modalEffectiveProgress = calculateProgress(
						modalEffectiveAmount,
						selectedGoal.target_amount
					)}
					{@const modalColors = getProgressColors(modalEffectiveProgress)}
					<div class="mb-6 p-4 bg-oat rounded-xl">
						<div class="flex justify-between items-center mb-2">
							<span class="text-sm text-stone-600">Progression actuelle</span>
							<span class="font-semibold {modalColors.textClass}">
								{modalEffectiveProgress}%
								{#if modalHasPending}
									<span class="text-xs text-stone-400 font-normal"
										>(dont {modalEffectiveProgress - modalBaseProgress}% alloué)</span
									>
								{/if}
							</span>
						</div>
						<div class="w-full bg-sand rounded-full h-2 mb-2 relative overflow-hidden">
							<!-- Pending allocation (lighter) -->
							{#if modalHasPending}
								<div
									class="h-2 rounded-full transition-all duration-500 absolute inset-y-0 left-0"
									style="width: {Math.min(
										modalEffectiveProgress,
										100
									)}%; background-color: {modalColors.strokeLight}"
								></div>
							{/if}
							<!-- Base progress -->
							<div
								class="h-2 rounded-full transition-all duration-500 absolute inset-y-0 left-0"
								style="width: {Math.min(
									modalBaseProgress,
									100
								)}%; background-color: {modalColors.stroke}"
							></div>
						</div>
						<p class="text-sm text-stone-600">
							<span class="font-medium text-coffee-900">{formatCurrency(modalEffectiveAmount)}</span
							>
							épargnés sur {formatCurrency(selectedGoal.target_amount)}
							{#if modalHasPending}
								<span class="{modalColors.textClass} text-xs ml-1"
									>(+{formatCurrency(modalEffectiveAmount - selectedGoal.current_amount)} alloué ce mois)</span
								>
							{/if}
						</p>
					</div>
				{/if}

				<GoalForm
					goal={selectedGoal}
					onSubmit={handleUpdateGoal}
					onCancel={() => {
						showEditModal = false;
						selectedGoal = null;
					}}
					{isSubmitting}
				/>
			</div>
		</div>
	</div>
{/if}

<!-- Add Savings Modal -->
{#if showAddSavingsModal && selectedGoal}
	<div
		class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in"
		onclick={() => (showAddSavingsModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showAddSavingsModal = false)}
		role="button"
		tabindex="-1"
	></div>
	<div class="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
		<div
			class="bg-white rounded-2xl shadow-xl w-full max-w-sm pointer-events-auto animate-slide-up"
		>
			<div class="p-6">
				<h2 class="text-xl font-semibold text-coffee-900 mb-4">Ajouter de l'épargne</h2>
				<p class="text-sm text-stone-500 mb-4">
					Objectif: <span class="font-medium text-coffee-900">{selectedGoal.name}</span>
				</p>

				<div class="mb-6">
					<label class="block text-sm font-medium text-coffee-900 mb-2" for="savings-amount">
						Montant à ajouter
					</label>
					<div class="relative">
						<input
							id="savings-amount"
							type="number"
							step="0.01"
							min="0"
							bind:value={savingsAmount}
							placeholder="0.00"
							class="w-full px-4 py-3 pr-10 border border-sand rounded-xl bg-cotton text-coffee-900 placeholder-stone-400 outline-none transition-all focus:ring-2 focus:ring-sage/50 focus:border-sage"
						/>
						<span class="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500">€</span>
					</div>
				</div>

				<div class="flex gap-3">
					<button
						type="button"
						onclick={() => (showAddSavingsModal = false)}
						class="flex-1 px-5 py-3 rounded-xl text-coffee-900 bg-oat hover:bg-sand font-medium transition-colors"
						disabled={isSubmitting}
					>
						Annuler
					</button>
					<button
						type="button"
						onclick={handleAddSavings}
						class="flex-1 px-5 py-3 rounded-xl bg-sage hover:bg-sage-dark text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
						disabled={isSubmitting || savingsAmount <= 0}
					>
						{#if isSubmitting}
							<span class="loading loading-spinner loading-sm"></span>
						{/if}
						Ajouter
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm && selectedGoal}
	<div
		class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in"
		onclick={() => (showDeleteConfirm = false)}
		onkeydown={(e) => e.key === 'Escape' && (showDeleteConfirm = false)}
		role="button"
		tabindex="-1"
	></div>
	<div class="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
		<div
			class="bg-white rounded-2xl shadow-xl w-full max-w-sm pointer-events-auto animate-slide-up"
		>
			<div class="p-6 text-center">
				<div
					class="w-12 h-12 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-4"
				>
					<svg
						class="w-6 h-6 text-terracotta"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-coffee-900 mb-2">Supprimer l'objectif ?</h3>
				<p class="text-sm text-stone-500 mb-6">
					L'objectif "{selectedGoal.name}" sera définitivement supprimé. Cette action est
					irréversible.
				</p>
				<div class="flex gap-3">
					<button
						type="button"
						onclick={() => (showDeleteConfirm = false)}
						class="flex-1 px-5 py-3 rounded-xl text-coffee-900 bg-oat hover:bg-sand font-medium transition-colors"
						disabled={isSubmitting}
					>
						Annuler
					</button>
					<button
						type="button"
						onclick={handleDeleteGoal}
						class="flex-1 px-5 py-3 rounded-xl bg-terracotta hover:bg-terracotta/90 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
						disabled={isSubmitting}
					>
						{#if isSubmitting}
							<span class="loading loading-spinner loading-sm"></span>
						{/if}
						Supprimer
					</button>
				</div>
			</div>
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
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fade-in {
		animation: fade-in 0.2s ease-out;
	}
	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}
</style>

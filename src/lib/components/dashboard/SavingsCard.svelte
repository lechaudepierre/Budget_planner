<script lang="ts">
	import { onMount } from 'svelte';
	import { getGoals } from '$lib/data/goals';
	import { getSavingsAllocations, getAllAccountsForSavings } from '$lib/data/savings-allocations';
	import { getAvailableSavings, getActiveBudget, getCurrentMonth } from '$lib/data/budgets';
	import { formatCurrency } from '$lib/utils/currency';
	import { calculateProgress } from '$lib/schemas/goal';
	import type { SavingsGoal, SavingsAllocationWithDetails } from '$lib/types/database';
	import type { Database } from '$lib/types/database';

	type Account = Database['public']['Tables']['accounts']['Row'];

	let goals = $state<SavingsGoal[]>([]);
	let allocations = $state<SavingsAllocationWithDetails[]>([]);
	let accounts = $state<Account[]>([]);
	let availableSavings = $state(0);
	let totalAllocatedToAccounts = $state(0);
	let loading = $state(true);

	// Build a map of goal allocations for quick lookup
	let goalAllocationsMap = $derived(() => {
		const map = new Map<string, { allocated: number; transferred: number }>();
		for (const alloc of allocations) {
			if (alloc.goal_id) {
				map.set(alloc.goal_id, {
					allocated: alloc.allocated_amount,
					transferred: alloc.transferred_amount
				});
			}
		}
		return map;
	});

	// Build a map of account allocations
	let accountAllocationsMap = $derived(() => {
		const map = new Map<string, { allocated: number; transferred: number }>();
		for (const alloc of allocations) {
			if (alloc.account_id) {
				map.set(alloc.account_id, {
					allocated: alloc.allocated_amount,
					transferred: alloc.transferred_amount
				});
			}
		}
		return map;
	});

	// Get effective amount for a goal (current + pending)
	function getGoalEffectiveAmount(goal: SavingsGoal): number {
		const alloc = goalAllocationsMap().get(goal.id);
		if (!alloc) return goal.current_amount;
		const pending = alloc.allocated - alloc.transferred;
		return goal.current_amount + Math.max(0, pending);
	}

	// Check if goal has pending allocation
	function goalHasPending(goal: SavingsGoal): boolean {
		const alloc = goalAllocationsMap().get(goal.id);
		if (!alloc) return false;
		return alloc.allocated > alloc.transferred;
	}

	// Calculate totals including pending
	let totalSaved = $derived(goals.reduce((sum, g) => sum + g.current_amount, 0));
	let totalEffectiveSaved = $derived(goals.reduce((sum, g) => sum + getGoalEffectiveAmount(g), 0));
	let totalTarget = $derived(goals.reduce((sum, g) => sum + g.target_amount, 0));
	let overallProgress = $derived(totalTarget > 0 ? calculateProgress(totalEffectiveSaved, totalTarget) : 0);

	async function loadData() {
		loading = true;

		// Fetch active budget first to determine the correct month
		const { data: activeBudget } = await getActiveBudget();
		const currentMonth = activeBudget?.month ?? getCurrentMonth();

		const [goalsResult, allocsResult, savingsResult, accountsResult] = await Promise.all([
			getGoals(),
			getSavingsAllocations(currentMonth),
			getAvailableSavings(currentMonth),
			getAllAccountsForSavings()
		]);

		goals = goalsResult.data || [];
		allocations = allocsResult.data || [];
		availableSavings = savingsResult.data?.available ?? 0;
		accounts = accountsResult.data || [];

		// Calculate total allocated to accounts
		totalAllocatedToAccounts = allocations
			.filter(a => a.account_id)
			.reduce((sum, a) => sum + a.allocated_amount, 0);

		loading = false;
	}

	onMount(() => {
		loadData();

		// Reload data when page becomes visible
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				loadData();
			}
		};
		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	});

	// SVG calculations for mini gauges
	const size = 80;
	const strokeWidth = size * 0.12;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;

	function getStrokeDashoffset(progress: number): number {
		// Savings gauges fill up (not drain)
		const clampedProgress = Math.min(Math.max(progress, 0), 100);
		return circumference - (clampedProgress / 100) * circumference;
	}

	// Get color based on savings progress
	// For savings: low = needs attention (red), high = on track (green)
	type ProgressColors = { stroke: string; strokeLight: string; textClass: string };

	function getProgressColors(progress: number): ProgressColors {
		if (progress >= 75) {
			// On track - green/sage
			return { stroke: '#639A88', strokeLight: '#639A8880', textClass: 'text-sage' };
		} else if (progress >= 40) {
			// In progress - amber
			return { stroke: '#D4A574', strokeLight: '#D4A57480', textClass: 'text-amber' };
		} else {
			// Needs attention - terracotta/red
			return { stroke: '#C17C60', strokeLight: '#C17C6080', textClass: 'text-terracotta' };
		}
	}
</script>

<div class="bg-white rounded-xl p-6 shadow-sm h-full flex flex-col">
	<div class="flex items-center justify-between mb-4">
		<div class="flex items-center gap-2">
			<div class="w-8 h-8 bg-sage/10 rounded-lg flex items-center justify-center">
				<svg class="w-4 h-4 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" stroke-linecap="round" stroke-linejoin="round" />
					<path d="M2 9v1c0 1.1.9 2 2 2h1" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</div>
			<h2 class="font-semibold text-coffee-900">Objectifs d'épargne</h2>
		</div>
		<a href="/epargne" class="text-sm text-sage hover:text-sage-dark font-medium">
			Gérer →
		</a>
	</div>

	{#if loading}
		<div class="animate-pulse flex-1">
			<div class="h-6 bg-gray-200 rounded w-2/3 mb-3"></div>
			<div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
			<div class="h-4 bg-gray-200 rounded w-1/2"></div>
		</div>
	{:else if goals.length === 0}
		<div class="text-center py-6 flex-1 flex flex-col justify-center">
			<p class="text-stone-500 text-sm mb-3">Aucun objectif d'épargne</p>
			<a
				href="/epargne"
				class="inline-block px-4 py-2 bg-sage hover:bg-sage-dark text-white text-sm rounded-xl font-medium transition-colors mx-auto"
			>
				Créer un objectif
			</a>
		</div>
	{:else}
		<!-- Goals Grid with Mini Gauges -->
		<div class="flex-1">
			<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
				{#each goals as goal (goal.id)}
					{@const effectiveAmount = getGoalEffectiveAmount(goal)}
					{@const baseProgress = calculateProgress(goal.current_amount, goal.target_amount)}
					{@const effectiveProgress = calculateProgress(effectiveAmount, goal.target_amount)}
					{@const hasPending = goalHasPending(goal)}
					{@const colors = getProgressColors(effectiveProgress)}
					<a
						href="/epargne"
						class="flex flex-col items-center p-3 rounded-xl transition-all duration-200 hover:bg-oat hover:scale-[1.02]"
					>
						<!-- Mini Circular Gauge -->
						<div class="relative" style="width: {size}px; height: {size}px;">
							<svg
								width={size}
								height={size}
								viewBox="0 0 {size} {size}"
								class="transform -rotate-90"
							>
								<!-- Background circle -->
								<circle
									cx={size / 2}
									cy={size / 2}
									r={radius}
									fill="none"
									stroke="#E5E0DB"
									stroke-width={strokeWidth}
								/>
								<!-- Pending allocation circle (lighter version of current color) -->
								{#if hasPending}
									<circle
										cx={size / 2}
										cy={size / 2}
										r={radius}
										fill="none"
										stroke={colors.strokeLight}
										stroke-width={strokeWidth}
										stroke-linecap="round"
										stroke-dasharray={circumference}
										stroke-dashoffset={getStrokeDashoffset(effectiveProgress)}
										class="transition-all duration-500"
									/>
								{/if}
								<!-- Base progress circle -->
								<circle
									cx={size / 2}
									cy={size / 2}
									r={radius}
									fill="none"
									stroke={colors.stroke}
									stroke-width={strokeWidth}
									stroke-linecap="round"
									stroke-dasharray={circumference}
									stroke-dashoffset={getStrokeDashoffset(baseProgress)}
									class="transition-all duration-500"
								/>
							</svg>
							<!-- Center text -->
							<div class="absolute inset-0 flex flex-col items-center justify-center">
								<span class="text-sm font-bold {colors.textClass}">
									{effectiveProgress}%
								</span>
							</div>
						</div>
						<!-- Label -->
						<span class="text-xs text-center text-coffee-900 mt-1.5 font-medium line-clamp-1 w-full">
							{goal.name}
						</span>
						<span class="text-xs {colors.textClass}">
							{formatCurrency(effectiveAmount)}
							{#if hasPending}
								<span class="text-[10px] text-stone-400">*</span>
							{/if}
						</span>
					</a>
				{/each}
			</div>
		</div>

		<!-- Summary Footer -->
		<div class="mt-4 pt-3 border-t border-sand space-y-2">
			<!-- Total saved in goals -->
			{#if goals.length > 0}
				{@const overallColors = getProgressColors(overallProgress)}
				<div class="flex justify-between items-center text-sm">
					<span class="text-stone-500">Objectifs</span>
					<span class="font-semibold {overallColors.textClass}">
						{formatCurrency(totalEffectiveSaved)}
						{#if totalEffectiveSaved > totalSaved}
							<span class="text-xs font-normal text-stone-400">(+{formatCurrency(totalEffectiveSaved - totalSaved)})</span>
						{/if}
					</span>
				</div>
			{/if}

			<!-- Account allocations -->
			{#if totalAllocatedToAccounts > 0}
				<div class="flex justify-between items-center text-sm">
					<span class="text-stone-500">Comptes</span>
					<span class="font-semibold text-sage">{formatCurrency(totalAllocatedToAccounts)}</span>
				</div>
			{/if}

			<!-- Remaining savings -->
			{#if availableSavings > 0}
				{@const totalAllocatedThisMonth = (totalEffectiveSaved - totalSaved) + totalAllocatedToAccounts}
				{@const remainingSavings = availableSavings - totalAllocatedThisMonth}
				<div class="flex justify-between items-center text-sm pt-1 border-t border-sand/50">
					<span class="text-stone-500">Reste à allouer</span>
					<span class="font-semibold" class:text-sage={remainingSavings <= 0} class:text-terracotta={remainingSavings > 0}>
						{remainingSavings <= 0 ? 'Tout alloué' : formatCurrency(remainingSavings)}
					</span>
				</div>
			{/if}
		</div>
	{/if}
</div>

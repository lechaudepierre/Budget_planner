<script lang="ts">
	import { onMount } from 'svelte';
	import PatrimoineCard from '$lib/components/dashboard/PatrimoineCard.svelte';
	import BudgetOverview from '$lib/components/dashboard/BudgetOverview.svelte';
	import ExpenseBreakdown from '$lib/components/dashboard/ExpenseBreakdown.svelte';
	import { getCategoriesWithSpending, getActiveBudgetSummary } from '$lib/data/dashboard';
	import { formatCurrency } from '$lib/utils/currency';
	import { dashboardRefresh } from '$lib/stores/refresh';
	import type { CategoryWithSpending } from '$lib/types/database';

	let categories = $state<CategoryWithSpending[]>([]);
	let budgetSummary = $state<{
		income: number;
		totalAllocated: number;
		totalSpent: number;
		remaining: number;
	} | null>(null);
	let loading = $state(true);

	onMount(() => {
		loadDashboardData();

		// Subscribe to refresh events from expense additions
		const unsubscribe = dashboardRefresh.subscribe((timestamp) => {
			if (timestamp > 0) {
				loadDashboardData();
			}
		});

		return unsubscribe;
	});

	async function loadDashboardData() {
		loading = true;
		const [cats, summary] = await Promise.all([
			getCategoriesWithSpending(),
			getActiveBudgetSummary()
		]);
		categories = cats;
		budgetSummary = summary;
		loading = false;
	}

	// Calculate percentage of budget used
	let budgetUsedPercentage = $derived(
		budgetSummary && budgetSummary.totalAllocated > 0
			? Math.round((budgetSummary.totalSpent / budgetSummary.totalAllocated) * 100)
			: 0
	);
</script>

<div class="space-y-6">
	<!-- Top Row: Patrimoine + Budget Summary -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Patrimoine Card -->
		<PatrimoineCard />

		<!-- Budget du mois Card -->
		{#if loading}
			<div class="bg-white rounded-xl p-6 shadow-sm animate-pulse">
				<div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
				<div class="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
				<div class="h-4 bg-gray-200 rounded w-2/3"></div>
			</div>
		{:else if budgetSummary}
			<div class="bg-white rounded-xl p-6 shadow-sm">
				<p class="text-stone-500 text-sm font-medium mb-2">Budget du mois</p>
				<p class="text-2xl font-bold text-coffee-900">
					{formatCurrency(budgetSummary.remaining)}
					<span class="text-base font-normal text-stone-500">restant</span>
				</p>
				<div class="mt-3">
					<div class="flex justify-between text-sm text-stone-500 mb-1">
						<span>Dépensé: {formatCurrency(budgetSummary.totalSpent)}</span>
						<span>{budgetUsedPercentage}%</span>
					</div>
					<div class="w-full bg-sand rounded-full h-2">
						<div
							class="h-2 rounded-full transition-all duration-500"
							class:bg-sage={budgetUsedPercentage <= 75}
							class:bg-amber={budgetUsedPercentage > 75 && budgetUsedPercentage <= 100}
							class:bg-terracotta={budgetUsedPercentage > 100}
							style="width: {Math.min(budgetUsedPercentage, 100)}%"
						></div>
					</div>
					<p class="text-xs text-stone-400 mt-2">
						sur {formatCurrency(budgetSummary.totalAllocated)} alloués
					</p>
				</div>
			</div>
		{:else}
			<div class="bg-white rounded-xl p-6 shadow-sm">
				<p class="text-stone-500 text-sm font-medium mb-2">Budget du mois</p>
				<p class="text-lg text-coffee-900">Aucun budget actif</p>
				<p class="text-stone-500 text-sm mt-2">Configurez vos catégories de budget</p>
				<a href="/budgets" class="btn btn-sm bg-sage hover:bg-sage-dark text-white border-none mt-3">
					Configurer
				</a>
			</div>
		{/if}
	</div>

	<!-- Budget Gauges -->
	{#if !loading}
		<BudgetOverview {categories} />
	{/if}

	<!-- Expense Breakdown -->
	{#if !loading && categories.length > 0}
		<ExpenseBreakdown {categories} />
	{/if}

	<!-- Quick Actions -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<a
			href="/patrimoine"
			class="bg-cotton border border-sand rounded-xl p-4 text-center hover:shadow-md transition-shadow"
		>
			<div class="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center mx-auto mb-2">
				<svg class="w-5 h-5 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
				</svg>
			</div>
			<p class="text-sm font-medium text-coffee-900">Patrimoine</p>
		</a>
		<a
			href="/expenses"
			class="bg-cotton border border-sand rounded-xl p-4 text-center hover:shadow-md transition-shadow"
		>
			<div class="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center mx-auto mb-2">
				<svg class="w-5 h-5 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
				</svg>
			</div>
			<p class="text-sm font-medium text-coffee-900">Transactions</p>
		</a>
		<a
			href="/budgets"
			class="bg-cotton border border-sand rounded-xl p-4 text-center hover:shadow-md transition-shadow"
		>
			<div class="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center mx-auto mb-2">
				<svg class="w-5 h-5 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10" />
					<path d="M12 16v-4M12 8h.01" />
				</svg>
			</div>
			<p class="text-sm font-medium text-coffee-900">Budgets</p>
		</a>
		<a
			href="/epargne"
			class="bg-cotton border border-sand rounded-xl p-4 text-center hover:shadow-md transition-shadow"
		>
			<div class="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center mx-auto mb-2">
				<svg class="w-5 h-5 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" />
					<path d="M2 9v1c0 1.1.9 2 2 2h1" />
				</svg>
			</div>
			<p class="text-sm font-medium text-coffee-900">Épargne</p>
		</a>
	</div>
</div>

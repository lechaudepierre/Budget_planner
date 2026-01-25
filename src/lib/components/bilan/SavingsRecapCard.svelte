<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';
	import SavingsGoalRecapRow from './SavingsGoalRecapRow.svelte';
	import type { SavingsProgressResult } from '$lib/data/analytics';

	let {
		savingsProgress
	}: {
		savingsProgress: SavingsProgressResult | null;
	} = $props();

	// Check if there's any savings activity
	let hasActivity = $derived(
		savingsProgress && (savingsProgress.goals.length > 0 || savingsProgress.accounts.length > 0)
	);
</script>

<div class="bg-cotton rounded-2xl border border-sand overflow-hidden">
	<!-- Header -->
	<div class="px-4 py-3 border-b border-sand">
		<h2 class="text-sm font-medium text-stone-500 uppercase tracking-wider">
			Épargne de la période
		</h2>
	</div>

	{#if !hasActivity}
		<!-- Empty state -->
		<div class="px-4 py-8 text-center">
			<div class="w-12 h-12 bg-oat rounded-full flex items-center justify-center mx-auto mb-3">
				<span class="text-2xl">💰</span>
			</div>
			<p class="text-stone-500 mb-2">Aucune épargne cette période</p>
			<a
				href="/epargne"
				class="text-sage hover:text-sage-dark hover:underline text-sm font-medium inline-flex items-center gap-1"
			>
				Configurer l'épargne
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</a>
		</div>
	{:else if savingsProgress}
		<!-- Total summary -->
		<div class="px-4 py-3 bg-linen border-b border-sand">
			<div class="flex justify-between items-center">
				<span class="text-sm font-medium text-coffee-900">Total Épargne</span>
				<span class="text-lg font-bold text-sage">
					+{formatCurrency(savingsProgress.totalAllocated)} cette période
				</span>
			</div>
		</div>

		<!-- Goals list -->
		{#if savingsProgress.goals.length > 0}
			<div class="px-4 divide-y divide-sand/50">
				{#each savingsProgress.goals as goal (goal.id)}
					<SavingsGoalRecapRow {goal} />
				{/each}
			</div>
		{/if}

		<!-- Accounts section (if any) -->
		{#if savingsProgress.accounts.length > 0}
			<div class="px-4 py-3 border-t border-sand bg-oat/30">
				<div class="flex items-center gap-2 mb-2">
					<span class="text-base">💰</span>
					<span class="text-sm font-medium text-coffee-900">Comptes épargne</span>
				</div>
				<div class="space-y-1">
					{#each savingsProgress.accounts as account (account.id)}
						<div class="flex justify-between items-center text-sm">
							<span class="text-stone-600">{account.name}</span>
							<span class="text-sage font-medium">
								+{formatCurrency(account.allocatedThisMonth)}
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>

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
				<svg class="w-6 h-6 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" />
					<path d="M2 9v1c0 1.1.9 2 2 2h1" />
				</svg>
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
					<svg class="w-4 h-4 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
				</svg>
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

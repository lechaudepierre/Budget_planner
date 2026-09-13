<script lang="ts">
	import AnimatedNumber from '$lib/components/ui/AnimatedNumber.svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import type { DashboardData } from '$lib/server/dashboard';

	let { accounts, netWorth }: { accounts: DashboardData['accounts']; netWorth: number } = $props();
</script>

<a href="/patrimoine" class="card card-hover block">
	<p class="card-title">Patrimoine</p>
	<p class="mt-1 text-2xl font-semibold {netWorth < 0 ? 'text-terracotta' : 'text-coffee-900'}">
		<AnimatedNumber value={netWorth} />
	</p>
	{#if accounts.length > 0}
		<ul class="mt-3 flex flex-wrap gap-1.5">
			{#each accounts as a (a.id)}
				<li
					class="text-[11px] px-2 py-1 rounded-lg bg-oat text-stone-600 num"
					title={a.balanceSource === 'import'
						? 'Solde synchronisé depuis un relevé'
						: 'Solde manuel'}
				>
					{a.name} <span class="text-coffee-900 font-medium">{formatCurrency(a.balance)}</span>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-xs text-stone-400 mt-2">Ajoute tes comptes pour suivre ton patrimoine.</p>
	{/if}
</a>

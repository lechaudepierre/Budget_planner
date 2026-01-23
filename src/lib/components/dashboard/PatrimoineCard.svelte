<script lang="ts">
	import { onMount } from 'svelte';
	import { getAccounts, calculateTotalPatrimoine } from '$lib/data/accounts';
	import { formatCurrency } from '$lib/utils/currency';
	import type { Database } from '$lib/types/database';

	type Account = Database['public']['Tables']['accounts']['Row'];

	let accounts = $state<Account[]>([]);
	let isLoading = $state(true);

	let totalPatrimoine = $derived(calculateTotalPatrimoine(accounts));

	onMount(async () => {
		const { data } = await getAccounts();
		if (data) {
			accounts = data;
		}
		isLoading = false;
	});
</script>

<a
	href="/patrimoine"
	class="card bg-gradient-to-br from-sage to-accent text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 block"
>
	<div class="flex justify-between items-start">
		<div>
			<p class="text-white/80 text-sm font-medium mb-1">Patrimoine total</p>
			{#if isLoading}
				<div class="h-10 w-32 bg-white/20 rounded animate-pulse"></div>
			{:else}
				<p class="text-4xl font-bold">{formatCurrency(totalPatrimoine)}</p>
			{/if}
		</div>
		<div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
			<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
			</svg>
		</div>
	</div>
	
	{#if !isLoading}
		<div class="mt-4 pt-4 border-t border-white/20">
			<div class="flex items-center justify-between">
				<span class="text-white/70 text-sm">
					{accounts.length} compte{accounts.length !== 1 ? 's' : ''}
				</span>
				<span class="text-white/90 text-sm font-medium flex items-center gap-1">
					Voir détails
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</span>
			</div>
		</div>
	{/if}
</a>

<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';

	let {
		income,
		totalSpent,
		totalSaved,
		balance
	} = $props<{
		income: number;
		totalSpent: number;
		totalSaved: number;
		balance: number;
	}>();

	// Determine balance color
	let balanceColorClass = $derived(
		balance >= 0 ? 'text-sage' : 'text-terracotta'
	);
</script>

<div class="bg-cotton rounded-2xl border border-sand p-6">
	<h2 class="text-sm font-medium text-stone-500 uppercase tracking-wider mb-4">
		Résumé du mois
	</h2>

	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		<!-- Total Revenus -->
		<div class="bg-linen rounded-xl p-4">
			<div class="flex items-center gap-2 mb-2">
				<div class="w-8 h-8 rounded-lg bg-sage/10 flex items-center justify-center">
					<svg class="w-4 h-4 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
					</svg>
				</div>
				<span class="text-xs text-stone-500">Revenus</span>
			</div>
			<p class="text-xl font-bold text-coffee-900">
				{formatCurrency(income)}
			</p>
		</div>

		<!-- Total Dépensé -->
		<div class="bg-linen rounded-xl p-4">
			<div class="flex items-center gap-2 mb-2">
				<div class="w-8 h-8 rounded-lg bg-terracotta/10 flex items-center justify-center">
					<svg class="w-4 h-4 text-terracotta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
					</svg>
				</div>
				<span class="text-xs text-stone-500">Dépensé</span>
			</div>
			<p class="text-xl font-bold text-coffee-900">
				{formatCurrency(totalSpent)}
			</p>
		</div>

		<!-- Total Épargné -->
		<div class="bg-linen rounded-xl p-4">
			<div class="flex items-center gap-2 mb-2">
				<div class="w-8 h-8 rounded-lg bg-eucalyptus/10 flex items-center justify-center">
					<svg class="w-4 h-4 text-eucalyptus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" />
					</svg>
				</div>
				<span class="text-xs text-stone-500">Épargné</span>
			</div>
			<p class="text-xl font-bold text-coffee-900">
				{formatCurrency(totalSaved)}
			</p>
		</div>

		<!-- Solde -->
		<div class="bg-linen rounded-xl p-4">
			<div class="flex items-center gap-2 mb-2">
				<div class="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
					<svg class="w-4 h-4 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M3 6h18M3 12h18M3 18h18" />
					</svg>
				</div>
				<span class="text-xs text-stone-500">Solde</span>
			</div>
			<p class="text-xl font-bold {balanceColorClass}">
				{balance >= 0 ? '+' : ''}{formatCurrency(balance)}
			</p>
		</div>
	</div>
</div>

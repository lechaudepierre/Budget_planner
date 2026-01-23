<script lang="ts">
	import PatrimoineCard from '$lib/components/dashboard/PatrimoineCard.svelte';
</script>

<div class="space-y-6">
	<!-- Dashboard Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Patrimoine Card -->
		<PatrimoineCard />

		<!-- Budget du mois Card (placeholder) -->
		<div class="card bg-cotton border border-sand p-6 rounded-2xl">
			<p class="text-stone-500 text-sm font-medium mb-2">Budget du mois</p>
			<p class="text-2xl font-bold text-coffee-900">À venir</p>
			<p class="text-stone-500 text-sm mt-2">Configurez vos catégories de budget</p>
		</div>
	</div>

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
			href="/depenses"
			class="bg-cotton border border-sand rounded-xl p-4 text-center hover:shadow-md transition-shadow"
		>
			<div class="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center mx-auto mb-2">
				<svg class="w-5 h-5 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
				</svg>
			</div>
			<p class="text-sm font-medium text-coffee-900">Dépenses</p>
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

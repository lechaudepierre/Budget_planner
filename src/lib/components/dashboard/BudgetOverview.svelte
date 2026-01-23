<script lang="ts">
	import CircularGauge from '$lib/components/gauges/CircularGauge.svelte';
	import type { CategoryWithSpending } from '$lib/types/database';

	let { categories = [] }: { categories: CategoryWithSpending[] } = $props();

	// Calculate percentage for each category
	let categoriesWithPercentage = $derived(
		categories.map((cat) => ({
			...cat,
			percentage: cat.allocated_amount > 0 ? (cat.spent / cat.allocated_amount) * 100 : 0
		}))
	);
</script>

{#if categories.length === 0}
	<div class="bg-white rounded-xl p-6 shadow-sm">
		<h2 class="text-lg font-semibold text-gray-800 mb-4">Budgets par catégorie</h2>
		<div class="text-center py-8">
			<div class="text-4xl mb-3">📊</div>
			<p class="text-gray-500 mb-4">Aucun budget configuré</p>
			<a href="/budgets" class="btn bg-sage hover:bg-sage-dark text-white border-none btn-sm">
				Configurer mon budget
			</a>
		</div>
	</div>
{:else}
	<div class="bg-white rounded-xl p-6 shadow-sm">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold text-gray-800">Budgets par catégorie</h2>
			<a href="/budgets" class="text-sm text-sage hover:text-sage-dark font-medium"> Gérer → </a>
		</div>
		<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
			{#each categoriesWithPercentage as category (category.id)}
				<CircularGauge
					percentage={category.percentage}
					label={category.name}
					spent={category.spent}
					budget={category.allocated_amount}
				/>
			{/each}
		</div>
	</div>
{/if}

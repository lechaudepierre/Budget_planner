<script lang="ts">
	import type { CategoryWithSpending } from '$lib/types/database';
	import { formatCurrency } from '$lib/utils/currency';

	let { categories = [] }: { categories: CategoryWithSpending[] } = $props();

	// Filter to only categories with spending, sorted by amount
	let categoriesWithSpending = $derived(
		categories.filter((c) => c.spent > 0).sort((a, b) => b.spent - a.spent)
	);

	// Calculate total spending
	let totalSpending = $derived(categoriesWithSpending.reduce((sum, c) => sum + c.spent, 0));

	// Calculate segments with angles
	let segments = $derived.by(() => {
		if (totalSpending === 0) return [];

		let currentAngle = 0;
		return categoriesWithSpending.map((category) => {
			const percentage = (category.spent / totalSpending) * 100;
			const angle = (percentage / 100) * 360;
			const segment = {
				...category,
				percentage,
				startAngle: currentAngle,
				endAngle: currentAngle + angle
			};
			currentAngle += angle;
			return segment;
		});
	});

	// For hover state
	let hoveredSegment = $state<string | null>(null);

	// SVG calculations
	const size = 160;
	const strokeWidth = 32;
	const radius = (size - strokeWidth) / 2;

	// Generate arc path
	function getArcPath(startAngle: number, endAngle: number): string {
		// Convert to radians
		const startRad = ((startAngle - 90) * Math.PI) / 180;
		const endRad = ((endAngle - 90) * Math.PI) / 180;

		const x1 = size / 2 + radius * Math.cos(startRad);
		const y1 = size / 2 + radius * Math.sin(startRad);
		const x2 = size / 2 + radius * Math.cos(endRad);
		const y2 = size / 2 + radius * Math.sin(endRad);

		const largeArc = endAngle - startAngle > 180 ? 1 : 0;

		return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
	}
</script>

<div class="bg-white rounded-xl p-6 shadow-sm">
	<h2 class="text-lg font-semibold text-gray-800 mb-4">Répartition des dépenses</h2>

	{#if segments.length === 0}
		<div class="text-center py-8">
			<div class="text-4xl mb-3">🍩</div>
			<p class="text-gray-500">Aucune dépense ce mois</p>
		</div>
	{:else}
		<div class="flex flex-col sm:flex-row items-center gap-6">
			<!-- Donut Chart -->
			<div class="relative shrink-0">
				<svg width={size} height={size} viewBox="0 0 {size} {size}">
					{#each segments as segment (segment.id)}
						{#if segment.endAngle - segment.startAngle > 0.5}
							<path
								d={getArcPath(segment.startAngle, segment.endAngle - 0.5)}
								fill="none"
								stroke={segment.color}
								stroke-width={strokeWidth}
								stroke-linecap="butt"
								class="transition-all duration-200 cursor-pointer"
								class:opacity-50={hoveredSegment && hoveredSegment !== segment.id}
								onmouseenter={() => (hoveredSegment = segment.id)}
								onmouseleave={() => (hoveredSegment = null)}
							/>
						{/if}
					{/each}
				</svg>

				<!-- Center total -->
				<div class="absolute inset-0 flex flex-col items-center justify-center">
					<span class="text-xs text-gray-500">Total</span>
					<span class="text-lg font-bold text-gray-800">
						{formatCurrency(totalSpending)}
					</span>
				</div>
			</div>

			<!-- Legend -->
			<div class="flex-1 space-y-1 w-full">
				{#each segments as segment (segment.id)}
					<button
						type="button"
						class="flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer w-full text-left"
						class:bg-oat={hoveredSegment === segment.id}
						onmouseenter={() => (hoveredSegment = segment.id)}
						onmouseleave={() => (hoveredSegment = null)}
					>
						<div class="flex items-center gap-2 min-w-0">
							<div
								class="w-3 h-3 rounded-full shrink-0"
								style="background-color: {segment.color}"
							></div>
							<span class="text-sm text-gray-700 truncate">{segment.name}</span>
						</div>
						<div class="text-right shrink-0 ml-2">
							<span class="text-sm font-medium text-gray-800">
								{formatCurrency(segment.spent)}
							</span>
							<span class="text-xs text-gray-500 ml-1"> ({Math.round(segment.percentage)}%) </span>
						</div>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

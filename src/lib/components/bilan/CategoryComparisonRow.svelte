<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';

	let {
		categoryId,
		name,
		color,
		budget,
		spent,
		difference,
		percentage,
		onClick
	} = $props<{
		categoryId: string;
		name: string;
		color: string;
		budget: number;
		spent: number;
		difference: number;
		percentage: number;
		onClick: (categoryId: string) => void;
	}>();

	// Determine difference display
	let differenceDisplay = $derived(() => {
		if (difference < 0) {
			return { text: `-${formatCurrency(Math.abs(difference))}`, colorClass: 'text-sage' };
		} else if (difference > 0) {
			return { text: `+${formatCurrency(difference)}`, colorClass: 'text-amber-600' };
		} else {
			return { text: 'Pile poil', colorClass: 'text-sage' };
		}
	});

	// Determine progress bar color
	let progressColorClass = $derived(() => {
		if (percentage <= 75) return 'bg-sage';
		if (percentage <= 100) return 'bg-amber';
		return 'bg-terracotta';
	});
</script>

<button
	type="button"
	onclick={() => onClick(categoryId)}
	class="w-full flex items-center gap-4 px-4 py-3 hover:bg-oat/50 rounded-xl transition-colors text-left"
>
	<!-- Category color dot + name -->
	<div class="flex items-center gap-3 min-w-0 flex-1">
		<div
			class="w-3 h-3 rounded-full flex-shrink-0"
			style="background-color: {color}"
		></div>
		<span class="text-sm font-medium text-coffee-900 truncate">{name}</span>
	</div>

	<!-- Budget -->
	<div class="w-24 text-right">
		<span class="text-sm text-stone-500">{formatCurrency(budget)}</span>
	</div>

	<!-- Spent -->
	<div class="w-24 text-right">
		<span class="text-sm text-coffee-900 font-medium">{formatCurrency(spent)}</span>
	</div>

	<!-- Mini progress bar -->
	<div class="w-20 flex-shrink-0">
		<div class="h-2 bg-sand rounded-full overflow-hidden">
			<div
				class="h-full rounded-full transition-all {progressColorClass()}"
				style="width: {Math.min(percentage, 100)}%"
			></div>
		</div>
	</div>

	<!-- Difference -->
	<div class="w-28 text-right flex-shrink-0">
		<span class="text-sm font-medium {differenceDisplay().colorClass}">
			{differenceDisplay().text}
		</span>
	</div>
</button>

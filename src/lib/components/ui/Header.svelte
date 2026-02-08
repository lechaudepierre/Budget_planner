<script lang="ts">
	import { formatMonth, getCurrentMonth } from '$lib/utils/date';

	let currentMonth = getCurrentMonth();
</script>

<header class="sticky top-0 bg-linen border-b border-sand z-10">
	<div class="flex items-center justify-between px-8 py-6">
		<div>
			<h1 class="text-2xl font-semibold text-coffee-900">Dashboard</h1>
			<p class="text-sm text-stone-500 mt-1">{formatMonth(currentMonth)}</p>
		</div>
		<a
			href="/expenses"
			class="btn bg-sage hover:bg-sage-dark border-none text-white gap-2 px-5 py-3 rounded-xl font-medium"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5" />
			</svg>
			Ajouter dépense
		</a>
	</div>
</header>

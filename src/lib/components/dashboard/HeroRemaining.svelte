<script lang="ts">
	import AnimatedNumber from '$lib/components/ui/AnimatedNumber.svelte';
	import { formatCurrency } from '$lib/utils/currency';
	import type { DashboardData } from '$lib/server/dashboard';

	let { data }: { data: DashboardData } = $props();

	const remaining = $derived(data.variable.remaining);
	const daysLeft = $derived(data.period?.daysLeft ?? 0);
	const perDay = $derived(daysLeft > 0 ? Math.max(remaining, 0) / daysLeft : 0);
	const tone = $derived(
		remaining < 0
			? 'text-terracotta'
			: remaining < data.variable.allocated * 0.25
				? 'text-amber'
				: 'text-coffee-900'
	);

	// Stacked bar: how the period's money is split
	const segments = $derived.by(() => {
		const fixed = data.fixed.allocated;
		const savings = data.savings.allocatedThisMonth;
		const spent = data.variable.spent;
		const left = Math.max(data.variable.allocated - spent, 0);
		const base = data.income > 0 ? data.income : fixed + savings + spent + left;
		const free = Math.max(base - fixed - savings - spent - left, 0);
		const total = base || 1;
		return [
			{ key: 'fixed', label: 'Coûts fixes', value: fixed, color: 'bg-coffee-900/70' },
			{ key: 'savings', label: 'Épargne', value: savings, color: 'bg-sage' },
			{ key: 'spent', label: 'Dépensé', value: spent, color: 'bg-terracotta' },
			{ key: 'left', label: 'Reste enveloppes', value: left, color: 'bg-amber/70' },
			{ key: 'free', label: 'Non alloué', value: free, color: 'bg-sand' }
		].map((s) => ({ ...s, pct: (s.value / total) * 100 }));
	});
</script>

<section class="card">
	<div class="flex flex-col lg:flex-row lg:items-end gap-6">
		<div class="min-w-0">
			<p class="card-title">Reste à dépenser</p>
			<p class="mt-1 text-4xl lg:text-5xl font-semibold tracking-tight {tone}">
				<AnimatedNumber value={remaining} />
			</p>
			{#if data.period}
				<p class="mt-2 text-sm text-stone-500">
					{#if daysLeft > 0}
						<strong class="text-coffee-900 num">{daysLeft}</strong> jour{daysLeft > 1 ? 's' : ''} restants
						·
						<strong class="text-coffee-900 num">~{formatCurrency(perDay)}</strong> par jour
					{:else if data.period.overdueDays > 0}
						Période dépassée de <strong class="text-coffee-900 num"
							>{data.period.overdueDays}</strong
						>
						jour{data.period.overdueDays > 1 ? 's' : ''} — les dépenses continuent d'être comptées.
					{:else}
						Dernier jour de la période.
					{/if}
				</p>
			{:else}
				<p class="mt-2 text-sm text-stone-500">Aucune période active.</p>
			{/if}
		</div>

		<div class="flex-1 lg:max-w-xl lg:ml-auto">
			<div class="flex justify-between text-xs text-stone-500 mb-2">
				<span
					>Revenus <strong class="text-coffee-900 num">{formatCurrency(data.income)}</strong></span
				>
				<span
					>Enveloppes <strong class="text-coffee-900 num"
						>{formatCurrency(data.variable.spent)} / {formatCurrency(
							data.variable.allocated
						)}</strong
					></span
				>
			</div>
			<div class="flex h-3 w-full overflow-hidden rounded-full bg-sand/60">
				{#each segments as s (s.key)}
					{#if s.pct > 0}
						<div
							class="{s.color} transition-[width] duration-500"
							style="width: {s.pct}%"
							title="{s.label} · {formatCurrency(s.value)}"
						></div>
					{/if}
				{/each}
			</div>
			<ul class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
				{#each segments as s (s.key)}
					{#if s.value > 0}
						<li class="flex items-center gap-1.5">
							<span class="w-2 h-2 rounded-full {s.color}"></span>
							{s.label} <span class="num text-coffee-900">{formatCurrency(s.value)}</span>
						</li>
					{/if}
				{/each}
			</ul>
		</div>
	</div>
</section>

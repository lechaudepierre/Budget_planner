<script lang="ts">
	import ImportReviewRow from './ImportReviewRow.svelte';
	import type { ReviewRow } from '$lib/import/review';

	let {
		rows = $bindable(),
		groups,
		categories
	}: {
		rows: ReviewRow[];
		/** Index of every row, grouped once at load time */
		groups: { key: string; title: string; hint: string; indexes: number[]; collapsed: boolean }[];
		categories: { id: string; name: string; color: string }[];
	} = $props();

	// Groups are rebuilt for every analysed file: the open/closed state resets with them
	let open = $derived(Object.fromEntries(groups.map((g) => [g.key, !g.collapsed])));
</script>

<div class="bg-cotton border border-sand/60 rounded-2xl overflow-x-auto shadow-sm">
	<div class="min-w-[58rem]">
		<!-- Column header -->
		<div
			class="grid grid-cols-[3.5rem_1fr_6.5rem_9rem_11rem_7rem_2.5rem] gap-3 px-4 py-2 bg-oat text-[11px] uppercase tracking-wide text-stone-500 border-b border-sand"
		>
			<span>Date</span>
			<span>Commerçant</span>
			<span class="text-right">Montant</span>
			<span>Type</span>
			<span>Catégorie</span>
			<span>Ma part</span>
			<span class="text-center" title="Retenir comme règle">Règle</span>
		</div>

		{#each groups as group (group.key)}
			{#if group.indexes.length > 0}
				<button
					type="button"
					class="w-full flex items-center justify-between px-4 py-2.5 bg-linen/70 border-b border-sand/60 text-left hover:bg-oat/60 transition-colors"
					onclick={() => (open[group.key] = !open[group.key])}
				>
					<span class="flex items-center gap-2">
						<svg
							class="w-3.5 h-3.5 text-stone-400 transition-transform {open[group.key]
								? 'rotate-90'
								: ''}"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
						>
							<path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
						<span class="text-sm font-semibold text-coffee-900">{group.title}</span>
						<span class="text-xs text-stone-500">· {group.indexes.length}</span>
					</span>
					<span class="text-xs text-stone-400">{group.hint}</span>
				</button>
				{#if open[group.key]}
					{#each group.indexes as i (rows[i].externalId)}
						<ImportReviewRow bind:row={rows[i]} {categories} />
					{/each}
				{/if}
			{/if}
		{/each}
	</div>
</div>

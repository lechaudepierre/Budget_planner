<script lang="ts">
	let { lines = 3, class: klass = '' }: { lines?: number; class?: string } = $props();
</script>

<div class="space-y-3 {klass}" aria-busy="true" aria-label="Chargement">
	{#each { length: lines }, i (i)}
		<div class="skeleton h-4" style="width: {i % 3 === 0 ? 70 : i % 3 === 1 ? 90 : 55}%"></div>
	{/each}
</div>

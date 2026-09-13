<script lang="ts" generics="T extends string">
	let {
		options,
		value = $bindable(),
		onchange,
		size = 'sm'
	}: {
		options: { value: T; label: string }[];
		value: T;
		onchange?: (value: T) => void;
		size?: 'sm' | 'md';
	} = $props();

	function select(v: T) {
		if (v === value) return;
		value = v;
		onchange?.(v);
	}
</script>

<div class="inline-flex rounded-xl bg-oat p-1 gap-0.5" role="tablist">
	{#each options as opt (opt.value)}
		<button
			type="button"
			role="tab"
			aria-selected={opt.value === value}
			class="rounded-lg font-medium transition-colors whitespace-nowrap
				{size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
				{opt.value === value
				? 'bg-cotton text-coffee-900 shadow-sm'
				: 'text-stone-500 hover:text-coffee-900'}"
			onclick={() => select(opt.value)}
		>
			{opt.label}
		</button>
	{/each}
</div>

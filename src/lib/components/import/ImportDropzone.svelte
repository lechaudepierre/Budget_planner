<script lang="ts">
	let {
		onFiles,
		disabled = false
	}: {
		onFiles: (files: File[]) => void;
		disabled?: boolean;
	} = $props();

	let dragging = $state(false);
	let inputEl: HTMLInputElement;

	function accept(list: FileList | null) {
		if (!list || disabled) return;
		const files = Array.from(list).filter((f) => /\.csv$/i.test(f.name) || f.type === 'text/csv');
		if (files.length > 0) onFiles(files);
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		accept(e.dataTransfer?.files ?? null);
	}
</script>

<button
	type="button"
	class="w-full rounded-2xl border-2 border-dashed p-10 text-center transition-all
		{dragging
		? 'border-sage bg-sage/5 scale-[1.01]'
		: 'border-sand bg-cotton hover:border-sage/60 hover:bg-oat/40'}
		{disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
	ondragover={(e) => {
		e.preventDefault();
		if (!disabled) dragging = true;
	}}
	ondragleave={() => (dragging = false)}
	ondrop={onDrop}
	onclick={() => !disabled && inputEl.click()}
	{disabled}
>
	<div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-sage/10 flex items-center justify-center">
		<svg
			class="w-7 h-7 text-sage"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.8"
		>
			<path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke-linecap="round" stroke-linejoin="round" />
			<path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke-linecap="round" />
		</svg>
	</div>
	<p class="font-medium text-coffee-900">Dépose tes relevés ici</p>
	<p class="text-sm text-stone-500 mt-1">
		CSV BNP Paribas Fortis ou Revolut — un ou plusieurs fichiers, dans n'importe quel ordre
	</p>
	<input
		bind:this={inputEl}
		type="file"
		accept=".csv,text/csv"
		multiple
		class="hidden"
		onchange={(e) => {
			accept((e.target as HTMLInputElement).files);
			(e.target as HTMLInputElement).value = '';
		}}
	/>
</button>

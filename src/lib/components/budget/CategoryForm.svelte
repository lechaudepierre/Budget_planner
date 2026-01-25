<script lang="ts">
	import { CATEGORY_COLORS, CATEGORY_TYPES, validateCategory } from '$lib/schemas/budget';
	import type { Database } from '$lib/types/database';

	type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];

	let {
		category = null,
		onSubmit,
		onCancel,
		isSubmitting = false
	} = $props<{
		category?: BudgetCategory | null;
		onSubmit: (data: { name: string; color: string; type: 'fixed' | 'variable' }) => void;
		onCancel: () => void;
		isSubmitting?: boolean;
	}>();

	let name = $state(category?.name ?? '');
	let color = $state(category?.color ?? CATEGORY_COLORS[0].value);
	let type = $state<'fixed' | 'variable'>(category?.type ?? 'variable');
	let errors = $state<Record<string, string>>({});

	let selectedTypeInfo = $derived(CATEGORY_TYPES.find((t) => t.value === type)!);

	function handleSubmit(e: Event) {
		e.preventDefault();

		const validation = validateCategory({ name, color, type });

		if (!validation.success) {
			errors = validation.errors ?? {};
			return;
		}

		errors = {};
		onSubmit({ name: validation.data!.name, color: validation.data!.color, type: validation.data!.type });
	}
</script>

<form onsubmit={handleSubmit} class="space-y-5">
	<!-- Name Input -->
	<div>
		<label class="block text-sm font-medium text-coffee-900 mb-2" for="category-name">
			Nom de la catégorie
		</label>
		<input
			id="category-name"
			type="text"
			bind:value={name}
			placeholder="Ex: Alimentation, Transport..."
			class="w-full px-4 py-3 border rounded-xl bg-cotton text-coffee-900 placeholder-stone-400 outline-none transition-all focus:ring-2 focus:ring-sage/50"
			class:border-sand={!errors.name}
			class:focus:border-sage={!errors.name}
			class:border-terracotta={errors.name}
			maxlength="50"
		/>
		{#if errors.name}
			<p class="text-sm text-terracotta mt-1">{errors.name}</p>
		{/if}
	</div>

	<!-- Color Picker -->
	<div>
		<label class="block text-sm font-medium text-coffee-900 mb-2"> Couleur </label>
		<div class="grid grid-cols-5 gap-3">
			{#each CATEGORY_COLORS as colorOption}
				<button
					type="button"
					class="w-10 h-10 rounded-xl transition-all duration-150 flex items-center justify-center"
					class:ring-2={color === colorOption.value}
					class:ring-offset-2={color === colorOption.value}
					class:ring-coffee-900={color === colorOption.value}
					class:scale-110={color === colorOption.value}
					style="background-color: {colorOption.value}"
					onclick={() => (color = colorOption.value)}
					title={colorOption.label}
				>
					{#if color === colorOption.value}
						<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="3"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					{/if}
				</button>
			{/each}
		</div>
		{#if errors.color}
			<p class="text-sm text-terracotta mt-1">{errors.color}</p>
		{/if}
	</div>

	<!-- Type Selector -->
	<div>
		<label class="block text-sm font-medium text-coffee-900 mb-2"> Type de catégorie </label>
		<div class="space-y-2">
			{#each CATEGORY_TYPES as typeOption}
				<label
					class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:border-sage"
					class:border-sage={type === typeOption.value}
					class:border-sand={type !== typeOption.value}
					style={type === typeOption.value ? 'background-color: rgba(99, 154, 136, 0.05)' : ''}
				>
					<input
						type="radio"
						name="category-type"
						value={typeOption.value}
						checked={type === typeOption.value}
						onchange={() => (type = typeOption.value)}
						class="radio radio-sm radio-success mt-0.5"
					/>
					<div class="flex-1">
						<span class="font-medium text-coffee-900">{typeOption.label}</span>
						<p class="text-xs text-stone-500 mt-1">{typeOption.description}</p>
					</div>
				</label>
			{/each}
		</div>
		{#if errors.type}
			<p class="text-sm text-terracotta mt-1">{errors.type}</p>
		{/if}
	</div>

	<!-- Preview -->
	<div class="p-4 bg-oat rounded-xl">
		<p class="text-sm text-stone-500 mb-2">Aperçu</p>
		<div class="flex items-center gap-3">
			<div class="w-4 h-4 rounded-full" style="background-color: {color}"></div>
			<span class="font-medium text-coffee-900">{name || 'Nom de la catégorie'}</span>
			<span class="text-xs px-2 py-0.5 rounded-full bg-white/80 text-stone-600">
				{selectedTypeInfo.label}
			</span>
		</div>
	</div>

	<!-- Actions -->
	<div class="flex gap-3 pt-2">
		<button
			type="button"
			onclick={onCancel}
			class="flex-1 px-5 py-3 rounded-xl text-coffee-900 bg-oat hover:bg-sand font-medium transition-colors"
			disabled={isSubmitting}
		>
			Annuler
		</button>
		<button
			type="submit"
			class="flex-1 px-5 py-3 rounded-xl bg-sage hover:bg-sage-dark text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
			disabled={isSubmitting || !name.trim()}
		>
			{#if isSubmitting}
				<span class="loading loading-spinner loading-sm"></span>
			{/if}
			{category ? 'Modifier' : 'Ajouter'}
		</button>
	</div>
</form>

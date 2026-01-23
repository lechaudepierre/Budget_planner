<script lang="ts">
	import { CATEGORY_COLORS, validateCategory } from '$lib/schemas/budget';
	import type { Database } from '$lib/types/database';

	type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];

	let {
		category = null,
		onSubmit,
		onCancel,
		isSubmitting = false
	} = $props<{
		category?: BudgetCategory | null;
		onSubmit: (data: { name: string; color: string }) => void;
		onCancel: () => void;
		isSubmitting?: boolean;
	}>();

	let name = $state(category?.name ?? '');
	let color = $state(category?.color ?? CATEGORY_COLORS[0].value);
	let errors = $state<Record<string, string>>({});

	function handleSubmit(e: Event) {
		e.preventDefault();

		const validation = validateCategory({ name, color });

		if (!validation.success) {
			errors = validation.errors ?? {};
			return;
		}

		errors = {};
		onSubmit({ name: validation.data!.name, color: validation.data!.color });
	}
</script>

<form onsubmit={handleSubmit} class="space-y-5">
	<!-- Name Input -->
	<div>
		<label class="block text-sm font-medium text-stone-500 mb-2" for="category-name">
			Nom de la catégorie
		</label>
		<input
			id="category-name"
			type="text"
			bind:value={name}
			placeholder="Ex: Alimentation, Transport..."
			class="input input-bordered w-full bg-white border-sand focus:border-sage focus:ring-sage"
			class:border-terracotta={errors.name}
			maxlength="50"
		/>
		{#if errors.name}
			<p class="text-sm text-terracotta mt-1">{errors.name}</p>
		{/if}
	</div>

	<!-- Color Picker -->
	<div>
		<label class="block text-sm font-medium text-stone-500 mb-2"> Couleur </label>
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

	<!-- Preview -->
	<div class="p-4 bg-oat rounded-xl">
		<p class="text-sm text-stone-500 mb-2">Aperçu</p>
		<div class="flex items-center gap-3">
			<div class="w-4 h-4 rounded-full" style="background-color: {color}"></div>
			<span class="font-medium text-coffee-900">{name || 'Nom de la catégorie'}</span>
		</div>
	</div>

	<!-- Actions -->
	<div class="flex gap-3 pt-2">
		<button
			type="button"
			onclick={onCancel}
			class="btn flex-1 bg-oat border-sand text-coffee-900 hover:bg-sand"
			disabled={isSubmitting}
		>
			Annuler
		</button>
		<button
			type="submit"
			class="btn flex-1 bg-sage hover:bg-sage-dark border-none text-white"
			disabled={isSubmitting || !name.trim()}
		>
			{#if isSubmitting}
				<span class="loading loading-spinner loading-sm"></span>
			{/if}
			{category ? 'Modifier' : 'Ajouter'}
		</button>
	</div>
</form>

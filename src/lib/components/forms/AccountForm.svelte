<script lang="ts">
	import { accountSchema, accountTypes, type AccountFormData } from '$lib/schemas/account';
	import type { Database } from '$lib/types/database';

	type Account = Database['public']['Tables']['accounts']['Row'];

	interface Props {
		account?: Account | null;
		onSubmit: (data: AccountFormData) => Promise<void>;
		onCancel: () => void;
		isSubmitting?: boolean;
	}

	let { account = null, onSubmit, onCancel, isSubmitting = false }: Props = $props();

	let name = $state(account?.name ?? '');
	let balance = $state(account?.balance ?? 0);
	let accountType = $state(account?.account_type ?? '');
	let errors = $state<Record<string, string>>({});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errors = {};

		const formData = {
			name,
			balance,
			account_type: accountType || null
		};

		const result = accountSchema.safeParse(formData);

		if (!result.success) {
			for (const issue of result.error.issues) {
				const field = issue.path[0] as string;
				errors[field] = issue.message;
			}
			return;
		}

		await onSubmit(result.data);
	}
</script>

<form onsubmit={handleSubmit} class="space-y-5">
	<!-- Account Name -->
	<div class="form-control">
		<label class="label" for="account-name">
			<span class="label-text text-coffee-900 font-medium">Nom du compte</span>
		</label>
		<input
			id="account-name"
			type="text"
			bind:value={name}
			placeholder="Ex: Compte courant BNP"
			class="input input-bordered bg-cotton border-sand focus:border-sage focus:outline-none w-full"
			class:input-error={errors.name}
		/>
		{#if errors.name}
			<div class="label">
				<span class="label-text-alt text-terracotta">{errors.name}</span>
			</div>
		{/if}
	</div>

	<!-- Balance -->
	<div class="form-control">
		<label class="label" for="account-balance">
			<span class="label-text text-coffee-900 font-medium">Solde actuel</span>
		</label>
		<div class="relative">
			<input
				id="account-balance"
				type="number"
				step="0.01"
				bind:value={balance}
				placeholder="0.00"
				class="input input-bordered bg-cotton border-sand focus:border-sage focus:outline-none w-full pr-10"
				class:input-error={errors.balance}
			/>
			<span class="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500">€</span>
		</div>
		{#if errors.balance}
			<div class="label">
				<span class="label-text-alt text-terracotta">{errors.balance}</span>
			</div>
		{/if}
	</div>

	<!-- Account Type -->
	<div class="form-control">
		<label class="label" for="account-type">
			<span class="label-text text-coffee-900 font-medium">Type de compte</span>
			<span class="label-text-alt text-stone-500">Optionnel</span>
		</label>
		<select
			id="account-type"
			bind:value={accountType}
			class="select select-bordered bg-cotton border-sand focus:border-sage focus:outline-none w-full"
		>
			<option value="">Sélectionner un type</option>
			{#each accountTypes as type}
				<option value={type.value}>{type.label}</option>
			{/each}
		</select>
	</div>

	<!-- Actions -->
	<div class="flex gap-3 pt-4">
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
			disabled={isSubmitting}
		>
			{#if isSubmitting}
				<span class="loading loading-spinner loading-sm"></span>
			{:else}
				{account ? 'Enregistrer' : 'Ajouter'}
			{/if}
		</button>
	</div>
</form>

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
	let iban = $state(account?.iban ?? '');
	let errors = $state<Record<string, string>>({});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errors = {};

		const formData = {
			name,
			balance,
			account_type: accountType || null,
			iban: iban || null
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
	<div>
		<label class="block text-sm font-medium text-coffee-900 mb-2" for="account-name">
			Nom du compte
		</label>
		<input
			id="account-name"
			type="text"
			bind:value={name}
			placeholder="Ex: Compte courant BNP"
			class="w-full px-4 py-3 border rounded-xl bg-cotton text-coffee-900 placeholder-stone-400 outline-none transition-all focus:ring-2 focus:ring-sage/50"
			class:border-sand={!errors.name}
			class:focus:border-sage={!errors.name}
			class:border-terracotta={errors.name}
		/>
		{#if errors.name}
			<p class="text-sm text-terracotta mt-1">{errors.name}</p>
		{/if}
	</div>

	<!-- Balance -->
	<div>
		<label class="block text-sm font-medium text-coffee-900 mb-2" for="account-balance">
			Solde actuel
		</label>
		<div class="relative">
			<input
				id="account-balance"
				type="number"
				step="0.01"
				bind:value={balance}
				placeholder="0.00"
				class="w-full px-4 py-3 pr-10 border rounded-xl bg-cotton text-coffee-900 placeholder-stone-400 outline-none transition-all focus:ring-2 focus:ring-sage/50"
				class:border-sand={!errors.balance}
				class:focus:border-sage={!errors.balance}
				class:border-terracotta={errors.balance}
			/>
			<span class="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500">€</span>
		</div>
		{#if errors.balance}
			<p class="text-sm text-terracotta mt-1">{errors.balance}</p>
		{/if}
	</div>

	<!-- Account Type -->
	<div>
		<div class="flex justify-between items-center mb-2">
			<label class="block text-sm font-medium text-coffee-900" for="account-type">
				Type de compte
			</label>
			<span class="text-xs text-stone-500">Optionnel</span>
		</div>
		<select
			id="account-type"
			bind:value={accountType}
			class="w-full px-4 py-3 border border-sand rounded-xl bg-cotton text-coffee-900 outline-none transition-all focus:ring-2 focus:ring-sage/50 focus:border-sage appearance-none cursor-pointer"
		>
			<option value="">Sélectionner un type</option>
			{#each accountTypes as type}
				<option value={type.value}>{type.label}</option>
			{/each}
		</select>
	</div>

	<!-- IBAN (used to match imported statements and detect transfers between accounts) -->
	<div>
		<div class="flex justify-between items-center mb-2">
			<label class="block text-sm font-medium text-coffee-900" for="account-iban">IBAN</label>
			<span class="text-xs text-stone-500">Optionnel · utile pour l'import</span>
		</div>
		<input
			id="account-iban"
			type="text"
			bind:value={iban}
			placeholder="BE00 0000 0000 0000"
			autocomplete="off"
			class="w-full px-4 py-3 border rounded-xl bg-cotton text-coffee-900 placeholder-stone-400 outline-none transition-all focus:ring-2 focus:ring-sage/50 font-mono text-sm"
			class:border-sand={!errors.iban}
			class:focus:border-sage={!errors.iban}
			class:border-terracotta={errors.iban}
		/>
		{#if errors.iban}
			<p class="text-sm text-terracotta mt-1">{errors.iban}</p>
		{/if}
	</div>

	<!-- Actions -->
	<div class="flex gap-3 pt-4">
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
			disabled={isSubmitting}
		>
			{#if isSubmitting}
				<span class="loading loading-spinner loading-sm"></span>
			{/if}
			{account ? 'Enregistrer' : 'Ajouter'}
		</button>
	</div>
</form>

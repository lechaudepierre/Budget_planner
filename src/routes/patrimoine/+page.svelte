<script lang="ts">
	import { onMount } from 'svelte';
	import { getAccounts, createAccount, updateAccount, deleteAccount, calculateTotalPatrimoine } from '$lib/data/accounts';
	import { formatCurrency } from '$lib/utils/currency';
	import { accountTypes } from '$lib/schemas/account';
	import type { AccountFormData } from '$lib/schemas/account';
	import type { Database } from '$lib/types/database';
	import AccountForm from '$lib/components/forms/AccountForm.svelte';
	import { toast } from '$lib/stores/toast';

	type Account = Database['public']['Tables']['accounts']['Row'];

	let accounts = $state<Account[]>([]);
	let isLoading = $state(true);
	let showAddModal = $state(false);
	let accountToEdit = $state<Account | null>(null);
	let isSubmitting = $state(false);
	let accountToDelete = $state<Account | null>(null);

	let totalPatrimoine = $derived(calculateTotalPatrimoine(accounts));

	onMount(async () => {
		await loadAccounts();
	});

	async function loadAccounts() {
		isLoading = true;
		const { data, error } = await getAccounts();
		if (error) {
			toast.error(error);
		} else if (data) {
			accounts = data;
		}
		isLoading = false;
	}

	async function handleAddAccount(data: AccountFormData) {
		isSubmitting = true;
		const { data: newAccount, error } = await createAccount(data);
		isSubmitting = false;

		if (error) {
			toast.error(error);
			return;
		}

		if (newAccount) {
			accounts = [newAccount, ...accounts];
			toast.success('Compte ajouté avec succès');
			showAddModal = false;
		}
	}

	async function handleEditAccount(data: AccountFormData) {
		if (!accountToEdit) return;
		
		isSubmitting = true;
		const { data: updated, error } = await updateAccount(accountToEdit.id, data);
		isSubmitting = false;

		if (error) {
			toast.error(error);
			return;
		}

		if (updated) {
			accounts = accounts.map((a) => (a.id === updated.id ? updated : a));
			toast.success('Compte mis à jour');
			accountToEdit = null;
		}
	}

	async function handleDeleteAccount() {
		if (!accountToDelete) return;

		const { error } = await deleteAccount(accountToDelete.id);

		if (error) {
			toast.error(error);
		} else {
			accounts = accounts.filter((a) => a.id !== accountToDelete!.id);
			toast.success('Compte supprimé');
		}
		accountToDelete = null;
	}

	function getAccountTypeLabel(type: string | null): string {
		if (!type) return '';
		const found = accountTypes.find((t) => t.value === type);
		return found?.label ?? type;
	}
</script>

<div class="space-y-6">
	<!-- Total Patrimoine Card -->
	<div
		class="card bg-gradient-to-br from-sage to-accent text-white p-6 rounded-2xl shadow-lg"
	>
		<div class="flex justify-between items-start">
			<div>
				<p class="text-white/80 text-sm font-medium mb-1">Patrimoine total</p>
				<p class="text-4xl font-bold">{formatCurrency(totalPatrimoine)}</p>
			</div>
			<div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
				<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
				</svg>
			</div>
		</div>
		{#if accounts.length > 0}
			<p class="text-white/70 text-sm mt-4">{accounts.length} compte{accounts.length > 1 ? 's' : ''}</p>
		{/if}
	</div>

	<!-- Header with Add button -->
	<div class="flex justify-between items-center">
		<h2 class="text-lg font-semibold text-coffee-900">Mes comptes</h2>
		<button
			onclick={() => (showAddModal = true)}
			class="btn bg-sage hover:bg-sage-dark border-none text-white gap-2 rounded-xl"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5" />
			</svg>
			Ajouter un compte
		</button>
	</div>

	<!-- Accounts List -->
	{#if isLoading}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg text-sage"></span>
		</div>
	{:else if accounts.length === 0}
		<!-- Empty State -->
		<div class="text-center py-12 bg-cotton rounded-2xl border border-sand">
			<div class="w-16 h-16 bg-oat rounded-full flex items-center justify-center mx-auto mb-4">
				<svg class="w-8 h-8 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
				</svg>
			</div>
			<h3 class="text-lg font-medium text-coffee-900 mb-2">Aucun compte</h3>
			<p class="text-stone-500 mb-6">Ajoutez votre premier compte pour commencer à suivre votre patrimoine</p>
			<button
				onclick={() => (showAddModal = true)}
				class="btn bg-sage hover:bg-sage-dark border-none text-white gap-2"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5" />
				</svg>
				Ajouter un compte
			</button>
		</div>
	{:else}
		<div class="space-y-3">
			{#each accounts as account (account.id)}
				<div
					class="bg-cotton border border-sand rounded-xl p-4 hover:shadow-md transition-shadow duration-150"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-4">
							<div class="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center">
								<svg class="w-5 h-5 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
								</svg>
							</div>
							<div>
								<p class="font-medium text-coffee-900">{account.name}</p>
								{#if account.account_type}
									<p class="text-sm text-stone-500">{getAccountTypeLabel(account.account_type)}</p>
								{/if}
							</div>
						</div>
						<div class="flex items-center gap-2">
							<p
								class="text-lg font-semibold"
								class:text-sage={account.balance >= 0}
								class:text-terracotta={account.balance < 0}
							>
								{formatCurrency(account.balance)}
							</p>
							<button
								onclick={() => (accountToEdit = account)}
								class="btn btn-ghost btn-sm text-stone-500 hover:text-sage hover:bg-sage/10"
								title="Modifier"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
								</svg>
							</button>
							<button
								onclick={() => (accountToDelete = account)}
								class="btn btn-ghost btn-sm text-stone-500 hover:text-terracotta hover:bg-terracotta/10"
								title="Supprimer"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Add Account Modal -->
{#if showAddModal}
	<div class="modal modal-open">
		<div class="modal-box bg-linen max-w-md">
			<h3 class="font-semibold text-xl text-coffee-900 mb-6">Ajouter un compte</h3>
			<AccountForm
				onSubmit={handleAddAccount}
				onCancel={() => (showAddModal = false)}
				{isSubmitting}
			/>
		</div>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div 
			class="modal-backdrop bg-black/40" 
			onclick={() => (showAddModal = false)}
			onkeydown={(e) => e.key === 'Escape' && (showAddModal = false)}
			role="button"
			tabindex="-1"
			aria-label="Fermer"
		></div>
	</div>
{/if}

<!-- Edit Account Modal -->
{#if accountToEdit}
	<div class="modal modal-open">
		<div class="modal-box bg-linen max-w-md">
			<h3 class="font-semibold text-xl text-coffee-900 mb-6">Modifier le compte</h3>
			{#key accountToEdit.id}
				<AccountForm
					account={accountToEdit}
					onSubmit={handleEditAccount}
					onCancel={() => (accountToEdit = null)}
					{isSubmitting}
				/>
			{/key}
		</div>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div 
			class="modal-backdrop bg-black/40" 
			onclick={() => (accountToEdit = null)}
			onkeydown={(e) => e.key === 'Escape' && (accountToEdit = null)}
			role="button"
			tabindex="-1"
			aria-label="Fermer"
		></div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if accountToDelete}
	<div class="modal modal-open">
		<div class="modal-box bg-linen max-w-sm">
			<h3 class="font-semibold text-xl text-coffee-900 mb-2">Supprimer le compte</h3>
			<p class="text-stone-500 mb-6">
				Êtes-vous sûr de vouloir supprimer <strong class="text-coffee-900">{accountToDelete.name}</strong> ?
				Cette action est irréversible.
			</p>
			<div class="flex gap-3">
				<button
					onclick={() => (accountToDelete = null)}
					class="btn flex-1 bg-oat border-sand text-coffee-900 hover:bg-sand"
				>
					Annuler
				</button>
				<button
					onclick={handleDeleteAccount}
					class="btn flex-1 bg-terracotta hover:bg-terracotta/90 border-none text-white"
				>
					Supprimer
				</button>
			</div>
		</div>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div 
			class="modal-backdrop bg-black/40" 
			onclick={() => (accountToDelete = null)}
			onkeydown={(e) => e.key === 'Escape' && (accountToDelete = null)}
			role="button"
			tabindex="-1"
			aria-label="Fermer"
		></div>
	</div>
{/if}

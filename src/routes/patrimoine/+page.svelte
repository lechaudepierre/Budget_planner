<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getAccounts,
		createAccount,
		updateAccount,
		deleteAccount,
		calculateTotalPatrimoine
	} from '$lib/data/accounts';
	import { formatCurrency } from '$lib/utils/currency';
	import { accountTypes } from '$lib/schemas/account';
	import type { AccountFormData } from '$lib/schemas/account';
	import type { Database } from '$lib/types/database';
	import AccountForm from '$lib/components/forms/AccountForm.svelte';
	import AnimatedNumber from '$lib/components/ui/AnimatedNumber.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
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

	function syncLabel(account: Account): string | null {
		if (account.balance_source !== 'import' || !account.last_import_at) return null;
		const d = new Date(account.last_import_at);
		return `Synchronisé le ${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
	}

	function getAccountTypeLabel(type: string | null): string {
		if (!type) return '';
		const found = accountTypes.find((t) => t.value === type);
		return found?.label ?? type;
	}
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<!-- Total + action -->
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="card flex-1 min-w-64">
			<p class="card-title">Patrimoine total</p>
			<p
				class="mt-1 text-4xl font-semibold {totalPatrimoine < 0
					? 'text-terracotta'
					: 'text-coffee-900'}"
			>
				<AnimatedNumber value={totalPatrimoine} />
			</p>
			<p class="text-xs text-stone-400 mt-1">
				{accounts.length} compte{accounts.length > 1 ? 's' : ''} · les comptes importés se mettent à jour
				à chaque relevé
			</p>
		</div>
		<button type="button" onclick={() => (showAddModal = true)} class="btn-primary-sage">
			<Icon name="plus" size={16} strokeWidth={2.4} />
			Ajouter un compte
		</button>
	</div>

	<!-- Accounts List -->
	{#if isLoading}
		<div class="card"><Skeleton lines={4} /></div>
	{:else if accounts.length === 0}
		<div class="card">
			<EmptyState
				icon="bank"
				title="Aucun compte"
				text="Ajoute ton premier compte pour suivre ton patrimoine."
				ctaLabel="Ajouter un compte"
				onCta={() => (showAddModal = true)}
			/>
		</div>
	{:else}
		<div class="space-y-3">
			{#each accounts as account (account.id)}
				<div class="card card-hover p-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-4">
							<div
								class="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center text-sage"
							>
								<Icon name="bank" size={20} />
							</div>
							<div>
								<p class="font-medium text-coffee-900">{account.name}</p>
								<p class="text-sm text-stone-500">
									{getAccountTypeLabel(account.account_type) || 'Compte'}
									{#if syncLabel(account)}
										<span class="ml-2 text-[11px] px-1.5 py-0.5 rounded bg-sage/10 text-sage"
											>{syncLabel(account)}</span
										>
									{/if}
								</p>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<p
								class="text-lg font-semibold num"
								class:text-coffee-900={account.balance >= 0}
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
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
							</button>
							<button
								onclick={() => (accountToDelete = account)}
								class="btn btn-ghost btn-sm text-stone-500 hover:text-terracotta hover:bg-terracotta/10"
								title="Supprimer"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
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
	<div
		class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
		onclick={() => (showAddModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showAddModal = false)}
		role="button"
		tabindex="-1"
		aria-label="Fermer"
	></div>
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
		<div
			class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 pointer-events-auto animate-slide-up"
		>
			<h3 class="font-semibold text-xl text-coffee-900 mb-6">Ajouter un compte</h3>
			<AccountForm
				onSubmit={handleAddAccount}
				onCancel={() => (showAddModal = false)}
				{isSubmitting}
			/>
		</div>
	</div>
{/if}

<!-- Edit Account Modal -->
{#if accountToEdit}
	<div
		class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
		onclick={() => (accountToEdit = null)}
		onkeydown={(e) => e.key === 'Escape' && (accountToEdit = null)}
		role="button"
		tabindex="-1"
		aria-label="Fermer"
	></div>
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
		<div
			class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 pointer-events-auto animate-slide-up"
		>
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
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if accountToDelete}
	<div
		class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
		onclick={() => (accountToDelete = null)}
		onkeydown={(e) => e.key === 'Escape' && (accountToDelete = null)}
		role="button"
		tabindex="-1"
		aria-label="Fermer"
	></div>
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
		<div
			class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 pointer-events-auto animate-slide-up"
		>
			<h3 class="font-semibold text-xl text-coffee-900 mb-2">Supprimer le compte</h3>
			<p class="text-stone-500 mb-6">
				Êtes-vous sûr de vouloir supprimer <strong class="text-coffee-900"
					>{accountToDelete.name}</strong
				> ? Cette action est irréversible.
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
	</div>
{/if}

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(20px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.2s ease-out;
	}

	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}
</style>

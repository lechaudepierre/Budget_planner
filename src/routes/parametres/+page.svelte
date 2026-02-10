<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { getAccounts } from '$lib/data/accounts';
	import { getExpenses } from '$lib/data/expenses';
	import { toast } from '$lib/stores/toast';
	import type { User } from '@supabase/supabase-js';
	import type { Database } from '$lib/types/database';

	type Account = Database['public']['Tables']['accounts']['Row'];

	const LS_KEY = 'budget_planner_default_account';

	let user = $state<User | null>(null);
	let accounts = $state<Account[]>([]);
	let defaultAccountId = $state('');
	let loading = $state(true);
	let exporting = $state(false);

	onMount(async () => {
		const [{ data: userData }, { data: accts }] = await Promise.all([
			supabase.auth.getUser(),
			getAccounts()
		]);
		user = userData.user;
		accounts = accts || [];

		// Load saved default account
		const saved = localStorage.getItem(LS_KEY);
		if (saved && accounts.some((a) => a.id === saved)) {
			defaultAccountId = saved;
		}

		loading = false;
	});

	function saveDefaultAccount() {
		if (defaultAccountId) {
			localStorage.setItem(LS_KEY, defaultAccountId);
		} else {
			localStorage.removeItem(LS_KEY);
		}
		toast.success('Compte par défaut enregistré');
	}

	function formatCreatedAt(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	async function exportCSV() {
		exporting = true;
		try {
			const { data: expenses, error } = await getExpenses();
			if (error) {
				toast.error("Erreur lors de l'export");
				return;
			}

			const header = 'Date,Description,Montant,Catégorie,Compte';
			const rows = expenses.map((e) => {
				const desc = (e.description || '').replace(/"/g, '""');
				const cat = e.category?.name || '';
				const acct = e.account?.name || '';
				return `${e.date},"${desc}",${e.amount},"${cat}","${acct}"`;
			});

			const csv = [header, ...rows].join('\n');
			const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			const today = new Date().toISOString().split('T')[0];
			a.href = url;
			a.download = `depenses_${today}.csv`;
			a.click();
			URL.revokeObjectURL(url);

			toast.success(`${expenses.length} transactions exportées`);
		} finally {
			exporting = false;
		}
	}
</script>

<svelte:head>
	<title>Paramètres | Budget Planner</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6">
	<h1 class="text-2xl font-semibold text-coffee-900">Paramètres</h1>

	{#if loading}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg text-sage"></span>
		</div>
	{:else}
		<!-- Section A: Profil utilisateur -->
		<div class="bg-white rounded-2xl border border-sand p-6">
			<h2 class="text-lg font-semibold text-coffee-900 mb-4">Profil</h2>
			{#if user}
				<div class="flex items-center gap-4">
					{#if user.user_metadata?.avatar_url}
						<img
							src={user.user_metadata.avatar_url}
							alt="Avatar"
							class="w-14 h-14 rounded-full border-2 border-sand"
							referrerpolicy="no-referrer"
						/>
					{:else}
						<div
							class="w-14 h-14 rounded-full bg-sage/20 flex items-center justify-center text-sage text-xl font-semibold"
						>
							{(user.user_metadata?.full_name || user.email || '?').charAt(0).toUpperCase()}
						</div>
					{/if}
					<div class="space-y-0.5">
						<p class="font-medium text-coffee-900">
							{user.user_metadata?.full_name || 'Utilisateur'}
						</p>
						<p class="text-sm text-stone-500">{user.email}</p>
						{#if user.created_at}
							<p class="text-xs text-stone-400">
								Membre depuis le {formatCreatedAt(user.created_at)}
							</p>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<!-- Section B: Compte par défaut -->
		<div class="bg-white rounded-2xl border border-sand p-6">
			<h2 class="text-lg font-semibold text-coffee-900 mb-1">Compte par défaut</h2>
			<p class="text-sm text-stone-500 mb-4">
				Sélectionné automatiquement lors de l'ajout d'une transaction.
			</p>
			{#if accounts.length > 0}
				<div class="flex items-end gap-3">
					<div class="flex-1 max-w-xs">
						<select
							bind:value={defaultAccountId}
							class="w-full px-4 py-3 border border-sand rounded-xl bg-cotton text-coffee-900 text-sm outline-none transition-all focus:ring-2 focus:ring-sage/50 focus:border-sage appearance-none cursor-pointer"
						>
							<option value="">Aucun (automatique)</option>
							{#each accounts as account}
								<option value={account.id}>{account.name}</option>
							{/each}
						</select>
					</div>
					<button
						onclick={saveDefaultAccount}
						class="px-5 py-3 bg-sage hover:bg-sage/90 text-white rounded-xl font-medium text-sm transition-colors"
					>
						Enregistrer
					</button>
				</div>
			{:else}
				<p class="text-sm text-stone-400">Aucun compte disponible.</p>
			{/if}
		</div>

		<!-- Section C: Exporter mes données -->
		<div class="bg-white rounded-2xl border border-sand p-6">
			<h2 class="text-lg font-semibold text-coffee-900 mb-1">Exporter mes données</h2>
			<p class="text-sm text-stone-500 mb-4">
				Téléchargez toutes vos transactions au format CSV.
			</p>
			<button
				onclick={exportCSV}
				disabled={exporting}
				class="px-5 py-3 bg-coffee-900 hover:bg-coffee-900/90 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
			>
				{#if exporting}
					<span class="loading loading-spinner loading-sm"></span>
				{/if}
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				Exporter en CSV
			</button>
		</div>
	{/if}
</div>

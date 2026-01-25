<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';
	import { calculateProgress } from '$lib/schemas/goal';
	import { toast } from '$lib/stores/toast';
	import type { SavingsGoal } from '$lib/types/database';
	import type { Database } from '$lib/types/database';

	type Account = Database['public']['Tables']['accounts']['Row'];

	type ProgressColors = { stroke: string; strokeLight: string; textClass: string };

	let {
		type,
		goal,
		account,
		allocatedAmount,
		transferredAmount = 0,
		effectiveAmount,
		onSave,
		onTransfer
	} = $props<{
		type: 'goal' | 'account';
		goal?: SavingsGoal;
		account?: Account;
		allocatedAmount: number;
		transferredAmount?: number;
		effectiveAmount?: number;
		onSave: (amount: number) => Promise<{ error: string | null }>;
		onTransfer?: () => Promise<void>;
	}>();

	// Edit mode state
	let isEditing = $state(false);
	let editAmount = $state(allocatedAmount);
	let isSaving = $state(false);

	// Progress colors for goals
	function getProgressColors(progress: number): ProgressColors {
		if (progress >= 75) {
			return { stroke: '#639A88', strokeLight: '#639A8880', textClass: 'text-sage' };
		} else if (progress >= 40) {
			return { stroke: '#D4A574', strokeLight: '#D4A57480', textClass: 'text-amber' };
		} else {
			return { stroke: '#C17C60', strokeLight: '#C17C6080', textClass: 'text-terracotta' };
		}
	}

	// Derived values for goals
	let baseProgress = $derived(
		goal ? calculateProgress(goal.current_amount, goal.target_amount) : 0
	);
	let effectiveProgress = $derived(
		goal && effectiveAmount !== undefined
			? calculateProgress(effectiveAmount, goal.target_amount)
			: baseProgress
	);
	let hasPending = $derived(
		effectiveAmount !== undefined && goal
			? effectiveAmount > goal.current_amount
			: allocatedAmount > transferredAmount
	);
	let colors = $derived(getProgressColors(effectiveProgress));
	let canTransfer = $derived(allocatedAmount > 0 && allocatedAmount > transferredAmount);

	// Account type icon
	function getAccountTypeIcon(accountType: string): string {
		switch (accountType) {
			case 'savings':
				return 'M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z';
			case 'investment':
				return 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6';
			case 'checking':
				return 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z';
			default:
				return 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z';
		}
	}

	function startEditing() {
		editAmount = allocatedAmount;
		isEditing = true;
	}

	function cancelEditing() {
		editAmount = allocatedAmount;
		isEditing = false;
	}

	async function saveChanges() {
		if (editAmount === allocatedAmount) {
			isEditing = false;
			return;
		}

		isSaving = true;
		const result = await onSave(editAmount);
		isSaving = false;

		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success('Allocation enregistrée');
			isEditing = false;
		}
	}

	async function resetAllocation() {
		if (allocatedAmount === 0) return;

		isSaving = true;
		const result = await onSave(0);
		isSaving = false;

		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success('Allocation remise à zéro');
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			saveChanges();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			cancelEditing();
		}
	}
</script>

<div
	class="flex items-center gap-3 p-3 bg-cotton rounded-xl transition-all duration-150"
	class:ring-1={isEditing}
	class:ring-sage={isEditing}
	class:shadow-sm={isEditing}
>
	{#if type === 'goal' && goal}
		<!-- Goal Progress indicator -->
		<div class="w-10 h-10 relative flex-shrink-0">
			<svg class="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
				<circle cx="20" cy="20" r="16" fill="none" stroke="#E5E0DB" stroke-width="4" />
				<!-- Pending allocation overlay (lighter) -->
				{#if hasPending}
					<circle
						cx="20"
						cy="20"
						r="16"
						fill="none"
						stroke={colors.strokeLight}
						stroke-width="4"
						stroke-linecap="round"
						stroke-dasharray={100.53}
						stroke-dashoffset={100.53 - (Math.min(effectiveProgress, 100) / 100) * 100.53}
					/>
				{/if}
				<!-- Base progress -->
				<circle
					cx="20"
					cy="20"
					r="16"
					fill="none"
					stroke={colors.stroke}
					stroke-width="4"
					stroke-linecap="round"
					stroke-dasharray={100.53}
					stroke-dashoffset={100.53 - (Math.min(baseProgress, 100) / 100) * 100.53}
				/>
			</svg>
			<span class="absolute inset-0 flex items-center justify-center text-xs font-bold {colors.textClass}">
				{effectiveProgress}%
			</span>
		</div>

		<!-- Goal info -->
		<div class="flex-1 min-w-0">
			<p class="font-medium text-coffee-900 truncate">{goal.name}</p>
			<p class="text-xs text-stone-400">
				{formatCurrency(effectiveAmount ?? goal.current_amount)} / {formatCurrency(goal.target_amount)}
				{#if hasPending && effectiveAmount}
					<span class="{colors.textClass}"> (+{formatCurrency(effectiveAmount - goal.current_amount)})</span>
				{/if}
			</p>
		</div>
	{:else if type === 'account' && account}
		<!-- Account icon -->
		<div class="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center flex-shrink-0">
			<svg class="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getAccountTypeIcon(account.account_type)} />
			</svg>
		</div>

		<!-- Account info -->
		<div class="flex-1 min-w-0">
			<p class="font-medium text-coffee-900 truncate">{account.name}</p>
			<p class="text-xs text-stone-400">
				Solde: {formatCurrency(account.balance)}
				{#if allocatedAmount > 0}
					<span class="text-sage"> (+{formatCurrency(allocatedAmount)} alloué)</span>
				{/if}
			</p>
		</div>
	{/if}

	<!-- Amount display/input and actions -->
	<div class="flex items-center gap-1 shrink-0">
		{#if isEditing}
			<div class="relative">
				<input
					type="number"
					bind:value={editAmount}
					onkeydown={handleKeydown}
					class="input input-sm input-bordered w-20 text-right text-sm bg-white border-sand focus:border-sage focus:ring-sage pr-6 h-8"
					min="0"
					step="10"
				/>
				<span class="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 text-xs">€</span>
			</div>
			<button
				type="button"
				onclick={cancelEditing}
				class="btn btn-ghost btn-sm text-stone-500 hover:text-coffee-900"
				title="Annuler (Échap)"
				disabled={isSaving}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
			<button
				type="button"
				onclick={saveChanges}
				class="btn btn-ghost btn-sm text-sage hover:text-sage-dark hover:bg-sage/10"
				title="Enregistrer (Entrée)"
				disabled={isSaving}
			>
				{#if isSaving}
					<span class="loading loading-spinner loading-xs"></span>
				{:else}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				{/if}
			</button>
		{:else}
			<span class="text-sm font-medium text-coffee-900 w-20 text-right">
				{allocatedAmount > 0 ? formatCurrency(allocatedAmount) : '—'}
			</span>

			<!-- Edit button -->
			<button
				type="button"
				onclick={startEditing}
				class="btn btn-ghost btn-sm text-stone-500 hover:text-sage hover:bg-sage/10"
				title="Modifier"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
				</svg>
			</button>

			<!-- Reset/Delete button (only if has allocation) -->
			{#if allocatedAmount > 0}
				<button
					type="button"
					onclick={resetAllocation}
					class="btn btn-ghost btn-sm text-stone-500 hover:text-terracotta hover:bg-terracotta/10"
					title="Remettre à zéro"
					disabled={isSaving}
				>
					{#if isSaving}
						<span class="loading loading-spinner loading-xs"></span>
					{:else}
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
					{/if}
				</button>
			{:else}
				<div class="w-8"></div>
			{/if}

			<!-- Transfer indicator (for already transferred amounts) -->
			{#if transferredAmount > 0 && transferredAmount >= allocatedAmount}
				<div class="p-1 text-sage" title="Versement effectué">
					<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
						<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
			{/if}
		{/if}
	</div>
</div>

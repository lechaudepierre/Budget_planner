import { supabase } from '$lib/supabase';
import type {
	SavingsAllocation,
	SavingsAllocationInsert,
	SavingsAllocationWithDetails,
	SavingsGoal
} from '$lib/types/database';
import type { Database } from '$lib/types/database';

type Account = Database['public']['Tables']['accounts']['Row'];

export interface DataResponse<T> {
	data: T | null;
	error: string | null;
}

/**
 * Get all savings allocations for a specific month with goal/account details
 */
export async function getSavingsAllocations(
	month: string
): Promise<DataResponse<SavingsAllocationWithDetails[]>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	const { data, error } = await supabase
		.from('monthly_savings_allocations')
		.select(
			`
			*,
			goal:savings_goals(*),
			account:accounts(*)
		`
		)
		.eq('user_id', userData.user.id)
		.eq('month', month);

	if (error) {
		console.error('Error fetching savings allocations:', error);
		return { data: null, error: error.message };
	}

	return { data: data as SavingsAllocationWithDetails[], error: null };
}

/**
 * Get total allocated savings for a month
 */
export async function getTotalSavingsAllocated(month: string): Promise<DataResponse<number>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	const { data, error } = await supabase
		.from('monthly_savings_allocations')
		.select('allocated_amount')
		.eq('user_id', userData.user.id)
		.eq('month', month);

	if (error) {
		console.error('Error fetching total savings:', error);
		return { data: null, error: error.message };
	}

	const total = data.reduce((sum, item) => sum + (item.allocated_amount || 0), 0);
	return { data: total, error: null };
}

/**
 * Upsert a savings allocation for a goal
 */
export async function upsertGoalAllocation(
	month: string,
	goalId: string,
	amount: number
): Promise<DataResponse<SavingsAllocation>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	// Check if allocation already exists
	const { data: existing } = await supabase
		.from('monthly_savings_allocations')
		.select('id')
		.eq('user_id', userData.user.id)
		.eq('month', month)
		.eq('goal_id', goalId)
		.maybeSingle();

	if (existing) {
		// Update existing
		const { data, error } = await supabase
			.from('monthly_savings_allocations')
			.update({ allocated_amount: amount })
			.eq('id', existing.id)
			.select()
			.single();

		if (error) {
			console.error('Error updating goal allocation:', error);
			return { data: null, error: error.message };
		}
		return { data, error: null };
	} else {
		// Insert new
		const insertData: SavingsAllocationInsert = {
			user_id: userData.user.id,
			month,
			goal_id: goalId,
			allocated_amount: amount
		};

		const { data, error } = await supabase
			.from('monthly_savings_allocations')
			.insert(insertData)
			.select()
			.single();

		if (error) {
			console.error('Error creating goal allocation:', error);
			return { data: null, error: error.message };
		}
		return { data, error: null };
	}
}

/**
 * Upsert a savings allocation for an account
 */
export async function upsertAccountAllocation(
	month: string,
	accountId: string,
	amount: number
): Promise<DataResponse<SavingsAllocation>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	// Check if allocation already exists
	const { data: existing } = await supabase
		.from('monthly_savings_allocations')
		.select('id')
		.eq('user_id', userData.user.id)
		.eq('month', month)
		.eq('account_id', accountId)
		.maybeSingle();

	if (existing) {
		// Update existing
		const { data, error } = await supabase
			.from('monthly_savings_allocations')
			.update({ allocated_amount: amount })
			.eq('id', existing.id)
			.select()
			.single();

		if (error) {
			console.error('Error updating account allocation:', error);
			return { data: null, error: error.message };
		}
		return { data, error: null };
	} else {
		// Insert new
		const insertData: SavingsAllocationInsert = {
			user_id: userData.user.id,
			month,
			account_id: accountId,
			allocated_amount: amount
		};

		const { data, error } = await supabase
			.from('monthly_savings_allocations')
			.insert(insertData)
			.select()
			.single();

		if (error) {
			console.error('Error creating account allocation:', error);
			return { data: null, error: error.message };
		}
		return { data, error: null };
	}
}

/**
 * Transfer allocated amount to goal (actually add to goal's current_amount)
 */
export async function transferToGoal(
	allocationId: string,
	amount: number
): Promise<DataResponse<{ allocation: SavingsAllocation; goal: SavingsGoal }>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	// Get the allocation
	const { data: allocation, error: allocError } = await supabase
		.from('monthly_savings_allocations')
		.select('*, goal:savings_goals(*)')
		.eq('id', allocationId)
		.eq('user_id', userData.user.id)
		.single();

	if (allocError || !allocation || !allocation.goal_id) {
		return { data: null, error: 'Allocation non trouvée' };
	}

	// Update goal's current_amount
	const goal = allocation.goal as SavingsGoal;
	const newAmount = goal.current_amount + amount;

	const { data: updatedGoal, error: goalError } = await supabase
		.from('savings_goals')
		.update({ current_amount: newAmount })
		.eq('id', allocation.goal_id)
		.select()
		.single();

	if (goalError) {
		console.error('Error updating goal:', goalError);
		return { data: null, error: goalError.message };
	}

	// Update transferred_amount on allocation
	const { data: updatedAllocation, error: updateError } = await supabase
		.from('monthly_savings_allocations')
		.update({ transferred_amount: allocation.transferred_amount + amount })
		.eq('id', allocationId)
		.select()
		.single();

	if (updateError) {
		console.error('Error updating allocation:', updateError);
		return { data: null, error: updateError.message };
	}

	return { data: { allocation: updatedAllocation, goal: updatedGoal }, error: null };
}

/**
 * Transfer allocated amount to account (update account balance)
 */
export async function transferToAccount(
	allocationId: string,
	amount: number
): Promise<DataResponse<{ allocation: SavingsAllocation; account: Account }>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	// Get the allocation
	const { data: allocation, error: allocError } = await supabase
		.from('monthly_savings_allocations')
		.select('*, account:accounts(*)')
		.eq('id', allocationId)
		.eq('user_id', userData.user.id)
		.single();

	if (allocError || !allocation || !allocation.account_id) {
		return { data: null, error: 'Allocation non trouvée' };
	}

	// Update account balance
	const account = allocation.account as Account;
	const newBalance = account.balance + amount;

	const { data: updatedAccount, error: accountError } = await supabase
		.from('accounts')
		.update({ balance: newBalance })
		.eq('id', allocation.account_id)
		.select()
		.single();

	if (accountError) {
		console.error('Error updating account:', accountError);
		return { data: null, error: accountError.message };
	}

	// Update transferred_amount on allocation
	const { data: updatedAllocation, error: updateError } = await supabase
		.from('monthly_savings_allocations')
		.update({ transferred_amount: allocation.transferred_amount + amount })
		.eq('id', allocationId)
		.select()
		.single();

	if (updateError) {
		console.error('Error updating allocation:', updateError);
		return { data: null, error: updateError.message };
	}

	return { data: { allocation: updatedAllocation, account: updatedAccount }, error: null };
}

/**
 * Delete a savings allocation
 */
export async function deleteSavingsAllocation(id: string): Promise<DataResponse<null>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	const { error } = await supabase
		.from('monthly_savings_allocations')
		.delete()
		.eq('id', id)
		.eq('user_id', userData.user.id);

	if (error) {
		console.error('Error deleting allocation:', error);
		return { data: null, error: error.message };
	}

	return { data: null, error: null };
}

/**
 * Get savings accounts (accounts marked as savings type)
 */
export async function getSavingsAccounts(): Promise<DataResponse<Account[]>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	const { data, error } = await supabase
		.from('accounts')
		.select('*')
		.eq('user_id', userData.user.id)
		.eq('account_type', 'savings')
		.order('name');

	if (error) {
		console.error('Error fetching savings accounts:', error);
		return { data: null, error: error.message };
	}

	return { data, error: null };
}

/**
 * Get all accounts for savings distribution (all account types)
 */
export async function getAllAccountsForSavings(): Promise<DataResponse<Account[]>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	const { data, error } = await supabase
		.from('accounts')
		.select('*')
		.eq('user_id', userData.user.id)
		.order('name');

	if (error) {
		console.error('Error fetching accounts:', error);
		return { data: null, error: error.message };
	}

	return { data, error: null };
}

/**
 * Finalize all savings allocations for a month
 * This adds the allocated amounts to goals' current_amount and updates account balances
 */
export async function finalizeMonthSavings(
	month: string
): Promise<DataResponse<{ finalizedCount: number; totalAmount: number }>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	try {
		// 1. Get all non-finalized allocations for this month
		const { data: allocations, error: fetchError } = await supabase
			.from('monthly_savings_allocations')
			.select(`
				*,
				goal:savings_goals(*),
				account:accounts(*)
			`)
			.eq('user_id', userData.user.id)
			.eq('month', month)
			// @ts-ignore - is_finalized might not be in types yet
			.eq('is_finalized', false);

		if (fetchError) throw fetchError;
		if (!allocations || allocations.length === 0) {
			return { data: { finalizedCount: 0, totalAmount: 0 }, error: null };
		}

		let totalAmount = 0;
		let finalizedCount = 0;

		// 2. Process each allocation
		for (const alloc of allocations) {
			const amount = Number(alloc.allocated_amount) || 0;
			if (amount === 0) continue;

			if (alloc.goal_id && alloc.goal) {
				// Update goal current_amount
				const { error: goalError } = await supabase
					.from('savings_goals')
					.update({
						current_amount: (Number((alloc.goal as any).current_amount) || 0) + amount
					})
					.eq('id', alloc.goal_id);

				if (goalError) console.error(`Error finalizing goal ${alloc.goal_id}:`, goalError);
				else {
					finalizedCount++;
					totalAmount += amount;
				}
			} else if (alloc.account_id && alloc.account) {
				// Update account balance
				const { error: accountError } = await supabase
					.from('accounts')
					.update({
						balance: (Number((alloc.account as any).balance) || 0) + amount
					})
					.eq('id', alloc.account_id);

				if (accountError)
					console.error(`Error finalizing account ${alloc.account_id}:`, accountError);
				else {
					finalizedCount++;
					totalAmount += amount;
				}
			}

			// 3. Mark as finalized
			await supabase
				.from('monthly_savings_allocations')
				.update({
					transferred_amount: amount, // Also mark as transferred since it's finalized
					// @ts-ignore
					is_finalized: true
				})
				.eq('id', alloc.id);
		}

		return { data: { finalizedCount, totalAmount }, error: null };
	} catch (err: any) {
		console.error('Error finalizing month savings:', err);
		return { data: null, error: err.message || 'Erreur lors de la finalisation' };
	}
}


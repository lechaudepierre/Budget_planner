import { supabase } from '$lib/supabase';
import type { Database } from '$lib/types/database';
import type { AccountFormData } from '$lib/schemas/account';

type Account = Database['public']['Tables']['accounts']['Row'];
type AccountInsert = Database['public']['Tables']['accounts']['Insert'];

export interface DataResponse<T> {
	data: T | null;
	error: string | null;
}

/**
 * Get all accounts for the current user
 */
export async function getAccounts(): Promise<DataResponse<Account[]>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	const { data, error } = await supabase
		.from('accounts')
		.select('*')
		.eq('user_id', userData.user.id)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching accounts:', error);
		return { data: null, error: error.message };
	}

	return { data, error: null };
}

/**
 * Create a new account
 */
export async function createAccount(
	formData: AccountFormData
): Promise<DataResponse<Account>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	const accountData: AccountInsert = {
		user_id: userData.user.id,
		name: formData.name,
		balance: formData.balance,
		account_type: formData.account_type || null
	};

	const { data, error } = await supabase
		.from('accounts')
		.insert(accountData)
		.select()
		.single();

	if (error) {
		console.error('Error creating account:', error);
		return { data: null, error: error.message };
	}

	return { data, error: null };
}

/**
 * Update an existing account
 */
export async function updateAccount(
	id: string,
	formData: Partial<AccountFormData>
): Promise<DataResponse<Account>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	const { data, error } = await supabase
		.from('accounts')
		.update({
			name: formData.name,
			balance: formData.balance,
			account_type: formData.account_type
		})
		.eq('id', id)
		.eq('user_id', userData.user.id)
		.select()
		.single();

	if (error) {
		console.error('Error updating account:', error);
		return { data: null, error: error.message };
	}

	return { data, error: null };
}

/**
 * Delete an account
 */
export async function deleteAccount(id: string): Promise<DataResponse<null>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	const { error } = await supabase
		.from('accounts')
		.delete()
		.eq('id', id)
		.eq('user_id', userData.user.id);

	if (error) {
		console.error('Error deleting account:', error);
		return { data: null, error: error.message };
	}

	return { data: null, error: null };
}

/**
 * Calculate total patrimoine from accounts
 */
export function calculateTotalPatrimoine(accounts: Account[]): number {
	return accounts.reduce((sum, account) => sum + account.balance, 0);
}

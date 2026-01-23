import { supabase } from '$lib/supabase';
import type { IncomeEntry, IncomeEntryInsert, IncomeEntryUpdate } from '$lib/types/database';

/**
 * Get all income entries for a specific month
 */
export async function getIncomeEntries(month: string): Promise<{
	data: IncomeEntry[];
	error: Error | null;
}> {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) {
		return { data: [], error: new Error('Non authentifié') };
	}

	const { data, error } = await supabase
		.from('income_entries')
		.select('*')
		.eq('user_id', user.id)
		.eq('month', month)
		.order('created_at', { ascending: true });

	if (error) {
		console.error('Error fetching income entries:', error);
		return { data: [], error };
	}

	return { data: data || [], error: null };
}

/**
 * Get total income for a specific month
 */
export async function getTotalIncome(month: string): Promise<number> {
	const { data } = await getIncomeEntries(month);
	return data.reduce((sum, entry) => sum + Number(entry.amount), 0);
}

/**
 * Create a new income entry
 */
export async function createIncomeEntry(
	entry: Omit<IncomeEntryInsert, 'user_id'>
): Promise<{ data: IncomeEntry | null; error: Error | null }> {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) {
		return { data: null, error: new Error('Non authentifié') };
	}

	const { data, error } = await supabase
		.from('income_entries')
		.insert({
			...entry,
			user_id: user.id
		})
		.select()
		.single();

	if (error) {
		console.error('Error creating income entry:', error);
		return { data: null, error };
	}

	return { data, error: null };
}

/**
 * Update an existing income entry
 */
export async function updateIncomeEntry(
	id: string,
	updates: IncomeEntryUpdate
): Promise<{ data: IncomeEntry | null; error: Error | null }> {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) {
		return { data: null, error: new Error('Non authentifié') };
	}

	const { data, error } = await supabase
		.from('income_entries')
		.update(updates)
		.eq('id', id)
		.eq('user_id', user.id)
		.select()
		.single();

	if (error) {
		console.error('Error updating income entry:', error);
		return { data: null, error };
	}

	return { data, error: null };
}

/**
 * Delete an income entry
 */
export async function deleteIncomeEntry(id: string): Promise<{ error: Error | null }> {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: new Error('Non authentifié') };
	}

	const { error } = await supabase
		.from('income_entries')
		.delete()
		.eq('id', id)
		.eq('user_id', user.id);

	if (error) {
		console.error('Error deleting income entry:', error);
		return { error };
	}

	return { error: null };
}

import { supabase } from '$lib/supabase';
import type { Expense, ExpenseWithCategory } from '$lib/types/database';

/**
 * Create a new expense and optionally update the source account balance
 */
export async function createExpense(data: {
	category_id: string;
	account_id?: string | null;
	amount: number;
	description?: string | null;
	date: string;
}): Promise<{ data: Expense | null; error: Error | null }> {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) {
		return { data: null, error: new Error('Vous devez être connecté') };
	}

	const { data: expense, error } = await supabase
		.from('expenses')
		.insert({
			user_id: user.id,
			category_id: data.category_id,
			account_id: data.account_id || null,
			amount: data.amount,
			description: data.description || null,
			date: data.date
		})
		.select()
		.single();

	// If expense was created successfully and has an account, update the account balance
	if (expense && data.account_id) {
		await updateAccountBalance(data.account_id, -data.amount);
	}

	return { data: expense, error };
}

/**
 * Update account balance by a given amount (positive to add, negative to subtract)
 */
async function updateAccountBalance(accountId: string, amountDelta: number): Promise<void> {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) return;

	// Get current balance
	const { data: account } = await supabase
		.from('accounts')
		.select('balance')
		.eq('id', accountId)
		.eq('user_id', user.id)
		.single();

	if (!account) return;

	// Update with new balance
	await supabase
		.from('accounts')
		.update({ balance: account.balance + amountDelta })
		.eq('id', accountId)
		.eq('user_id', user.id);
}

/**
 * Get expenses with optional filters
 */
export async function getExpenses(options?: {
	categoryId?: string;
	startDate?: string;
	endDate?: string;
	limit?: number;
	offset?: number;
}): Promise<{ data: ExpenseWithCategory[]; error: Error | null; count: number }> {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) {
		return { data: [], error: new Error('Vous devez être connecté'), count: 0 };
	}

	let query = supabase
		.from('expenses')
		.select(
			`
            *,
            category:budget_categories(id, name, color),
            account:accounts(id, name)
        `,
			{ count: 'exact' }
		)
		.eq('user_id', user.id)
		.order('date', { ascending: false })
		.order('created_at', { ascending: false });

	if (options?.categoryId) {
		query = query.eq('category_id', options.categoryId);
	}
	if (options?.startDate) {
		query = query.gte('date', options.startDate);
	}
	if (options?.endDate) {
		query = query.lte('date', options.endDate);
	}
	if (options?.limit) {
		const offset = options.offset || 0;
		query = query.range(offset, offset + options.limit - 1);
	}

	const { data, error, count } = await query;
	return { data: (data as ExpenseWithCategory[]) || [], error, count: count || 0 };
}

/**
 * Update an expense and adjust account balance if amount changed
 */
export async function updateExpense(
	id: string,
	data: {
		category_id?: string;
		amount?: number;
		description?: string | null;
		date?: string;
	}
): Promise<{ data: Expense | null; error: Error | null }> {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) {
		return { data: null, error: new Error('Vous devez être connecté') };
	}

	// Fetch old expense to compute balance delta
	const { data: oldExpense } = await supabase
		.from('expenses')
		.select('amount, account_id, bank_amount')
		.eq('id', id)
		.eq('user_id', user.id)
		.single();

	const { data: expense, error } = await supabase
		.from('expenses')
		.update({
			...data,
			updated_at: new Date().toISOString()
		})
		.eq('id', id)
		.eq('user_id', user.id)
		.select()
		.single();

	// Adjust account balance if amount changed. Imported expenses carry the bank amount
	// separately: editing "my share" must not move the account balance.
	if (expense && oldExpense?.account_id && data.amount !== undefined && oldExpense.bank_amount === null) {
		const delta = Number(oldExpense.amount) - data.amount; // positive = amount decreased = add back
		if (delta !== 0) {
			await updateAccountBalance(oldExpense.account_id, delta);
		}
	}

	return { data: expense, error };
}

/**
 * Delete an expense and restore the account balance if applicable
 */
export async function deleteExpense(id: string): Promise<{ error: Error | null }> {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: new Error('Vous devez être connecté') };
	}

	// Fetch the expense first to know the amount and account
	const { data: existing } = await supabase
		.from('expenses')
		.select('amount, account_id, bank_amount')
		.eq('id', id)
		.eq('user_id', user.id)
		.single();

	const { error } = await supabase.from('expenses').delete().eq('id', id).eq('user_id', user.id);

	if (error) return { error };

	// Restore account balance with what the bank actually took
	if (existing?.account_id) {
		await updateAccountBalance(existing.account_id, Number(existing.bank_amount ?? existing.amount));
	}

	return { error: null };
}

/**
 * Get total spending for a category in the active budget period
 */
export async function getCategorySpending(categoryId: string): Promise<{
	budget: number;
	spent: number;
	remaining: number;
} | null> {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) return null;

	// Get active budget to determine the period
	const { data: activeBudget } = await supabase
		.from('monthly_budgets')
		.select('month, start_date, end_date')
		.eq('user_id', user.id)
		.eq('is_archived', false)
		.single();

	if (!activeBudget) return null;

	// Get category's allocated amount
	const { data: categoryBudget } = await supabase
		.from('category_budgets')
		.select('amount')
		.eq('category_id', categoryId)
		.eq('month', activeBudget.month)
		.single();

	const budget = categoryBudget?.amount || 0;

	// Calculate date range for the active period
	const startDate = activeBudget.start_date;
	const endDate = activeBudget.end_date;

	// Get sum of expenses for this category
	let query = supabase
		.from('expenses')
		.select('amount')
		.eq('user_id', user.id)
		.eq('category_id', categoryId)
		.gte('date', startDate);

	if (endDate) {
		query = query.lte('date', endDate);
	}

	const { data: expenses } = await query;

	const spent = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

	return {
		budget,
		spent,
		remaining: budget - spent
	};
}

/**
 * Get total spending for all categories in the active budget period
 */
export async function getAllCategoriesSpending(): Promise<
	Map<string, { budget: number; spent: number }>
> {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) return new Map();

	// Get active budget
	const { data: activeBudget } = await supabase
		.from('monthly_budgets')
		.select('month, start_date, end_date')
		.eq('user_id', user.id)
		.eq('is_archived', false)
		.single();

	if (!activeBudget) return new Map();

	// Get all category budgets for this month
	const { data: categoryBudgets } = await supabase
		.from('category_budgets')
		.select(
			`
            category_id,
            amount,
            category:budget_categories!inner(user_id)
        `
		)
		.eq('month', activeBudget.month)
		.eq('budget_categories.user_id', user.id);

	// Calculate date range for active period
	const startDate = activeBudget.start_date;
	const endDate = activeBudget.end_date;

	// Get all expenses for this period
	let query = supabase
		.from('expenses')
		.select('category_id, amount')
		.eq('user_id', user.id)
		.gte('date', startDate);

	if (endDate) {
		query = query.lte('date', endDate);
	}

	const { data: expenses } = await query;

	// Build spending map
	const result = new Map<string, { budget: number; spent: number }>();

	categoryBudgets?.forEach((cb) => {
		result.set(cb.category_id, {
			budget: Number(cb.amount),
			spent: 0
		});
	});

	expenses?.forEach((e) => {
		if (e.category_id && result.has(e.category_id)) {
			const current = result.get(e.category_id)!;
			current.spent += Number(e.amount);
		}
	});

	return result;
}

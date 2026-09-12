import { supabase } from '$lib/supabase';
import type { CategoryWithSpending } from '$lib/types/database';

/**
 * Get all categories with their spending for the active budget period
 */
export async function getCategoriesWithSpending(): Promise<CategoryWithSpending[]> {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) return [];

	// Get active budget with period dates
	const { data: activeBudget } = await supabase
		.from('monthly_budgets')
		.select('id, month, start_date, end_date')
		.eq('user_id', user.id)
		.eq('is_archived', false)
		.single();

	if (!activeBudget) return [];

	// Get all categories with their budget allocations for this month
	const { data: categories } = await supabase
		.from('budget_categories')
		.select(
			`
			id,
			name,
			color,
			type,
			sort_order,
			category_budgets(amount, month)
		`
		)
		.eq('user_id', user.id)
		.eq('category_budgets.month', activeBudget.month)
		.order('sort_order', { ascending: true });

	if (!categories) return [];

	// Use the budget's actual period dates
	const startDate = activeBudget.start_date;
	const endDate = activeBudget.end_date;

	// Get all expenses for this period
	let expenseQuery = supabase
		.from('expenses')
		.select('category_id, amount')
		.eq('user_id', user.id)
		.gte('date', startDate);

	if (endDate) {
		expenseQuery = expenseQuery.lte('date', endDate);
	}

	const { data: expenses } = await expenseQuery;

	// Calculate spending per category
	const spendingByCategory = (expenses || []).reduce(
		(acc, expense) => {
			if (expense.category_id) {
				acc[expense.category_id] = (acc[expense.category_id] || 0) + Number(expense.amount);
			}
			return acc;
		},
		{} as Record<string, number>
	);

	// Build result
	return categories.map((cat) => {
		const budgetEntry = Array.isArray(cat.category_budgets)
			? cat.category_budgets[0]
			: cat.category_budgets;

		return {
			id: cat.id,
			name: cat.name,
			color: cat.color,
			type: (cat as { type?: 'fixed' | 'variable' }).type ?? 'variable',
			allocated_amount: budgetEntry?.amount || 0,
			spent: spendingByCategory[cat.id] || 0
		};
	});
}

/**
 * Get total income and spending for the active budget
 */
export async function getActiveBudgetSummary(): Promise<{
	income: number;
	totalAllocated: number;
	totalSpent: number;
	remaining: number;
} | null> {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) return null;

	// Get active budget with period dates
	const { data: activeBudget } = await supabase
		.from('monthly_budgets')
		.select('id, month, income, start_date, end_date')
		.eq('user_id', user.id)
		.eq('is_archived', false)
		.single();

	if (!activeBudget) return null;

	// Get total allocated
	const { data: allocations } = await supabase
		.from('category_budgets')
		.select(
			`
			amount,
			category:budget_categories!inner(user_id)
		`
		)
		.eq('month', activeBudget.month)
		.eq('budget_categories.user_id', user.id);

	const totalAllocated = allocations?.reduce((sum, a) => sum + Number(a.amount), 0) || 0;

	// Use the budget's actual period dates
	const startDate = activeBudget.start_date;
	const endDate = activeBudget.end_date;

	// Get total spent
	let expenseQuery = supabase
		.from('expenses')
		.select('amount')
		.eq('user_id', user.id)
		.gte('date', startDate);

	if (endDate) {
		expenseQuery = expenseQuery.lte('date', endDate);
	}

	const { data: expenses } = await expenseQuery;

	const totalSpent = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

	return {
		income: Number(activeBudget.income),
		totalAllocated,
		totalSpent,
		remaining: totalAllocated - totalSpent
	};
}

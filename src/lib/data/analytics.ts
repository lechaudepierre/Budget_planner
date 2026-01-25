import { supabase } from '$lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';
import { getMonthlyBudget, getCategoryBudgets, getCategories } from './budgets';
import { getTotalIncome } from './income';
import { getSavingsAllocations } from './savings-allocations';

// ============================================
// TYPES
// ============================================

export interface MonthlyRecap {
	income: number;
	totalSpent: number;
	totalSaved: number;
	balance: number;
	isArchived: boolean;
}

export interface CategoryComparison {
	categoryId: string;
	name: string;
	color: string;
	budget: number;
	spent: number;
	difference: number;
	percentage: number;
}

export interface ComparisonTotals {
	totalBudget: number;
	totalSpent: number;
	totalDifference: number;
}

export interface ComparisonResult {
	categories: CategoryComparison[];
	totals: ComparisonTotals;
}

export interface DataResponse<T> {
	data: T | null;
	error: string | null;
}

// ============================================
// MONTHLY RECAP FUNCTIONS
// ============================================

/**
 * Get monthly recap data for a specific month
 * Aggregates income, expenses, savings, and calculates balance
 */
export async function getMonthlyRecap(month: string): Promise<DataResponse<MonthlyRecap>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	try {
		// Get income for the month
		const income = await getTotalIncome(month);

		// Get total expenses for the month
		const { data: expenses, error: expensesError } = await getMonthlyExpenses(month);
		if (expensesError) {
			return { data: null, error: expensesError };
		}
		const totalSpent = expenses ?? 0;

		// Get savings allocations (transferred amount = actual savings)
		const { data: allocations, error: savingsError } = await getSavingsAllocations(month);
		if (savingsError) {
			return { data: null, error: savingsError };
		}
		const totalSaved = allocations?.reduce((sum, a) => sum + (a.transferred_amount || 0), 0) ?? 0;

		// Get budget to check if archived
		const { data: budget } = await getMonthlyBudget(month);
		const isArchived = budget?.is_archived ?? false;

		// Calculate balance (what's left after spending and saving)
		const balance = income - totalSpent - totalSaved;

		return {
			data: {
				income,
				totalSpent,
				totalSaved,
				balance,
				isArchived
			},
			error: null
		};
	} catch (err) {
		console.error('Error getting monthly recap:', err);
		return { data: null, error: 'Erreur lors du chargement du bilan' };
	}
}

/**
 * Get total expenses for a specific month
 */
async function getMonthlyExpenses(month: string): Promise<DataResponse<number>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	// Calculate date range for the month
	const [year, monthNum] = month.split('-').map(Number);
	const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;

	// Get last day of month
	const lastDay = new Date(year, monthNum, 0).getDate();
	const endDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

	const { data, error } = await supabase
		.from('expenses')
		.select('amount')
		.eq('user_id', userData.user.id)
		.gte('date', startDate)
		.lte('date', endDate);

	if (error) {
		console.error('Error fetching monthly expenses:', error);
		return { data: null, error: error.message };
	}

	const total = data?.reduce((sum, expense) => sum + Number(expense.amount), 0) ?? 0;
	return { data: total, error: null };
}

// ============================================
// CATEGORY COMPARISON FUNCTIONS
// ============================================

/**
 * Get category comparison data for a specific month
 * Compares budget vs actual spending per category
 */
export async function getCategoryComparison(month: string): Promise<DataResponse<ComparisonResult>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	try {
		// Get all categories
		const { data: categories, error: catError } = await getCategories();
		if (catError) {
			return { data: null, error: catError.message };
		}

		// Get category budgets for this month
		const { data: budgets, error: budgetError } = await getCategoryBudgets(month);
		if (budgetError) {
			return { data: null, error: budgetError.message };
		}

		// Get spending per category for this month
		const { data: spending, error: spendingError } = await getCategorySpendingForMonth(month);
		if (spendingError) {
			return { data: null, error: spendingError };
		}

		// Build comparison data
		const budgetMap = new Map(budgets.map(b => [b.category_id, Number(b.amount)]));
		const spendingMap = spending ?? new Map<string, number>();

		const comparisons: CategoryComparison[] = categories.map(category => {
			const budget = budgetMap.get(category.id) ?? 0;
			const spent = spendingMap.get(category.id) ?? 0;
			const difference = spent - budget;
			const percentage = budget > 0 ? (spent / budget) * 100 : (spent > 0 ? 100 : 0);

			return {
				categoryId: category.id,
				name: category.name,
				color: category.color,
				budget,
				spent,
				difference,
				percentage
			};
		});

		// Filter out categories with no budget and no spending
		const activeComparisons = comparisons.filter(c => c.budget > 0 || c.spent > 0);

		// Calculate totals
		const totals: ComparisonTotals = {
			totalBudget: activeComparisons.reduce((sum, c) => sum + c.budget, 0),
			totalSpent: activeComparisons.reduce((sum, c) => sum + c.spent, 0),
			totalDifference: activeComparisons.reduce((sum, c) => sum + c.difference, 0)
		};

		return {
			data: {
				categories: activeComparisons,
				totals
			},
			error: null
		};
	} catch (err) {
		console.error('Error getting category comparison:', err);
		return { data: null, error: 'Erreur lors du chargement de la comparaison' };
	}
}

/**
 * Get spending per category for a specific month
 */
async function getCategorySpendingForMonth(month: string): Promise<DataResponse<Map<string, number>>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	// Calculate date range for the month
	const [year, monthNum] = month.split('-').map(Number);
	const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
	const lastDay = new Date(year, monthNum, 0).getDate();
	const endDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

	const { data, error } = await supabase
		.from('expenses')
		.select('category_id, amount')
		.eq('user_id', userData.user.id)
		.gte('date', startDate)
		.lte('date', endDate);

	if (error) {
		console.error('Error fetching category spending:', error);
		return { data: null, error: error.message };
	}

	// Aggregate by category
	const spendingMap = new Map<string, number>();
	data?.forEach(expense => {
		const current = spendingMap.get(expense.category_id) ?? 0;
		spendingMap.set(expense.category_id, current + Number(expense.amount));
	});

	return { data: spendingMap, error: null };
}

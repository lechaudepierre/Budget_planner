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
	startDate: string;
	endDate: string | null;
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

// Savings progress types
export interface SavingsGoalProgress {
	id: string;
	name: string;
	targetAmount: number;
	currentAmount: number;
	allocatedThisMonth: number;
	transferredThisMonth: number;
	progressPercent: number;
}

export interface SavingsAccountProgress {
	id: string;
	name: string;
	allocatedThisMonth: number;
	transferredThisMonth: number;
}

export interface SavingsProgressResult {
	goals: SavingsGoalProgress[];
	accounts: SavingsAccountProgress[];
	totalAllocated: number;
	totalTransferred: number;
	hasPending: boolean; // At least one allocation NOT finalized
	allFinalized: boolean; // All allocations are finalized
}

// Previous month comparison types
export interface PreviousMonthData {
	budget: number;
	spent: number;
	difference: number; // spent - budget (positive = over budget)
}

export type PreviousMonthComparison = Map<string, PreviousMonthData>; // categoryId -> data

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

		// Get savings allocations (allocated amount = planned savings for the month)
		const { data: allocations, error: savingsError } = await getSavingsAllocations(month);
		if (savingsError) {
			return { data: null, error: savingsError };
		}
		// Use allocated_amount as savings - user manages actual transfers manually at month end
		const totalSaved = allocations?.reduce((sum, a) => sum + (a.allocated_amount || 0), 0) ?? 0;

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
				isArchived,
				startDate: budget?.start_date || `${month}-01`,
				endDate: isArchived ? (budget?.end_date || null) : null
			},
			error: null
		};
	} catch (err) {
		console.error('Error getting monthly recap:', err);
		return { data: null, error: 'Erreur lors du chargement du bilan' };
	}
}

/**
 * Get total expenses for a specific period defined by a budget
 */
async function getMonthlyExpenses(month: string): Promise<DataResponse<number>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	// Get the budget to find the period dates
	const { data: budget } = await getMonthlyBudget(month);
	if (!budget) {
		return { data: 0, error: null };
	}

	const startDate = budget.start_date;
	const endDate = budget.end_date;

	let query = supabase
		.from('expenses')
		.select('amount')
		.eq('user_id', userData.user.id)
		.gte('date', startDate);

	if (endDate) {
		query = query.lte('date', endDate);
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching period expenses:', error);
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
 * Get spending per category for a specific period
 */
async function getCategorySpendingForMonth(month: string): Promise<DataResponse<Map<string, number>>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	// Get the budget to find the period dates
	const { data: budget } = await getMonthlyBudget(month);
	if (!budget) {
		return { data: new Map(), error: null };
	}

	const startDate = budget.start_date;
	const endDate = budget.end_date;

	let query = supabase
		.from('expenses')
		.select('category_id, amount')
		.eq('user_id', userData.user.id)
		.gte('date', startDate);

	if (endDate) {
		query = query.lte('date', endDate);
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching category spending:', error);
		return { data: null, error: error.message };
	}

	// Aggregate by category
	const spendingMap = new Map<string, number>();
	data?.forEach(expense => {
		if (expense.category_id) {
			const current = spendingMap.get(expense.category_id) ?? 0;
			spendingMap.set(expense.category_id, current + Number(expense.amount));
		}
	});

	return { data: spendingMap, error: null };
}

// ============================================
// SAVINGS PROGRESS FUNCTIONS
// ============================================

/**
 * Get savings progress for a specific month
 * Aggregates allocations by goals and accounts
 */
export async function getSavingsProgress(month: string): Promise<DataResponse<SavingsProgressResult>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	try {
		// Get savings allocations for this month
		const { data: allocations, error: allocError } = await getSavingsAllocations(month);
		if (allocError) {
			return { data: null, error: allocError };
		}

		// Separate goals and accounts
		const goals: SavingsGoalProgress[] = [];
		const accounts: SavingsAccountProgress[] = [];
		let totalAllocated = 0;
		let totalTransferred = 0;
		let hasPending = false;

		allocations?.forEach((allocation) => {
			const allocatedThisMonth = Number(allocation.allocated_amount) || 0;
			const transferredThisMonth = Number(allocation.transferred_amount) || 0;
			// @ts-ignore
			const isFinalized = allocation.is_finalized || false;

			if (allocatedThisMonth > 0 && !isFinalized) {
				hasPending = true;
			}

			totalAllocated += allocatedThisMonth;
			totalTransferred += transferredThisMonth;

			if (allocation.goal && allocation.goal_id) {
				const targetAmount = Number(allocation.goal.target_amount) || 0;
				const currentAmount = Number(allocation.goal.current_amount) || 0;
				// Include allocation in progress - user manages transfers manually at month end
				const totalProgress = currentAmount + allocatedThisMonth;
				const progressPercent = targetAmount > 0 ? (totalProgress / targetAmount) * 100 : 0;

				goals.push({
					id: allocation.goal_id,
					name: allocation.goal.name,
					targetAmount,
					currentAmount,
					allocatedThisMonth,
					transferredThisMonth,
					progressPercent
				});
			} else if (allocation.account && allocation.account_id) {
				accounts.push({
					id: allocation.account_id,
					name: allocation.account.name,
					allocatedThisMonth,
					transferredThisMonth
				});
			}
		});

		return {
			data: {
				goals,
				accounts,
				totalAllocated,
				totalTransferred,
				hasPending,
				allFinalized: !hasPending && (totalAllocated > 0)
			},
			error: null
		};
	} catch (err) {
		console.error('Error getting savings progress:', err);
		return { data: null, error: "Erreur lors du chargement de l'épargne" };
	}
}

// ============================================
// PREVIOUS MONTH COMPARISON FUNCTIONS
// ============================================

/**
 * Calculate previous month from current month string
 */
function getPreviousMonth(month: string): string {
	const [year, monthNum] = month.split('-').map(Number);
	const prevMonth = monthNum === 1 ? 12 : monthNum - 1;
	const prevYear = monthNum === 1 ? year - 1 : year;
	return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
}

/**
 * Get previous month's budget vs actual comparison for all categories
 * Used to show hints in budget allocation page
 */
export async function getPreviousMonthComparison(
	currentMonth: string
): Promise<DataResponse<PreviousMonthComparison>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	try {
		const previousMonth = getPreviousMonth(currentMonth);

		// Get budget allocations for previous month
		const { data: categoryBudgets, error: budgetError } = await getCategoryBudgets(previousMonth);
		if (budgetError) {
			// No previous month data is not an error - just return empty
			return { data: new Map(), error: null };
		}

		// Get spending for previous month
		const { data: spendingMap, error: spendingError } =
			await getCategorySpendingForMonth(previousMonth);
		if (spendingError) {
			return { data: new Map(), error: null };
		}

		// Build comparison map
		const comparisonMap: PreviousMonthComparison = new Map();

		categoryBudgets?.forEach((cb) => {
			const budget = cb.amount || 0;
			const spent = spendingMap?.get(cb.category_id) ?? 0;
			const difference = spent - budget;

			comparisonMap.set(cb.category_id, {
				budget,
				spent,
				difference
			});
		});

		return { data: comparisonMap, error: null };
	} catch (err) {
		console.error('Error getting previous month comparison:', err);
		return { data: new Map(), error: null };
	}
}

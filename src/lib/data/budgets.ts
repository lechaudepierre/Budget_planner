import { supabase } from '$lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';

type MonthlyBudget = Database['public']['Tables']['monthly_budgets']['Row'];
type MonthlyBudgetInsert = Database['public']['Tables']['monthly_budgets']['Insert'];
type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];
type BudgetCategoryInsert = Database['public']['Tables']['budget_categories']['Insert'];
type CategoryBudget = Database['public']['Tables']['category_budgets']['Row'];
type CategoryBudgetInsert = Database['public']['Tables']['category_budgets']['Insert'];

// Budget history types
export interface BudgetHistoryCategory {
	name: string;
	color: string;
	amount: number;
}

export interface BudgetHistoryMonth {
	month: string;
	income: number;
	totalAllocated: number;
	categories: BudgetHistoryCategory[];
}

// ============================================
// MONTHLY BUDGET FUNCTIONS
// ============================================

/**
 * Get the active (non-archived) budget for current user
 */
export async function getActiveBudget(): Promise<{
	data: MonthlyBudget | null;
	error: PostgrestError | null;
}> {
	const { data, error } = await supabase
		.from('monthly_budgets')
		.select('*')
		.eq('is_archived', false)
		.maybeSingle();

	return { data, error };
}

/**
 * Get monthly budget for a specific month (legacy, kept for compatibility)
 */
export async function getMonthlyBudget(month: string): Promise<{
	data: MonthlyBudget | null;
	error: PostgrestError | null;
}> {
	const { data, error } = await supabase
		.from('monthly_budgets')
		.select('*')
		.eq('month', month)
		.maybeSingle();

	return { data, error };
}

/**
 * Get the last archived budget for pre-fill
 */
export async function getLastArchivedBudget(): Promise<{
	data: MonthlyBudget | null;
	error: PostgrestError | null;
}> {
	const { data, error } = await supabase
		.from('monthly_budgets')
		.select('*')
		.eq('is_archived', true)
		.order('archived_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	return { data, error };
}

/**
 * Get previous month's budget for pre-fill (legacy)
 */
export async function getPreviousMonthBudget(currentMonth: string): Promise<{
	data: MonthlyBudget | null;
	error: PostgrestError | null;
}> {
	// Calculate previous month
	const [year, monthNum] = currentMonth.split('-').map(Number);
	let prevYear = year;
	let prevMonth = monthNum - 1;

	if (prevMonth === 0) {
		prevMonth = 12;
		prevYear = year - 1;
	}

	const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

	return getMonthlyBudget(prevMonthStr);
}

/**
 * Create or update monthly budget (upsert)
 */
export async function saveMonthlyBudget(
	month: string,
	income: number,
	start_date?: string
): Promise<{
	data: MonthlyBudget | null;
	error: PostgrestError | null;
}> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: { message: 'Non authentifié', details: '', hint: '', code: 'AUTH_ERROR' } as PostgrestError };
	}

	const budgetData: MonthlyBudgetInsert = {
		user_id: userData.user.id,
		month,
		income,
		start_date: start_date || `${month}-01`
	};

	const { data, error } = await supabase
		.from('monthly_budgets')
		.upsert(budgetData, {
			onConflict: 'user_id,month'
		})
		.select()
		.single();

	return { data, error };
}

/**
 * Delete monthly budget
 */
export async function deleteMonthlyBudget(id: string): Promise<{
	success: boolean;
	error: PostgrestError | null;
}> {
	const { error } = await supabase.from('monthly_budgets').delete().eq('id', id);

	return { success: !error, error };
}

/**
 * Archive current budget and start a new period
 * - Archives the current active budget
 * - Creates a new budget for the next period
 * - Sets the end date of the previous period
 * - newStartDate defaults to today
 */
export async function archiveBudgetAndStartNew(newStartDate?: string): Promise<{
	data: MonthlyBudget | null;
	error: PostgrestError | null;
}> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: { message: 'Non authentifié', details: '', hint: '', code: 'AUTH_ERROR' } as PostgrestError };
	}

	// Get active budget
	const { data: activeBudget } = await getActiveBudget();

	if (!activeBudget) {
		return { data: null, error: { message: 'Aucun budget actif à archiver', details: '', hint: '', code: 'NO_ACTIVE_BUDGET' } as PostgrestError };
	}

	const today = new Date().toISOString().split('T')[0];
	const startDateForNew = newStartDate || today;

	// Previous period ends just before the new one starts
	const newDateObj = new Date(startDateForNew);
	const endDateForOld = new Date(newDateObj.setDate(newDateObj.getDate() - 1)).toISOString().split('T')[0];

	// Archive the current budget
	const { error: archiveError } = await supabase
		.from('monthly_budgets')
		.update({
			is_archived: true,
			archived_at: new Date().toISOString(),
			end_date: endDateForOld
		})
		.eq('id', activeBudget.id);

	if (archiveError) {
		return { data: null, error: archiveError };
	}

	// Calculate next logical month based on ACTIVE budget
	const [year, monthNum] = activeBudget.month.split('-').map(Number);
	let nextYear = year;
	let nextMonth = monthNum + 1;
	if (nextMonth > 12) {
		nextMonth = 1;
		nextYear = year + 1;
	}
	const nextMonthStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;

	// Create new budget with same income (user can adjust)
	const { data: newBudget, error: createError } = await supabase
		.from('monthly_budgets')
		.insert({
			user_id: userData.user.id,
			month: nextMonthStr,
			income: activeBudget.income,
			is_archived: false,
			start_date: startDateForNew
		})
		.select()
		.single();

	if (createError) {
		return { data: null, error: createError };
	}

	return { data: newBudget, error: null };
}

/**
 * Get budget history (archived budgets)
 */
export async function getBudgetHistory(limit: number = 12): Promise<{
	data: BudgetHistoryMonth[];
	error: PostgrestError | null;
}> {
	// Get archived monthly budgets
	const { data: budgets, error: budgetsError } = await supabase
		.from('monthly_budgets')
		.select('*')
		.eq('is_archived', true)
		.order('archived_at', { ascending: false })
		.limit(limit);

	if (budgetsError || !budgets) {
		return { data: [], error: budgetsError };
	}

	// Get all category budgets for these months
	const months = budgets.map((b) => b.month);
	const { data: allocations } = await supabase
		.from('category_budgets')
		.select('*, budget_categories(name, color)')
		.in('month', months);

	// Build history data
	const historyData: BudgetHistoryMonth[] = budgets.map((budget) => {
		const monthAllocations = allocations?.filter((a) => a.month === budget.month) ?? [];
		const totalAllocated = monthAllocations.reduce((sum, a) => sum + Number(a.amount), 0);

		const categoryDetails = monthAllocations.map((a) => {
			const cat = a.budget_categories as { name: string; color: string } | null;
			return {
				name: cat?.name ?? 'Catégorie supprimée',
				color: cat?.color ?? '#9CA3AF',
				amount: Number(a.amount)
			};
		});

		return {
			month: budget.month,
			income: Number(budget.income),
			totalAllocated,
			categories: categoryDetails
		};
	});

	return { data: historyData, error: null };
}

// ============================================
// BUDGET CATEGORY FUNCTIONS
// ============================================

/**
 * Get all categories for current user
 */
export async function getCategories(): Promise<{
	data: BudgetCategory[];
	error: PostgrestError | null;
}> {
	const { data, error } = await supabase
		.from('budget_categories')
		.select('*')
		.order('sort_order', { ascending: true });

	return { data: data ?? [], error };
}

/**
 * Create a new budget category
 */
export async function createCategory(
	name: string,
	color: string
): Promise<{
	data: BudgetCategory | null;
	error: PostgrestError | null;
}> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: { message: 'Non authentifié', details: '', hint: '', code: 'AUTH_ERROR' } as PostgrestError };
	}

	// Get max sort_order for this user
	const { data: existing } = await supabase
		.from('budget_categories')
		.select('sort_order')
		.order('sort_order', { ascending: false })
		.limit(1);

	const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

	const categoryData: BudgetCategoryInsert = {
		user_id: userData.user.id,
		name,
		color,
		sort_order: nextOrder
	};

	const { data, error } = await supabase
		.from('budget_categories')
		.insert(categoryData)
		.select()
		.single();

	return { data, error };
}

/**
 * Update a budget category
 */
export async function updateCategory(
	id: string,
	updates: { name?: string; color?: string }
): Promise<{
	data: BudgetCategory | null;
	error: PostgrestError | null;
}> {
	const { data, error } = await supabase
		.from('budget_categories')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	return { data, error };
}

/**
 * Delete a budget category
 */
export async function deleteCategory(id: string): Promise<{
	success: boolean;
	error: PostgrestError | null;
}> {
	const { error } = await supabase.from('budget_categories').delete().eq('id', id);

	return { success: !error, error };
}

// ============================================
// CATEGORY BUDGET (ALLOCATION) FUNCTIONS
// ============================================

/**
 * Get all category allocations for a specific month
 */
export async function getCategoryBudgets(month: string): Promise<{
	data: CategoryBudget[];
	error: PostgrestError | null;
}> {
	const { data, error } = await supabase
		.from('category_budgets')
		.select('*')
		.eq('month', month);

	return { data: data ?? [], error };
}

/**
 * Save category allocation (upsert)
 */
export async function saveCategoryBudget(
	categoryId: string,
	month: string,
	amount: number
): Promise<{
	data: CategoryBudget | null;
	error: PostgrestError | null;
}> {
	const budgetData: CategoryBudgetInsert = {
		category_id: categoryId,
		month,
		amount
	};

	const { data, error } = await supabase
		.from('category_budgets')
		.upsert(budgetData, {
			onConflict: 'category_id,month'
		})
		.select()
		.single();

	return { data, error };
}

/**
 * Save multiple category allocations at once
 */
export async function saveAllCategoryBudgets(
	allocations: { categoryId: string; amount: number }[],
	month: string
): Promise<{
	success: boolean;
	error: PostgrestError | null;
}> {
	const budgetData: CategoryBudgetInsert[] = allocations.map((a) => ({
		category_id: a.categoryId,
		month,
		amount: a.amount
	}));

	const { error } = await supabase
		.from('category_budgets')
		.upsert(budgetData, {
			onConflict: 'category_id,month'
		});

	return { success: !error, error };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format month string for display in French
 */
export function formatMonthDisplay(month: string): string {
	const [year, monthNum] = month.split('-').map(Number);
	const date = new Date(year, monthNum - 1);

	return date.toLocaleDateString('fr-FR', {
		month: 'long',
		year: 'numeric'
	});
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Navigate to next/previous month
 */
export function navigateMonth(currentMonth: string, direction: 'prev' | 'next'): string {
	const [year, monthNum] = currentMonth.split('-').map(Number);

	let newYear = year;
	let newMonth = monthNum + (direction === 'next' ? 1 : -1);

	if (newMonth === 0) {
		newMonth = 12;
		newYear = year - 1;
	} else if (newMonth === 13) {
		newMonth = 1;
		newYear = year + 1;
	}

	return `${newYear}-${String(newMonth).padStart(2, '0')}`;
}

/**
 * Get available savings for a month (income - total category allocations)
 */
export async function getAvailableSavings(month: string): Promise<{
	data: { income: number; totalAllocated: number; available: number } | null;
	error: string | null;
}> {
	// Get budget for month
	const { data: budget, error: budgetError } = await getMonthlyBudget(month);

	if (budgetError) {
		return { data: null, error: budgetError.message };
	}

	if (!budget) {
		return { data: { income: 0, totalAllocated: 0, available: 0 }, error: null };
	}

	// Get category allocations for this month
	const { data: allocations, error: allocError } = await getCategoryBudgets(month);

	if (allocError) {
		return { data: null, error: allocError.message };
	}

	const totalAllocated = allocations.reduce((sum, a) => sum + Number(a.amount), 0);
	const available = Number(budget.income) - totalAllocated;

	return {
		data: {
			income: Number(budget.income),
			totalAllocated,
			available
		},
		error: null
	};
}

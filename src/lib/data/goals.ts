import { supabase } from '$lib/supabase';
import type {
	SavingsGoal,
	SavingsGoalInsert,
	GoalBreakdownItem,
	GoalBreakdownItemInsert,
	SavingsGoalWithBreakdown
} from '$lib/types/database';
import type { GoalFormData, BreakdownItemFormData } from '$lib/schemas/goal';

export interface DataResponse<T> {
	data: T | null;
	error: string | null;
}

/**
 * Get all savings goals for the current user
 */
export async function getGoals(): Promise<DataResponse<SavingsGoal[]>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	const { data, error } = await supabase
		.from('savings_goals')
		.select('*')
		.eq('user_id', userData.user.id)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching goals:', error);
		return { data: null, error: error.message };
	}

	return { data, error: null };
}

/**
 * Get a single goal with its breakdown items
 */
export async function getGoalWithBreakdown(
	goalId: string
): Promise<DataResponse<SavingsGoalWithBreakdown>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	// Fetch goal
	const { data: goal, error: goalError } = await supabase
		.from('savings_goals')
		.select('*')
		.eq('id', goalId)
		.eq('user_id', userData.user.id)
		.single();

	if (goalError) {
		console.error('Error fetching goal:', goalError);
		return { data: null, error: goalError.message };
	}

	// Fetch breakdown items
	const { data: breakdownItems, error: itemsError } = await supabase
		.from('goal_breakdown_items')
		.select('*')
		.eq('goal_id', goalId)
		.order('created_at', { ascending: true });

	if (itemsError) {
		console.error('Error fetching breakdown items:', itemsError);
		return { data: null, error: itemsError.message };
	}

	return {
		data: {
			...goal,
			breakdown_items: breakdownItems || []
		},
		error: null
	};
}

/**
 * Create a new savings goal
 */
export async function createGoal(
	formData: GoalFormData
): Promise<DataResponse<SavingsGoalWithBreakdown>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	// Calculate target amount from breakdown if provided
	let targetAmount = formData.target_amount;
	if (formData.breakdown_items && formData.breakdown_items.length > 0) {
		targetAmount = formData.breakdown_items.reduce((sum, item) => sum + item.amount, 0);
	}

	const goalData: SavingsGoalInsert = {
		user_id: userData.user.id,
		name: formData.name,
		target_amount: targetAmount,
		current_amount: 0,
		target_date: formData.target_date || null
	};

	const { data: goal, error: goalError } = await supabase
		.from('savings_goals')
		.insert(goalData)
		.select()
		.single();

	if (goalError) {
		console.error('Error creating goal:', goalError);
		return { data: null, error: goalError.message };
	}

	// Insert breakdown items if provided
	let breakdownItems: GoalBreakdownItem[] = [];
	if (formData.breakdown_items && formData.breakdown_items.length > 0) {
		const itemsToInsert: GoalBreakdownItemInsert[] = formData.breakdown_items.map((item) => ({
			goal_id: goal.id,
			name: item.name,
			amount: item.amount
		}));

		const { data: items, error: itemsError } = await supabase
			.from('goal_breakdown_items')
			.insert(itemsToInsert)
			.select();

		if (itemsError) {
			console.error('Error creating breakdown items:', itemsError);
			// Goal was created, but items failed - return goal anyway
		} else {
			breakdownItems = items || [];
		}
	}

	return {
		data: {
			...goal,
			breakdown_items: breakdownItems
		},
		error: null
	};
}

/**
 * Update an existing goal
 */
export async function updateGoal(
	id: string,
	formData: Partial<GoalFormData>
): Promise<DataResponse<SavingsGoalWithBreakdown>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	// Calculate target amount from breakdown if provided
	let targetAmount = formData.target_amount;
	if (formData.breakdown_items && formData.breakdown_items.length > 0) {
		targetAmount = formData.breakdown_items.reduce((sum, item) => sum + item.amount, 0);
	}

	const { data: goal, error: goalError } = await supabase
		.from('savings_goals')
		.update({
			name: formData.name,
			target_amount: targetAmount,
			target_date: formData.target_date
		})
		.eq('id', id)
		.eq('user_id', userData.user.id)
		.select()
		.single();

	if (goalError) {
		console.error('Error updating goal:', goalError);
		return { data: null, error: goalError.message };
	}

	// Handle breakdown items update
	let breakdownItems: GoalBreakdownItem[] = [];
	if (formData.breakdown_items !== undefined) {
		// Delete existing items
		await supabase.from('goal_breakdown_items').delete().eq('goal_id', id);

		// Insert new items if any
		if (formData.breakdown_items.length > 0) {
			const itemsToInsert: GoalBreakdownItemInsert[] = formData.breakdown_items.map((item) => ({
				goal_id: id,
				name: item.name,
				amount: item.amount
			}));

			const { data: items, error: itemsError } = await supabase
				.from('goal_breakdown_items')
				.insert(itemsToInsert)
				.select();

			if (!itemsError && items) {
				breakdownItems = items;
			}
		}
	}

	return {
		data: {
			...goal,
			breakdown_items: breakdownItems
		},
		error: null
	};
}

/**
 * Add savings to a goal (update current_amount)
 */
export async function addSavingsToGoal(
	goalId: string,
	amount: number
): Promise<DataResponse<SavingsGoal>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	// Get current amount
	const { data: goal, error: fetchError } = await supabase
		.from('savings_goals')
		.select('current_amount')
		.eq('id', goalId)
		.eq('user_id', userData.user.id)
		.single();

	if (fetchError) {
		console.error('Error fetching goal:', fetchError);
		return { data: null, error: fetchError.message };
	}

	const newAmount = (goal.current_amount || 0) + amount;

	const { data: updatedGoal, error: updateError } = await supabase
		.from('savings_goals')
		.update({ current_amount: newAmount })
		.eq('id', goalId)
		.eq('user_id', userData.user.id)
		.select()
		.single();

	if (updateError) {
		console.error('Error updating goal:', updateError);
		return { data: null, error: updateError.message };
	}

	return { data: updatedGoal, error: null };
}

/**
 * Delete a savings goal
 */
export async function deleteGoal(id: string): Promise<DataResponse<null>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	// Breakdown items will be cascade deleted by the database
	const { error } = await supabase
		.from('savings_goals')
		.delete()
		.eq('id', id)
		.eq('user_id', userData.user.id);

	if (error) {
		console.error('Error deleting goal:', error);
		return { data: null, error: error.message };
	}

	return { data: null, error: null };
}

/**
 * Get the primary goal (most recently updated with target date, or most recently created)
 */
export async function getPrimaryGoal(): Promise<DataResponse<SavingsGoal | null>> {
	const { data: userData } = await supabase.auth.getUser();

	if (!userData.user) {
		return { data: null, error: 'Non authentifié' };
	}

	// First try to get the goal with nearest target date
	const { data: goalWithDate, error: dateError } = await supabase
		.from('savings_goals')
		.select('*')
		.eq('user_id', userData.user.id)
		.not('target_date', 'is', null)
		.order('target_date', { ascending: true })
		.limit(1)
		.maybeSingle();

	if (!dateError && goalWithDate) {
		return { data: goalWithDate, error: null };
	}

	// Fallback to most recently updated goal
	const { data: recentGoal, error: recentError } = await supabase
		.from('savings_goals')
		.select('*')
		.eq('user_id', userData.user.id)
		.order('updated_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	if (recentError) {
		console.error('Error fetching primary goal:', recentError);
		return { data: null, error: recentError.message };
	}

	return { data: recentGoal, error: null };
}

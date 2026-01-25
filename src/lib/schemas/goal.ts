import { z } from 'zod';

/**
 * Schema for a breakdown item
 */
export const breakdownItemSchema = z.object({
	id: z.string().uuid().optional(),
	name: z
		.string()
		.min(1, 'Le nom est requis')
		.max(100, 'Le nom ne peut pas dépasser 100 caractères')
		.transform((val) => val.trim()),
	amount: z
		.number()
		.min(0, 'Le montant doit être positif')
		.finite('Le montant doit être un nombre valide')
});

export type BreakdownItemFormData = z.infer<typeof breakdownItemSchema>;

/**
 * Schema for creating/editing a savings goal
 */
export const goalSchema = z.object({
	name: z
		.string()
		.min(1, "Le nom de l'objectif est requis")
		.max(100, 'Le nom ne peut pas dépasser 100 caractères')
		.transform((val) => val.trim()),
	target_amount: z
		.number()
		.min(0.01, 'Le montant cible doit être supérieur à 0')
		.finite('Le montant doit être un nombre valide'),
	target_date: z.string().nullable().optional(),
	breakdown_items: z.array(breakdownItemSchema).optional()
});

export type GoalFormData = z.infer<typeof goalSchema>;

/**
 * Schema for adding savings to a goal
 */
export const addSavingsSchema = z.object({
	amount: z
		.number()
		.min(0.01, 'Le montant doit être supérieur à 0')
		.finite('Le montant doit être un nombre valide')
});

export type AddSavingsFormData = z.infer<typeof addSavingsSchema>;

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, target: number): number {
	if (target <= 0) return 0;
	return Math.round((current / target) * 100);
}

/**
 * Calculate monthly amount needed to reach goal by target date
 */
export function calculateMonthlyNeeded(
	currentAmount: number,
	targetAmount: number,
	targetDate: string | null
): number | null {
	if (!targetDate) return null;

	const now = new Date();
	const target = new Date(targetDate);
	const remaining = targetAmount - currentAmount;

	if (remaining <= 0) return 0;

	// Calculate months remaining
	const monthsDiff =
		(target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());

	if (monthsDiff <= 0) return null; // Target date passed

	return Math.ceil(remaining / monthsDiff);
}

/**
 * Calculate months remaining until target date
 */
export function calculateMonthsRemaining(targetDate: string | null): number | null {
	if (!targetDate) return null;

	const now = new Date();
	const target = new Date(targetDate);

	const monthsDiff =
		(target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());

	return monthsDiff;
}

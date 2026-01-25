import { z } from 'zod';

/**
 * Schema for monthly income/budget form validation
 */
export const monthlyBudgetSchema = z.object({
	month: z.string().regex(/^\d{4}-\d{2}$/, 'Format de mois invalide (YYYY-MM)'),
	income: z.number().min(0, 'Le revenu doit être positif').finite()
});

export type MonthlyBudgetFormData = z.infer<typeof monthlyBudgetSchema>;

/**
 * Predefined color palette for budget categories
 */
export const CATEGORY_COLORS = [
	{ value: '#639A88', label: 'Sauge' },
	{ value: '#5AAA8C', label: 'Eucalyptus' },
	{ value: '#4A90A4', label: 'Océan' },
	{ value: '#6B8E9F', label: 'Ardoise' },
	{ value: '#C07D5A', label: 'Terracotta' },
	{ value: '#D4A04D', label: 'Ambre' },
	{ value: '#B8860B', label: 'Or' },
	{ value: '#9B7CB8', label: 'Lavande' },
	{ value: '#E8A0A0', label: 'Rose' },
	{ value: '#8FBC8F', label: 'Menthe' }
] as const;

/**
 * Category type options
 */
export const CATEGORY_TYPES = [
	{ value: 'fixed' as const, label: 'Coût fixe', description: 'Dépenses récurrentes et incompressibles (loyer, assurances, abonnements...)' },
	{ value: 'variable' as const, label: 'Coût variable', description: 'Enveloppe budgétaire ajustable selon vos besoins' }
] as const;

/**
 * Schema for budget category form validation
 */
export const categorySchema = z.object({
	name: z
		.string()
		.min(1, 'Le nom est requis')
		.max(50, 'Maximum 50 caractères')
		.transform((val) => val.trim()),
	color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide'),
	type: z.enum(['fixed', 'variable']).default('variable')
});

export type CategoryFormData = z.infer<typeof categorySchema>;

/**
 * Validate category form data
 */
export function validateCategory(data: unknown): {
	success: boolean;
	data?: CategoryFormData;
	errors?: Record<string, string>;
} {
	const result = categorySchema.safeParse(data);

	if (result.success) {
		return { success: true, data: result.data };
	}

	const errors: Record<string, string> = {};
	for (const issue of result.error.issues) {
		const path = issue.path[0];
		if (path) {
			errors[path.toString()] = issue.message;
		}
	}

	return { success: false, errors };
}

/**
 * Validate monthly budget form data
 */
export function validateMonthlyBudget(data: unknown): {
	success: boolean;
	data?: MonthlyBudgetFormData;
	errors?: Record<string, string>;
} {
	const result = monthlyBudgetSchema.safeParse(data);

	if (result.success) {
		return { success: true, data: result.data };
	}

	const errors: Record<string, string> = {};
	for (const issue of result.error.issues) {
		const path = issue.path[0];
		if (path) {
			errors[path.toString()] = issue.message;
		}
	}

	return { success: false, errors };
}

import { z } from 'zod';

/**
 * Schema for expense form validation
 */
export const expenseSchema = z.object({
	category_id: z.string().uuid('Veuillez sélectionner une catégorie'),
	account_id: z.string().uuid('Veuillez sélectionner un compte').optional().nullable(),
	amount: z
		.number({ message: 'Le montant est requis' })
		.positive('Le montant doit être positif')
		.max(999999.99, 'Le montant est trop élevé'),
	description: z.string().max(200, 'Description trop longue (max 200 caractères)').optional().nullable(),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide')
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

/**
 * Validate expense form data
 */
export function validateExpense(data: unknown): {
	success: boolean;
	data?: ExpenseFormData;
	errors?: Record<string, string>;
} {
	const result = expenseSchema.safeParse(data);

	if (result.success) {
		return { success: true, data: result.data };
	}

	const errors: Record<string, string> = {};
	result.error.issues.forEach((issue) => {
		const path = issue.path[0] as string;
		errors[path] = issue.message;
	});

	return { success: false, errors };
}

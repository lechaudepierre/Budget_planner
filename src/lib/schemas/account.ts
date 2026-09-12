import { z } from 'zod';

/**
 * Schema for creating/editing an account
 */
export const accountSchema = z.object({
	name: z
		.string()
		.min(1, 'Le nom du compte est requis')
		.max(100, 'Le nom ne peut pas dépasser 100 caractères')
		.transform((val) => val.trim()),
	balance: z
		.number()
		.finite('Le solde doit être un nombre valide'),
	account_type: z.string().optional().nullable(),
	iban: z
		.string()
		.transform((val) => val.replace(/\s+/g, '').toUpperCase())
		.refine((val) => val === '' || /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(val), 'IBAN invalide')
		.optional()
		.nullable()
});

export type AccountFormData = z.infer<typeof accountSchema>;

/**
 * Available account types
 */
export const accountTypes = [
	{ value: 'checking', label: 'Compte courant' },
	{ value: 'savings', label: 'Compte épargne' },
	{ value: 'investment', label: 'Investissement' },
	{ value: 'cash', label: 'Espèces' },
	{ value: 'other', label: 'Autre' }
] as const;

export type AccountType = (typeof accountTypes)[number]['value'];

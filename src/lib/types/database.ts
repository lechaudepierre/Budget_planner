export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Enum-like string unions used by the import pipeline
export type ImportSource = 'bnp' | 'revolut';
export type ExpenseSource = 'manual' | ImportSource;
export type AccountBalanceSource = 'manual' | 'import';
export type TransactionKind = 'expense' | 'income' | 'transfer' | 'reimbursement' | 'ignored';
export type TransactionStatus = 'confirmed' | 'pending';
export type RuleMatchType = 'merchant' | 'iban' | 'contains';

export interface Database {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'profiles_id_fkey';
						columns: ['id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			accounts: {
				Row: {
					id: string;
					user_id: string;
					name: string;
					balance: number;
					account_type: string | null;
					iban: string | null;
					balance_source: AccountBalanceSource;
					last_import_at: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					balance?: number;
					account_type?: string | null;
					iban?: string | null;
					balance_source?: AccountBalanceSource;
					last_import_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					name?: string;
					balance?: number;
					account_type?: string | null;
					iban?: string | null;
					balance_source?: AccountBalanceSource;
					last_import_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'accounts_user_id_fkey';
						columns: ['user_id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			monthly_budgets: {
				Row: {
					id: string;
					user_id: string;
					month: string; // Format: "2026-01"
					income: number;
					is_archived: boolean;
					archived_at: string | null;
					start_date: string;
					end_date: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					month: string;
					income?: number;
					is_archived?: boolean;
					archived_at?: string | null;
					start_date: string;
					end_date?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					month?: string;
					income?: number;
					is_archived?: boolean;
					archived_at?: string | null;
					start_date?: string;
					end_date?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'monthly_budgets_user_id_fkey';
						columns: ['user_id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			budget_categories: {
				Row: {
					id: string;
					user_id: string;
					name: string;
					color: string;
					type: 'fixed' | 'variable';
					sort_order: number;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					color?: string;
					type?: 'fixed' | 'variable';
					sort_order?: number;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					name?: string;
					color?: string;
					type?: 'fixed' | 'variable';
					sort_order?: number;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'budget_categories_user_id_fkey';
						columns: ['user_id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			category_budgets: {
				Row: {
					id: string;
					category_id: string;
					month: string;
					amount: number;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					category_id: string;
					month: string;
					amount?: number;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					category_id?: string;
					month?: string;
					amount?: number;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'category_budgets_category_id_fkey';
						columns: ['category_id'];
						referencedRelation: 'budget_categories';
						referencedColumns: ['id'];
					}
				];
			};
			expenses: {
				Row: {
					id: string;
					user_id: string;
					category_id: string | null;
					account_id: string | null;
					amount: number;
					bank_amount: number | null;
					source: ExpenseSource;
					merchant: string | null;
					is_pending: boolean;
					description: string | null;
					date: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					category_id?: string | null;
					account_id?: string | null;
					amount: number;
					bank_amount?: number | null;
					source?: ExpenseSource;
					merchant?: string | null;
					is_pending?: boolean;
					description?: string | null;
					date: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					category_id?: string | null;
					account_id?: string | null;
					amount?: number;
					bank_amount?: number | null;
					source?: ExpenseSource;
					merchant?: string | null;
					is_pending?: boolean;
					description?: string | null;
					date?: string;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'expenses_user_id_fkey';
						columns: ['user_id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'expenses_category_id_fkey';
						columns: ['category_id'];
						referencedRelation: 'budget_categories';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'expenses_account_id_fkey';
						columns: ['account_id'];
						referencedRelation: 'accounts';
						referencedColumns: ['id'];
					}
				];
			};
			income_entries: {
				Row: {
					id: string;
					user_id: string;
					month: string; // Format: YYYY-MM
					type: string; // salaire, prime, don, étrennes, freelance, etc.
					label: string | null;
					amount: number;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					month: string;
					type: string;
					label?: string | null;
					amount: number;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					month?: string;
					type?: string;
					label?: string | null;
					amount?: number;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'income_entries_user_id_fkey';
						columns: ['user_id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			savings_goals: {
				Row: {
					id: string;
					user_id: string;
					name: string;
					target_amount: number;
					current_amount: number;
					target_date: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					target_amount: number;
					current_amount?: number;
					target_date?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					name?: string;
					target_amount?: number;
					current_amount?: number;
					target_date?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'savings_goals_user_id_fkey';
						columns: ['user_id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			goal_breakdown_items: {
				Row: {
					id: string;
					goal_id: string;
					name: string;
					amount: number;
					created_at: string;
				};
				Insert: {
					id?: string;
					goal_id: string;
					name: string;
					amount: number;
					created_at?: string;
				};
				Update: {
					id?: string;
					goal_id?: string;
					name?: string;
					amount?: number;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'goal_breakdown_items_goal_id_fkey';
						columns: ['goal_id'];
						referencedRelation: 'savings_goals';
						referencedColumns: ['id'];
					}
				];
			};
			monthly_savings_allocations: {
				Row: {
					id: string;
					user_id: string;
					month: string;
					goal_id: string | null;
					account_id: string | null;
					allocated_amount: number;
					transferred_amount: number;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					month: string;
					goal_id?: string | null;
					account_id?: string | null;
					allocated_amount?: number;
					transferred_amount?: number;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					month?: string;
					goal_id?: string | null;
					account_id?: string | null;
					allocated_amount?: number;
					transferred_amount?: number;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'monthly_savings_allocations_user_id_fkey';
						columns: ['user_id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'monthly_savings_allocations_goal_id_fkey';
						columns: ['goal_id'];
						referencedRelation: 'savings_goals';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'monthly_savings_allocations_account_id_fkey';
						columns: ['account_id'];
						referencedRelation: 'accounts';
						referencedColumns: ['id'];
					}
				];
			};
			imports: {
				Row: {
					id: string;
					user_id: string;
					account_id: string | null;
					source: ImportSource;
					filename: string | null;
					imported_at: string;
					row_count: number;
					new_count: number;
					duplicate_count: number;
					balance_after: number | null;
				};
				Insert: {
					id?: string;
					user_id: string;
					account_id?: string | null;
					source: ImportSource;
					filename?: string | null;
					imported_at?: string;
					row_count?: number;
					new_count?: number;
					duplicate_count?: number;
					balance_after?: number | null;
				};
				Update: {
					id?: string;
					user_id?: string;
					account_id?: string | null;
					source?: ImportSource;
					filename?: string | null;
					imported_at?: string;
					row_count?: number;
					new_count?: number;
					duplicate_count?: number;
					balance_after?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: 'imports_user_id_fkey';
						columns: ['user_id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'imports_account_id_fkey';
						columns: ['account_id'];
						referencedRelation: 'accounts';
						referencedColumns: ['id'];
					}
				];
			};
			bank_transactions: {
				Row: {
					id: string;
					user_id: string;
					import_id: string | null;
					account_id: string | null;
					source: ImportSource;
					external_id: string;
					date: string;
					amount: number;
					description: string | null;
					merchant: string | null;
					counterparty_iban: string | null;
					counterparty_name: string | null;
					kind: TransactionKind;
					status: TransactionStatus;
					expense_id: string | null;
					income_entry_id: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					import_id?: string | null;
					account_id?: string | null;
					source: ImportSource;
					external_id: string;
					date: string;
					amount: number;
					description?: string | null;
					merchant?: string | null;
					counterparty_iban?: string | null;
					counterparty_name?: string | null;
					kind: TransactionKind;
					status?: TransactionStatus;
					expense_id?: string | null;
					income_entry_id?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					import_id?: string | null;
					account_id?: string | null;
					source?: ImportSource;
					external_id?: string;
					date?: string;
					amount?: number;
					description?: string | null;
					merchant?: string | null;
					counterparty_iban?: string | null;
					counterparty_name?: string | null;
					kind?: TransactionKind;
					status?: TransactionStatus;
					expense_id?: string | null;
					income_entry_id?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'bank_transactions_user_id_fkey';
						columns: ['user_id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'bank_transactions_import_id_fkey';
						columns: ['import_id'];
						referencedRelation: 'imports';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'bank_transactions_account_id_fkey';
						columns: ['account_id'];
						referencedRelation: 'accounts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'bank_transactions_expense_id_fkey';
						columns: ['expense_id'];
						referencedRelation: 'expenses';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'bank_transactions_income_entry_id_fkey';
						columns: ['income_entry_id'];
						referencedRelation: 'income_entries';
						referencedColumns: ['id'];
					}
				];
			};
			category_rules: {
				Row: {
					id: string;
					user_id: string;
					match_type: RuleMatchType;
					pattern: string;
					kind: TransactionKind;
					category_id: string | null;
					share_divisor: number | null;
					hits: number;
					last_used_at: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					match_type: RuleMatchType;
					pattern: string;
					kind: TransactionKind;
					category_id?: string | null;
					share_divisor?: number | null;
					hits?: number;
					last_used_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					match_type?: RuleMatchType;
					pattern?: string;
					kind?: TransactionKind;
					category_id?: string | null;
					share_divisor?: number | null;
					hits?: number;
					last_used_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'category_rules_user_id_fkey';
						columns: ['user_id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'category_rules_category_id_fkey';
						columns: ['category_id'];
						referencedRelation: 'budget_categories';
						referencedColumns: ['id'];
					}
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}

// Helper types for common use
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

export interface ExpenseWithCategory extends Expense {
	category?: {
		id: string;
		name: string;
		color: string;
	} | null;
	account?: {
		id: string;
		name: string;
	} | null;
}

export interface CategoryWithSpending {
	id: string;
	name: string;
	color: string;
	type: 'fixed' | 'variable';
	allocated_amount: number;
	spent: number;
}

// Income entry types
export type IncomeEntry = Database['public']['Tables']['income_entries']['Row'];
export type IncomeEntryInsert = Database['public']['Tables']['income_entries']['Insert'];
export type IncomeEntryUpdate = Database['public']['Tables']['income_entries']['Update'];

// Predefined income types
export const INCOME_TYPES = [
	{ value: 'salaire', label: 'Salaire' },
	{ value: 'prime', label: 'Prime' },
	{ value: 'freelance', label: 'Freelance' },
	{ value: 'don', label: 'Don' },
	{ value: 'etrennes', label: 'Étrennes' },
	{ value: 'remboursement', label: 'Remboursement' },
	{ value: 'vente', label: 'Vente' },
	{ value: 'autre', label: 'Autre' }
] as const;

// Savings goal types
export type SavingsGoal = Database['public']['Tables']['savings_goals']['Row'];
export type SavingsGoalInsert = Database['public']['Tables']['savings_goals']['Insert'];
export type SavingsGoalUpdate = Database['public']['Tables']['savings_goals']['Update'];

export type GoalBreakdownItem = Database['public']['Tables']['goal_breakdown_items']['Row'];
export type GoalBreakdownItemInsert = Database['public']['Tables']['goal_breakdown_items']['Insert'];

export interface SavingsGoalWithBreakdown extends SavingsGoal {
	breakdown_items?: GoalBreakdownItem[];
}

// Savings allocation types
export type SavingsAllocation = Database['public']['Tables']['monthly_savings_allocations']['Row'];
export type SavingsAllocationInsert =
	Database['public']['Tables']['monthly_savings_allocations']['Insert'];
export type SavingsAllocationUpdate =
	Database['public']['Tables']['monthly_savings_allocations']['Update'];

// Extended types for UI display
export interface SavingsAllocationWithDetails extends SavingsAllocation {
	goal?: SavingsGoal | null;
	account?: Database['public']['Tables']['accounts']['Row'] | null;
}

// Import pipeline
export type Import = Database['public']['Tables']['imports']['Row'];
export type ImportInsert = Database['public']['Tables']['imports']['Insert'];
export type BankTransaction = Database['public']['Tables']['bank_transactions']['Row'];
export type BankTransactionInsert = Database['public']['Tables']['bank_transactions']['Insert'];
export type CategoryRule = Database['public']['Tables']['category_rules']['Row'];
export type CategoryRuleInsert = Database['public']['Tables']['category_rules']['Insert'];

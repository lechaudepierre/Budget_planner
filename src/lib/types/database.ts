export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

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
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					balance?: number;
					account_type?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					name?: string;
					balance?: number;
					account_type?: string | null;
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
					sort_order: number;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					color?: string;
					sort_order?: number;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					name?: string;
					color?: string;
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

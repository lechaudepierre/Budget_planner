-- Reset ALL user data (keeps the schema, auth users and profiles).
-- Run in the Supabase SQL Editor right before starting fresh (planned: 1 October 2026).
-- Irreversible: take a backup first if in doubt (Database → Backups).

BEGIN;

TRUNCATE TABLE
    public.bank_transactions,
    public.imports,
    public.category_rules,
    public.expenses,
    public.income_entries,
    public.monthly_savings_allocations,
    public.goal_breakdown_items,
    public.savings_goals,
    public.category_budgets,
    public.monthly_budgets,
    public.budget_categories,
    public.accounts
RESTART IDENTITY CASCADE;

COMMIT;

-- Afterwards, in the app: create accounts (with IBAN for BNP), categories, the first budget period,
-- then import the first statements.

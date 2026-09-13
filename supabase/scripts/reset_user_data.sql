-- Fresh start (planned: 1 October 2026).
-- Wipes transactional data but KEEPS the setup you already did:
--   categories, accounts (balances reset to 0, IBAN kept) and the categorisation rules learned so far.
-- Run in the Supabase SQL Editor. Irreversible: take a backup first if in doubt (Database → Backups).

BEGIN;

TRUNCATE TABLE
    public.bank_transactions,
    public.imports,
    public.expenses,
    public.income_entries,
    public.monthly_savings_allocations,
    public.goal_breakdown_items,
    public.savings_goals,
    public.category_budgets,
    public.monthly_budgets
RESTART IDENTITY CASCADE;

UPDATE public.accounts
SET balance = 0,
    balance_source = 'manual',
    last_import_at = NULL;

COMMIT;

-- Afterwards, in the app:
--   1. Patrimoine: enter the real balance of each account (Revolut will sync itself at the first import).
--   2. Budget: the first period is created automatically when you set income/allocations; pick the start date
--      (your salary day) and set an amount per envelope.
--   3. Épargne: create your goals.
--   4. Import the first BNP + Revolut statements.

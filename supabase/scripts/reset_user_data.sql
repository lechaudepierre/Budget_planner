-- Fresh start on 1 October 2026 (first salary of the new job).
-- Wipes ALL transactional data but KEEPS the setup already done: categories (enveloppes + coûts fixes),
-- accounts (balances reset to 0, IBAN kept) and the categorisation rules learned so far.
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

-- The first period: October 2026, starting on the 1st. Income and envelope amounts are set in the app (Mois).
INSERT INTO public.monthly_budgets (user_id, month, income, is_archived, start_date)
SELECT id, '2026-10', 0, false, DATE '2026-10-01'
FROM auth.users
ORDER BY created_at
LIMIT 1;

COMMIT;

-- Afterwards, in the app (onglet Mois): salaire, montant de chaque coût fixe, épargne, budget de chaque enveloppe.
-- Until 1 October the home screen shows "Le mois commence le 1 octobre"; expenses entered before that date are dated 1 October.

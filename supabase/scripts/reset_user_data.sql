-- Fresh start (Sept 2026).
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

-- The first period: the current month, from the 1st. It is closed on salary day, which opens the next one.
-- Income and envelope amounts are set in the app (Mois).
INSERT INTO public.monthly_budgets (user_id, month, income, is_archived, start_date)
SELECT id, to_char(current_date, 'YYYY-MM'), 0, false, date_trunc('month', current_date)::date
FROM auth.users
ORDER BY created_at
LIMIT 1;

COMMIT;

-- Afterwards, in the app (onglet Mois): salaire, montant de chaque coût fixe, épargne, budget de chaque enveloppe.

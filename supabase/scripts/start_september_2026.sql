-- The fresh start begins in September 2026 (closed on salary day → October starts that day).
-- Renames the period created by reset_user_data.sql, and the amounts already entered for it.
BEGIN;

UPDATE public.monthly_budgets
SET month = '2026-09', start_date = DATE '2026-09-01'
WHERE is_archived = false AND month = '2026-10';

UPDATE public.category_budgets SET month = '2026-09' WHERE month = '2026-10';
UPDATE public.monthly_savings_allocations SET month = '2026-09' WHERE month = '2026-10';

COMMIT;

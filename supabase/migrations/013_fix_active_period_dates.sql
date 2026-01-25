-- Migration 013: Fix end dates for active periods
-- Active budgets should have NULL end_date to signal they are "en cours" (in progress)

UPDATE public.monthly_budgets 
SET end_date = NULL 
WHERE is_archived = false;

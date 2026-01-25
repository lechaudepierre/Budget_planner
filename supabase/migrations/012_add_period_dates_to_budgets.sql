-- Migration: Add period dates to monthly_budgets
-- Purpose: Support periods that don't match exactly calendar months

ALTER TABLE public.monthly_budgets 
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE;

-- Initialize existing budgets with calendar month boundaries
UPDATE public.monthly_budgets
SET 
    start_date = (month || '-01')::DATE,
    end_date = ((month || '-01')::DATE + INTERVAL '1 month' - INTERVAL '1 day')::DATE
WHERE start_date IS NULL;

-- Make them NOT NULL for future entries (after initialization)
ALTER TABLE public.monthly_budgets 
ALTER COLUMN start_date SET NOT NULL;

-- Add index for date-based range queries
CREATE INDEX idx_monthly_budgets_dates ON public.monthly_budgets(user_id, start_date, end_date);

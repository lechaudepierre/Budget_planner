-- Migration: one-off ("exceptionnel") categories
-- Purpose: a large one-time payment (yearly tennis lessons…) that counts in the month it is paid only.
-- An exceptional category belongs to the period where it has a category_budgets row; closing a month
-- does not carry it over (only fixed costs are copied).

ALTER TABLE public.budget_categories DROP CONSTRAINT IF EXISTS budget_categories_type_check;
ALTER TABLE public.budget_categories
ADD CONSTRAINT budget_categories_type_check CHECK (type IN ('fixed', 'variable', 'exceptional'));

COMMENT ON COLUMN public.budget_categories.type IS 'Category type: fixed (carried over every month), variable (budget envelopes) or exceptional (one-off payment, only in the month it has a budget)';

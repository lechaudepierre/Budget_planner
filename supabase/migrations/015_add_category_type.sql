-- Migration: Add category type for distinguishing fixed vs variable costs
-- Purpose: Allow users to classify budget categories as fixed (incompressible) or variable (adjustable)

-- Add type column with default 'variable' for existing categories
ALTER TABLE public.budget_categories
ADD COLUMN type TEXT NOT NULL DEFAULT 'variable'
CHECK (type IN ('fixed', 'variable'));

-- Index for filtering by type
CREATE INDEX idx_budget_categories_type ON public.budget_categories(type);

-- Add comment for documentation
COMMENT ON COLUMN public.budget_categories.type IS 'Category type: fixed (incompressible costs like rent, subscriptions) or variable (adjustable budget envelopes)';

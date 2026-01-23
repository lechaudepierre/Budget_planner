-- Migration: Create monthly_budgets table
-- Purpose: Store monthly income/budget for users

CREATE TABLE public.monthly_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: "2026-01" for January 2026
    income NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Ensure one budget per user per month
    UNIQUE(user_id, month)
);

-- Index for faster lookups
CREATE INDEX idx_monthly_budgets_user_month ON public.monthly_budgets(user_id, month);

-- Enable RLS
ALTER TABLE public.monthly_budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own monthly budgets
CREATE POLICY "Users can view own monthly budgets"
    ON public.monthly_budgets
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own monthly budgets"
    ON public.monthly_budgets
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own monthly budgets"
    ON public.monthly_budgets
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own monthly budgets"
    ON public.monthly_budgets
    FOR DELETE
    USING (user_id = auth.uid());

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_monthly_budgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_monthly_budgets_updated
    BEFORE UPDATE ON public.monthly_budgets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_monthly_budgets_updated_at();

-- Grant permissions
GRANT ALL ON public.monthly_budgets TO authenticated;

-- Migration: Create category_budgets table
-- Purpose: Store monthly budget allocations per category

CREATE TABLE public.category_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.budget_categories(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: "2026-01"
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- One allocation per category per month
    UNIQUE(category_id, month)
);

-- Index for faster lookups
CREATE INDEX idx_category_budgets_category_month ON public.category_budgets(category_id, month);

-- Enable RLS
ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Access through category ownership
CREATE POLICY "Users can view their category budgets"
    ON public.category_budgets
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.budget_categories c
            WHERE c.id = category_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their category budgets"
    ON public.category_budgets
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.budget_categories c
            WHERE c.id = category_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their category budgets"
    ON public.category_budgets
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.budget_categories c
            WHERE c.id = category_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their category budgets"
    ON public.category_budgets
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.budget_categories c
            WHERE c.id = category_id AND c.user_id = auth.uid()
        )
    );

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_category_budgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_category_budgets_updated
    BEFORE UPDATE ON public.category_budgets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_category_budgets_updated_at();

-- Grant permissions
GRANT ALL ON public.category_budgets TO authenticated;

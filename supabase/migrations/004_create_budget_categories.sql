-- Migration: Create budget_categories table
-- Purpose: Store user's budget categories with colors

CREATE TABLE public.budget_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#639A88',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT budget_categories_name_not_empty CHECK (char_length(trim(name)) > 0),
    CONSTRAINT budget_categories_name_max_length CHECK (char_length(name) <= 50)
);

-- Index for faster user queries
CREATE INDEX idx_budget_categories_user_id ON public.budget_categories(user_id);
CREATE INDEX idx_budget_categories_sort ON public.budget_categories(user_id, sort_order);

-- Enable RLS
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own categories
CREATE POLICY "Users can view own categories"
    ON public.budget_categories
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own categories"
    ON public.budget_categories
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories"
    ON public.budget_categories
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own categories"
    ON public.budget_categories
    FOR DELETE
    USING (user_id = auth.uid());

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_budget_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_budget_categories_updated
    BEFORE UPDATE ON public.budget_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_budget_categories_updated_at();

-- Grant permissions
GRANT ALL ON public.budget_categories TO authenticated;

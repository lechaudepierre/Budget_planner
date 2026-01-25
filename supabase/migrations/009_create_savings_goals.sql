-- Create savings_goals table
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    current_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    target_date DATE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create goal_breakdown_items table for optional detailed budget breakdown
CREATE TABLE IF NOT EXISTS public.goal_breakdown_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_breakdown_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for savings_goals
CREATE POLICY "Users can view their own savings goals"
    ON public.savings_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings goals"
    ON public.savings_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings goals"
    ON public.savings_goals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings goals"
    ON public.savings_goals FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for goal_breakdown_items (access through goal ownership)
CREATE POLICY "Users can view breakdown items of their goals"
    ON public.goal_breakdown_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.savings_goals
        WHERE savings_goals.id = goal_breakdown_items.goal_id
        AND savings_goals.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert breakdown items for their goals"
    ON public.goal_breakdown_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.savings_goals
        WHERE savings_goals.id = goal_breakdown_items.goal_id
        AND savings_goals.user_id = auth.uid()
    ));

CREATE POLICY "Users can update breakdown items of their goals"
    ON public.goal_breakdown_items FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.savings_goals
        WHERE savings_goals.id = goal_breakdown_items.goal_id
        AND savings_goals.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete breakdown items of their goals"
    ON public.goal_breakdown_items FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.savings_goals
        WHERE savings_goals.id = goal_breakdown_items.goal_id
        AND savings_goals.user_id = auth.uid()
    ));

-- Trigger to update updated_at on savings_goals
CREATE OR REPLACE FUNCTION update_savings_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER savings_goals_updated_at
    BEFORE UPDATE ON public.savings_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_savings_goals_updated_at();

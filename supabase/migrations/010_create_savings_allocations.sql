-- Create monthly_savings_allocations table to track monthly savings towards goals and accounts
CREATE TABLE IF NOT EXISTS public.monthly_savings_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- Format: "2026-01"

    -- Either goal_id OR account_id should be set (not both)
    goal_id UUID REFERENCES public.savings_goals(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,

    allocated_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    transferred_amount NUMERIC(12,2) NOT NULL DEFAULT 0, -- Amount actually transferred this month

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- Ensure either goal or account is set, but not both
    CONSTRAINT savings_allocation_target CHECK (
        (goal_id IS NOT NULL AND account_id IS NULL) OR
        (goal_id IS NULL AND account_id IS NOT NULL)
    ),

    -- Unique constraint: one allocation per goal/account per month
    CONSTRAINT unique_goal_month UNIQUE (user_id, month, goal_id),
    CONSTRAINT unique_account_month UNIQUE (user_id, month, account_id)
);

-- Enable Row Level Security
ALTER TABLE public.monthly_savings_allocations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own savings allocations"
    ON public.monthly_savings_allocations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings allocations"
    ON public.monthly_savings_allocations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings allocations"
    ON public.monthly_savings_allocations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings allocations"
    ON public.monthly_savings_allocations FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER monthly_savings_allocations_updated_at
    BEFORE UPDATE ON public.monthly_savings_allocations
    FOR EACH ROW
    EXECUTE FUNCTION update_savings_goals_updated_at();

-- Add account_type 'savings' indicator if not exists (for filtering savings accounts)
-- This allows us to identify which accounts are savings accounts

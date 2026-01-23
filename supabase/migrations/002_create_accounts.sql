-- Migration: Create accounts table for patrimoine tracking
-- Created: 2026-01-23

-- Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    account_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT accounts_name_not_empty CHECK (char_length(trim(name)) > 0)
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON public.accounts(user_id);

-- Enable Row Level Security
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own accounts
CREATE POLICY "Users can view their own accounts"
    ON public.accounts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
    ON public.accounts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
    ON public.accounts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
    ON public.accounts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_accounts_updated
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_accounts_updated_at();

-- Grant permissions
GRANT ALL ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;

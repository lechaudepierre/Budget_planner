-- Migration: 008_create_income_entries_table.sql
-- Create income_entries table for tracking multiple income sources per month

-- Create income_entries table
CREATE TABLE income_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    type VARCHAR(50) NOT NULL, -- salaire, prime, don, étrennes, freelance, etc.
    label TEXT, -- Optional custom label
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE income_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own income entries"
    ON income_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own income entries"
    ON income_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income entries"
    ON income_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own income entries"
    ON income_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_income_entries_user_id ON income_entries(user_id);
CREATE INDEX idx_income_entries_user_month ON income_entries(user_id, month);

-- Updated_at trigger
CREATE TRIGGER income_entries_updated_at
    BEFORE UPDATE ON income_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

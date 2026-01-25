-- Migration: 014_add_account_to_expenses.sql
-- Add account_id to expenses for tracking which account the expense came from

-- Add account_id column (nullable for backward compatibility with existing expenses)
ALTER TABLE expenses
ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_expenses_account_id ON expenses(account_id);

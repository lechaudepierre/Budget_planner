-- Migration: Add manual archive system to monthly_budgets
-- Purpose: Allow users to manually archive budget periods instead of automatic calendar-based archiving

-- Add is_archived column to track active vs archived budgets
ALTER TABLE public.monthly_budgets
ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT false;

-- Add archived_at timestamp to know when it was archived
ALTER TABLE public.monthly_budgets
ADD COLUMN archived_at TIMESTAMPTZ;

-- Create index for faster lookup of active budget
CREATE INDEX idx_monthly_budgets_active ON public.monthly_budgets(user_id, is_archived) WHERE is_archived = false;

-- Update any existing budgets: set all past months as archived
UPDATE public.monthly_budgets
SET is_archived = true, archived_at = updated_at
WHERE month < to_char(now(), 'YYYY-MM');

-- Migration 011: Add is_finalized to savings allocations
-- Purpose: Allow confirming that monthly allocations have been persisted to goal current_amount

ALTER TABLE public.monthly_savings_allocations
ADD COLUMN IF NOT EXISTS is_finalized BOOLEAN NOT NULL DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.monthly_savings_allocations.is_finalized IS 'Indicates if the allocation has been added to the goal current_amount at month-end';

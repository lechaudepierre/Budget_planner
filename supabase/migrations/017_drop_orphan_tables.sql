-- Migration 017: Drop orphan tables
-- These tables/columns existed in the live DB from early experiments (Jan 2026)
-- but were never referenced by the application code.

ALTER TABLE public.income_entries DROP COLUMN IF EXISTS linked_reimbursement_id;
DROP TABLE IF EXISTS public.pending_reimbursements CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.recurring_expenses CASCADE;

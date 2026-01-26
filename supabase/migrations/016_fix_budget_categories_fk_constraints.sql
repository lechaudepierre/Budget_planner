-- Migration: Fix foreign key constraints for budget_categories deletion
-- Purpose: Ensure all tables referencing budget_categories use proper ON DELETE behavior
-- 
-- Problem: Users cannot delete budget categories due to FK constraint violations
-- Solution: Drop and recreate FK constraints with proper CASCADE/SET NULL behavior

-- Step 1: Drop existing FK constraint on category_budgets (if exists) and recreate with CASCADE
ALTER TABLE public.category_budgets
DROP CONSTRAINT IF EXISTS category_budgets_category_id_fkey;

ALTER TABLE public.category_budgets
ADD CONSTRAINT category_budgets_category_id_fkey
FOREIGN KEY (category_id)
REFERENCES public.budget_categories(id)
ON DELETE CASCADE;

-- Step 2: Drop existing FK constraint on expenses (if exists) and recreate with SET NULL
ALTER TABLE public.expenses
DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;

ALTER TABLE public.expenses
ADD CONSTRAINT expenses_category_id_fkey
FOREIGN KEY (category_id)
REFERENCES public.budget_categories(id)
ON DELETE SET NULL;

-- Verify the constraints are correct
COMMENT ON CONSTRAINT category_budgets_category_id_fkey ON public.category_budgets IS 'FK to budget_categories with CASCADE delete - when category is deleted, its allocations are deleted';
COMMENT ON CONSTRAINT expenses_category_id_fkey ON public.expenses IS 'FK to budget_categories with SET NULL delete - when category is deleted, expense keeps its data but category_id becomes NULL';

-- Optional icon chosen by the user for a category (key of the app's icon set).
-- When null, the app infers one from the category name.
ALTER TABLE public.budget_categories ADD COLUMN IF NOT EXISTS icon TEXT;

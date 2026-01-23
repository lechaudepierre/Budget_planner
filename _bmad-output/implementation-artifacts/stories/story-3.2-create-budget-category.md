# Story 3.2: Create Budget Category

Status: not-started

## Story

As a user,
I want to create budget categories with custom names,
so that I can organize my spending in a way that makes sense to me.

## Acceptance Criteria

1. "Ajouter une catégorie" button visible on budget page
2. Modal opens with form for category name
3. Category is saved with user's custom name
4. New category appears in categories list
5. New category has default budget of 0 €
6. Empty name shows validation error
7. Duplicate name shows "Cette catégorie existe déjà" error
8. Category gets auto-assigned color from palette

## Tasks / Subtasks

- [ ] Task 1: Create budget_categories table migration (AC: 3, 8)
  - [ ] Create `supabase/migrations/004_create_budget_categories.sql`
  - [ ] Table: id (uuid), user_id (uuid FK), name (text), color (text), icon (text nullable), sort_order (int), created_at, updated_at
  - [ ] RLS policies for user isolation
  - [ ] Unique constraint on (user_id, LOWER(name)) for case-insensitive duplicate check
  - [ ] Index on user_id

- [ ] Task 2: Create TypeScript types for categories (AC: 3)
  - [ ] Add BudgetCategory type to `src/lib/types/database.ts`
  - [ ] Create `src/lib/schemas/category.ts` with Zod validation
  - [ ] Define color palette constant

- [ ] Task 3: Create data layer for categories (AC: 3, 6, 7)
  - [ ] Create `src/lib/data/categories.ts`
  - [ ] Implement `getCategories()` - returns all user categories sorted
  - [ ] Implement `createCategory(name: string)` - auto-assigns color
  - [ ] Implement `categoryExists(name: string)` - for duplicate check
  - [ ] All functions return `{ data, error }` pattern

- [ ] Task 4: Create CategoryForm component (AC: 2, 6, 7)
  - [ ] Create `src/lib/components/forms/CategoryForm.svelte`
  - [ ] Single field for category name
  - [ ] Validation: required, max 50 chars
  - [ ] Error display for validation and duplicates
  - [ ] Submit and cancel buttons

- [ ] Task 5: Integrate categories into /budgets page (AC: 1, 4, 5)
  - [ ] Add "Ajouter une catégorie" button
  - [ ] Display categories list below income
  - [ ] Each category shows: color dot, name, budget amount (0 € initially)
  - [ ] Empty state if no categories
  - [ ] Modal for adding category

- [ ] Task 6: Implement color auto-assignment (AC: 8)
  - [ ] Define palette of 10+ distinct colors
  - [ ] Auto-assign next available color
  - [ ] Cycle through palette if all used
  - [ ] Store color in database

- [ ] Task 7: Verify and test (AC: 1-8)
  - [ ] Test category creation flow
  - [ ] Test duplicate name rejection
  - [ ] Test empty name validation
  - [ ] Verify colors are assigned correctly
  - [ ] TypeScript compilation check

## Dev Notes

### Database Schema

```sql
CREATE TABLE public.budget_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT category_name_not_empty CHECK (char_length(trim(name)) > 0),
    UNIQUE(user_id, LOWER(name))
);
```

### Color Palette

```typescript
export const categoryColors = [
  '#639A88', // Sage (primary)
  '#D4A04D', // Amber
  '#C07D5A', // Terracotta
  '#6B8CA0', // Blue-gray
  '#9B8AA0', // Purple-gray
  '#7DB8A8', // Light sage
  '#E8B4A0', // Peach
  '#8BA888', // Muted green
  '#B8A090', // Taupe
  '#A0C4B8', // Mint
] as const;
```

### UI Design Reference

- Consistent with ux-design-directions-v3.html
- Category list with colored dots
- Modal matches existing modal style (linen background)
- Categories displayed in a clean list format

## Dependencies

- Story 3.1 (Monthly Income) - Must be complete
- Budget page structure established

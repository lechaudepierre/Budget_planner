# Story 7.1: Ajouter le type de catégorie (DB + Schema)

Status: done

## Story

As a developer,
I want to add a `type` field to budget categories,
So that users can distinguish between fixed and variable costs.

## Acceptance Criteria

1. **Given** the current database schema, **When** I run the migration, **Then** the `budget_categories` table has a new `type` column with values 'fixed' or 'variable', existing categories default to 'variable'

2. **Given** I create a category via the data layer, **When** I specify type = 'fixed', **Then** the category is saved with type 'fixed'

3. **Given** I query categories, **When** I filter by type, **Then** I can retrieve only fixed or only variable categories

## Tasks / Subtasks

- [ ] **Task 1: Create database migration** (AC: 1)
  - [ ] Create `supabase/migrations/015_add_category_type.sql`
  - [ ] Add column: `ALTER TABLE budget_categories ADD COLUMN type TEXT NOT NULL DEFAULT 'variable' CHECK (type IN ('fixed', 'variable'))`
  - [ ] Test migration on existing data (all become 'variable')

- [ ] **Task 2: Update TypeScript types** (AC: 2, 3)
  - [ ] Update `src/lib/types/database.ts`:
    - Add `type: 'fixed' | 'variable'` to category types
  - [ ] Regenerate types if using Supabase CLI

- [ ] **Task 3: Update Zod schema** (AC: 2)
  - [ ] Edit `src/lib/schemas/category.ts`
  - [ ] Add type field: `type: z.enum(['fixed', 'variable']).default('variable')`
  - [ ] Export updated schema

- [ ] **Task 4: Update data layer functions** (AC: 2, 3)
  - [ ] Edit `src/lib/data/categories.ts`
  - [ ] Update `createCategory()` to accept optional type parameter (default: 'variable')
  - [ ] Add `getCategoriesByType(type: 'fixed' | 'variable')` function
  - [ ] Update `updateCategory()` to allow type changes
  - [ ] Ensure all functions return `{ data, error }` format

## Dev Notes

### Architecture Compliance

- Migration file follows existing pattern (see `004_create_budget_categories.sql`)
- Data layer follows `{ data, error }` return pattern
- Zod validation for all inputs
- TypeScript strict types

### Migration SQL

```sql
-- Add category type for distinguishing fixed vs variable costs
ALTER TABLE budget_categories 
ADD COLUMN type TEXT NOT NULL DEFAULT 'variable' 
CHECK (type IN ('fixed', 'variable'));

-- Index for filtering by type
CREATE INDEX idx_budget_categories_type ON budget_categories(type);

COMMENT ON COLUMN budget_categories.type IS 'Category type: fixed (incompressible) or variable (adjustable budget)';
```

### Testing

- [ ] Run migration locally
- [ ] Verify existing categories have type = 'variable'
- [ ] Create new category with type = 'fixed'
- [ ] Query categories filtered by type

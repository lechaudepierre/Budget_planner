# Story 7.1: Add Fixed Expense

Status: backlog

## Story

As a user,
I want to add a fixed expense with name, amount, and day of month,
So that I can track my recurring commitments.

## Acceptance Criteria

1. **Given** I am signed in, **When** I navigate to the Fixed Expenses page, **Then** I see a "+ Nouvel engagement" button

2. **Given** I click "Nouvel engagement", **When** the form modal opens, **Then** I see fields for: Name (text), Amount (€), Day of month (1-31), Category (dropdown, optional)

3. **Given** I fill in valid data (e.g., "Netflix", 15€, day 5, category "Loisirs"), **When** I click "Ajouter", **Then** the fixed expense is saved, it appears in my list, and a success toast appears

4. **Given** I try to add with missing name or amount, **When** I submit, **Then** I see validation errors and the expense is not saved

5. **Given** I select a category, **When** I save, **Then** the expense is linked to that budget category and appears in category-filtered views

## Tasks / Subtasks

- [ ] **Task 1: Create database migration** (AC: 3, 5)
  - [ ] Create `supabase/migrations/014_create_recurring_expenses.sql`
  - [ ] Define table: `recurring_expenses` with columns:
    - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
    - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
    - `name TEXT NOT NULL`
    - `amount NUMERIC(12,2) NOT NULL CHECK (amount > 0)`
    - `day_of_month INTEGER NOT NULL CHECK (day_of_month BETWEEN 1 AND 31)`
    - `category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL`
    - `active BOOLEAN NOT NULL DEFAULT true`
    - `created_at TIMESTAMPTZ DEFAULT now()`
    - `updated_at TIMESTAMPTZ DEFAULT now()`
  - [ ] Enable RLS and create policies:
    - Users can SELECT their own recurring expenses
    - Users can INSERT their own recurring expenses
    - Users can UPDATE their own recurring expenses
    - Users can DELETE their own recurring expenses
  - [ ] Add updated_at trigger

- [ ] **Task 2: Create data layer functions** (AC: 3, 4)
  - [ ] Create `src/lib/data/recurring-expenses.ts`
  - [ ] Implement `createRecurringExpense(data)` function
    - Validates input with Zod schema
    - Inserts to recurring_expenses table
    - Returns `{ data, error }` format
  - [ ] Implement `getRecurringExpenses()` for listing
  - [ ] Follow existing data layer patterns from `goals.ts` and `accounts.ts`

- [ ] **Task 3: Create Zod validation schema** (AC: 4)
  - [ ] Create `src/lib/schemas/recurring-expense.ts`
  - [ ] Define schema with:
    - `name: z.string().min(1, "Le nom est requis")`
    - `amount: z.number().positive("Le montant doit être supérieur à 0")`
    - `day_of_month: z.number().int().min(1).max(31)`
    - `category_id: z.string().uuid().nullable().optional()`
    - `active: z.boolean().default(true)`
  - [ ] Export TypeScript type from schema

- [ ] **Task 4: Create RecurringExpenseForm component** (AC: 2, 3, 4, 5)
  - [ ] Create `src/lib/components/recurring/RecurringExpenseForm.svelte`
  - [ ] Add form fields:
    - Name input (text)
    - Amount input (number, currency format)
    - Day of month input (number 1-31 or dropdown)
    - Category select (load from categories, optional)
  - [ ] Implement validation with Zod schema
  - [ ] Show inline validation errors
  - [ ] Handle form submission with `createRecurringExpense()`
  - [ ] Show toast notification on success
  - [ ] Reset form after successful save
  - [ ] Follow existing form patterns from `GoalForm.svelte` and `AccountForm.svelte`

- [ ] **Task 5: Create Fixed Expenses page route** (AC: 1, 3)
  - [ ] Create `src/routes/fixed-expenses/+page.svelte`
  - [ ] Add page header "Engagements fixes"
  - [ ] Add "+ Nouvel engagement" button
  - [ ] Implement modal for RecurringExpenseForm
  - [ ] Load and display recurring expenses list (placeholder for Story 7.2)
  - [ ] Follow existing page patterns from `/epargne` and `/patrimoine`

- [ ] **Task 6: Add Fixed Expenses to navigation** (AC: 1)
  - [ ] Edit `src/lib/components/ui/Navbar.svelte`
  - [ ] Add Fixed Expenses link to navigation (after Épargne, before Préférences)
  - [ ] Use calendar icon with recurring symbol
  - [ ] Link to `/fixed-expenses`

## Dev Notes

### Architecture Compliance

- Follow data layer pattern: all DB queries in `src/lib/data/recurring-expenses.ts`
- Return `{ data, error }` from all functions
- Use Zod validation for all inputs
- Use Svelte 5 runes (`$state`, `$derived`) for reactivity
- File naming: `kebab-case.svelte`
- RLS policies: users can only access their own data

### Existing Patterns to Follow

**Data Layer Pattern** (from `goals.ts`):
```typescript
export async function createRecurringExpense(data: RecurringExpenseInput) {
  try {
    const validated = recurringExpenseSchema.parse(data);
    const { data: expense, error } = await supabase
      .from('recurring_expenses')
      .insert({
        ...validated,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return { data: expense, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
```

**Form Pattern** (from `GoalForm.svelte`):
```typescript
let formData = $state({
  name: '',
  amount: 0,
  day_of_month: 1,
  category_id: null
});

let errors = $state<Record<string, string>>({});

async function handleSubmit() {
  try {
    errors = {};
    const result = await createRecurringExpense(formData);
    if (result.error) throw result.error;

    toast.success('Engagement ajouté avec succès');
    formData = { name: '', amount: 0, day_of_month: 1, category_id: null };
    onSuccess?.();
  } catch (err) {
    if (err instanceof z.ZodError) {
      errors = err.flatten().fieldErrors;
    }
  }
}
```

### Project Structure Notes

**New files to create:**
```
supabase/migrations/014_create_recurring_expenses.sql  ← NEW
src/lib/data/recurring-expenses.ts                     ← NEW
src/lib/schemas/recurring-expense.ts                   ← NEW
src/routes/fixed-expenses/+page.svelte                 ← NEW
src/lib/components/recurring/                          ← NEW FOLDER
├── RecurringExpenseForm.svelte                        ← NEW
└── RecurringExpenseCard.svelte (Story 7.2)            ← FUTURE
```

**Files to modify:**
```
src/lib/components/ui/Navbar.svelte                    ← Add Fixed Expenses link
```

### Database Schema

```sql
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    day_of_month INTEGER NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
    category_id UUID REFERENCES public.budget_categories(id) ON DELETE SET NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recurring expenses"
    ON public.recurring_expenses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring expenses"
    ON public.recurring_expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring expenses"
    ON public.recurring_expenses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring expenses"
    ON public.recurring_expenses FOR DELETE
    USING (auth.uid() = user_id);
```

### Color & Styling Reference

- Card background: `bg-cotton`
- Border: `border-sand`
- Primary button: `bg-sage hover:bg-sage-dark text-white`
- Input focus: `focus:border-sage focus:ring-sage`
- Error text: `text-terracotta`
- Success text: `text-sage`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 7]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Layer]
- [Source: src/lib/data/goals.ts] - Data layer pattern
- [Source: src/lib/components/goals/GoalForm.svelte] - Form pattern
- [Source: supabase/migrations/009_create_savings_goals.sql] - Migration pattern

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_

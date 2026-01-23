# Story 4.1: Add Expense (Basic)

## User Story
As a user,
I want to add an expense with amount, category, and date,
So that I can track my spending.

## Acceptance Criteria

### AC1: Expense Modal Opening
**Given** I am signed in
**When** I click the "+ Ajouter" button in the header
**Then** an expense entry form/modal opens

### AC2: Add Expense with All Fields
**Given** I am adding an expense
**When** I fill in: amount (47.50 €), category (Courses), date (today by default)
**And** I click "Ajouter"
**Then** the expense is saved to the database
**And** a success toast appears
**And** the form resets for another entry (stay in modal)

### AC3: Optional Description
**Given** I want to add an optional description
**When** I fill in the description field
**Then** it is saved with the expense

### AC4: Validation Errors
**Given** I submit with missing required fields
**When** I click "Ajouter"
**Then** I see validation errors for amount and category
**And** the expense is not saved

## Technical Notes

### Database Migration (007_create_expenses_table.sql)
```sql
-- Create expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own expenses"
    ON expenses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own expenses"
    ON expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
    ON expenses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
    ON expenses FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_date ON expenses(date DESC);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC);

-- Updated_at trigger
CREATE TRIGGER expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Zod Schema (src/lib/schemas/expense.ts)
```typescript
import { z } from 'zod/v4';

export const expenseSchema = z.object({
    category_id: z.string().uuid('Veuillez sélectionner une catégorie'),
    amount: z.number({ message: 'Le montant est requis' })
        .positive('Le montant doit être positif')
        .max(999999.99, 'Le montant est trop élevé'),
    description: z.string().max(200, 'Description trop longue').optional().nullable(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide')
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
```

### Data Layer (src/lib/data/expenses.ts)
```typescript
import { supabase } from '$lib/supabase';
import type { Expense } from '$lib/types/database';

export async function createExpense(data: {
    category_id: string;
    amount: number;
    description?: string | null;
    date: string;
}): Promise<{ data: Expense | null; error: Error | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { data: null, error: new Error('Vous devez être connecté') };
    }

    const { data: expense, error } = await supabase
        .from('expenses')
        .insert({
            user_id: user.id,
            category_id: data.category_id,
            amount: data.amount,
            description: data.description || null,
            date: data.date
        })
        .select()
        .single();

    return { data: expense, error };
}

export async function getExpenses(options?: {
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}): Promise<{ data: Expense[]; error: Error | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { data: [], error: new Error('Vous devez être connecté') };
    }

    let query = supabase
        .from('expenses')
        .select(`
            *,
            category:budget_categories(id, name, color)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

    if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
    }
    if (options?.startDate) {
        query = query.gte('date', options.startDate);
    }
    if (options?.endDate) {
        query = query.lte('date', options.endDate);
    }
    if (options?.limit) {
        query = query.limit(options.limit);
    }
    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;
    return { data: data || [], error };
}
```

### Components to Create
- `src/lib/components/expense/AddExpenseModal.svelte` - Modal with form
- Update `src/lib/components/layout/Header.svelte` - Add "+ Ajouter" button

### UI/UX
- Modal with clear form fields
- Amount input with € suffix
- Category dropdown (from user's budget categories)
- Date picker defaulting to today
- Toast on success
- Form reset after successful add (modal stays open for quick entry)
- French UI labels

## Files to Create/Modify
1. `supabase/migrations/007_create_expenses_table.sql`
2. `src/lib/types/database.ts` - Add Expense type
3. `src/lib/schemas/expense.ts`
4. `src/lib/data/expenses.ts`
5. `src/lib/components/expense/AddExpenseModal.svelte`
6. `src/lib/components/layout/Header.svelte` - Add button to open modal

## Dependencies
- Budget categories must exist (Epic 3)
- User must be authenticated

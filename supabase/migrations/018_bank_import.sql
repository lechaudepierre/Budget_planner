-- Migration 018: Bank statement import (BNP Fortis / Revolut) + AI categorisation
--
-- Design notes:
-- - expenses.amount keeps its meaning: the amount that counts in the budget (my share).
--   bank_amount stores what the bank actually saw (null for manual entries).
-- - bank_transactions is the ledger of every imported line (dedup + audit).
--   Only lines of kind 'expense' / 'income' create rows in expenses / income_entries.
-- - category_rules are learned from the user's corrections during import review.

-- ---------------------------------------------------------------------------
-- accounts: IBAN (to match statements and detect internal transfers)
-- ---------------------------------------------------------------------------
ALTER TABLE public.accounts
    ADD COLUMN IF NOT EXISTS iban TEXT,
    ADD COLUMN IF NOT EXISTS balance_source TEXT NOT NULL DEFAULT 'manual'
        CHECK (balance_source IN ('manual', 'import')),
    ADD COLUMN IF NOT EXISTS last_import_at TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- expenses: import metadata
-- ---------------------------------------------------------------------------
ALTER TABLE public.expenses
    ADD COLUMN IF NOT EXISTS bank_amount DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual'
        CHECK (source IN ('manual', 'bnp', 'revolut')),
    ADD COLUMN IF NOT EXISTS merchant TEXT,
    ADD COLUMN IF NOT EXISTS is_pending BOOLEAN NOT NULL DEFAULT false;

-- ---------------------------------------------------------------------------
-- imports: one row per uploaded file
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    source TEXT NOT NULL CHECK (source IN ('bnp', 'revolut')),
    filename TEXT,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    row_count INTEGER NOT NULL DEFAULT 0,
    new_count INTEGER NOT NULL DEFAULT 0,
    duplicate_count INTEGER NOT NULL DEFAULT 0,
    balance_after DECIMAL(12,2)
);

ALTER TABLE public.imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own imports"
    ON public.imports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own imports"
    ON public.imports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own imports"
    ON public.imports FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_imports_user ON public.imports(user_id, imported_at DESC);

-- ---------------------------------------------------------------------------
-- bank_transactions: every imported line (ledger)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    import_id UUID REFERENCES public.imports(id) ON DELETE SET NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    source TEXT NOT NULL CHECK (source IN ('bnp', 'revolut')),
    external_id TEXT NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,           -- signed, as seen by the bank
    description TEXT,                         -- raw description from the statement
    merchant TEXT,                            -- normalised merchant / counterparty
    counterparty_iban TEXT,
    counterparty_name TEXT,
    kind TEXT NOT NULL CHECK (kind IN ('expense', 'income', 'transfer', 'reimbursement', 'ignored')),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending')),
    expense_id UUID REFERENCES public.expenses(id) ON DELETE SET NULL,
    income_entry_id UUID REFERENCES public.income_entries(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT bank_transactions_unique_external UNIQUE (user_id, source, external_id)
);

ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bank transactions"
    ON public.bank_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bank transactions"
    ON public.bank_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bank transactions"
    ON public.bank_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bank transactions"
    ON public.bank_transactions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bank_transactions_user_date
    ON public.bank_transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account
    ON public.bank_transactions(account_id, date DESC);

CREATE TRIGGER bank_transactions_updated_at
    BEFORE UPDATE ON public.bank_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- category_rules: learned categorisation rules
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.category_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_type TEXT NOT NULL CHECK (match_type IN ('merchant', 'iban', 'contains')),
    pattern TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('expense', 'income', 'transfer', 'reimbursement', 'ignored')),
    category_id UUID REFERENCES public.budget_categories(id) ON DELETE CASCADE,
    share_divisor INTEGER CHECK (share_divisor IS NULL OR share_divisor >= 1),
    hits INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT category_rules_unique_pattern UNIQUE (user_id, match_type, pattern)
);

ALTER TABLE public.category_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own category rules"
    ON public.category_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own category rules"
    ON public.category_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own category rules"
    ON public.category_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own category rules"
    ON public.category_rules FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_category_rules_user ON public.category_rules(user_id, match_type);

CREATE TRIGGER category_rules_updated_at
    BEFORE UPDATE ON public.category_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

# Budget Planner — notes for AI agents

Personal budgeting app (SvelteKit 2 / Svelte 5 runes / Supabase / Tailwind 4 + DaisyUI). French UI.

## Conventions
- Components never import Supabase directly: client data access lives in `src/lib/data/*.ts`,
  server-only logic in `src/lib/server/**` (uses `event.locals.supabase`, RLS enforced).
- Zod schemas in `src/lib/schemas/*.ts`; DB types hand-maintained in `src/lib/types/database.ts`
  (keep `Relationships` in sync with FKs or PostgREST joins fail).
- Toasts: `$lib/stores/toast`. Dashboard refresh after mutations: `dashboardRefresh.trigger()`.
- Palette: sage / terracotta / amber / coffee-900 / cotton / linen / oat / sand (see `src/app.css`).
- `npm run check` baseline: 0 errors (~38 a11y/runes warnings). `npm test` runs vitest.

## UI conventions (phase 2 redesign, Sept 2026)
- Light theme only, **no gradients**, no heavy shadows. One card style: `.card` / `.card-title` (see `src/app.css`),
  buttons `.btn-primary-sage` / `.btn-secondary` / `.btn-ghost-soft`, inputs `.input-base`, numbers `.num`.
- Shared components in `src/lib/components/ui/`: `Card`, `ProgressBar` (auto tone sage/amber/terracotta),
  `AnimatedNumber`, `StatTile`, `Skeleton`, `EmptyState`, `ActionCard`, `SegmentedControl`, `Icon` (name → path map).
- Navigation is defined once in `src/lib/config/nav.ts` (sidebar ≥ lg, `BottomNav` below). The `Header` takes its
  title from that config or from `$page.data.header` — pages must not render their own `<h1>`.
- Home page is server-loaded (`src/routes/+page.server.ts` → `src/lib/server/dashboard.ts`, `depends('app:dashboard')`);
  `dashboardRefresh.trigger()` invalidates it. Other pages still load client-side: show a skeleton, never a spinner.
- Colours carry meaning only: sage = ok/positive, amber = 75–100 %, terracotta = over/outflow.

## Money model (important)
- `expenses.amount` = **what counts in the budget** (the user's own share).
- `expenses.bank_amount` = what the bank actually debited (null for manual entries).
  Account balance adjustments use `bank_amount ?? amount`.
- Shared expenses (Tricount-style) are handled by dividing the bank amount (`share_divisor`);
  reimbursements received are tagged `reimbursement` and simply ignored — no balance tracking.

## Bank statement import (`/import`)
- Parsers (pure, tested): `src/lib/import/` — BNP Paribas Fortis (`;`, decimal comma, merchant buried
  in "Détails", dedup key = "REFERENCE BANQUE") and Revolut (`,`, only product "Valeur actuelle",
  pocket round-ups are internal transfers, running balance in the file).
- Pipeline (server): `src/lib/server/import/analyze.ts` → dedup on `bank_transactions.external_id`,
  internal transfer detection (`transfers.ts`), learned rules (`rules.ts`), then Claude for unknown
  expense lines (`src/lib/server/ai/categorize.ts`, model `claude-sonnet-5` by default / `ANTHROPIC_MODEL`, needs `ANTHROPIC_API_KEY` (+ `ANTHROPIC_WORKSPACE_ID` for org-level keys)).
  `commit.ts` writes `bank_transactions` + `expenses` / `income_entries`, learns `category_rules`,
  updates balances.
- Every imported line is kept in `bank_transactions` (ledger); only `expense` / `income` kinds create
  budget rows. Fixtures for tests are synthetic — never commit real statements.

## Migrations
- `supabase/migrations/` is the source of truth; apply new ones through the Supabase MCP
  (`apply_migration`) or the SQL editor. Destructive statements are blocked for agents — hand them
  to the user. `supabase/scripts/reset_user_data.sql` wipes transactional data for a fresh start (keeps categories, accounts, rules).

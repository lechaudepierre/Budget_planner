# Budget Planner — notes for AI agents

Personal budgeting app (SvelteKit 2 / Svelte 5 runes / Supabase / Tailwind 4). French UI.
Since Sept 2026 it is a **phone-first web app with three screens** (Accueil, Historique, Mois): one gesture
to log an expense — tap an envelope, type an amount on the numpad, done.

## Conventions
- Components never import Supabase directly: client mutations live in `src/lib/data/month.ts` (built on the
  older `expenses.ts` / `budgets.ts` / `savings-allocations.ts` helpers), server reads in `src/lib/server/month.ts`
  (uses `event.locals.supabase`, RLS enforced).
- DB types hand-maintained in `src/lib/types/database.ts` (keep `Relationships` in sync with FKs or PostgREST joins fail).
- `npm run check` baseline: 0 errors, 0 warnings. `npm test` runs vitest (import parsers only).

## App structure
- `src/routes/+layout.server.ts` loads **everything** once (`loadMonth` → `MonthData`, `depends('app:month')`).
  Pages are pure renderers of `data.month`; after a mutation call `dashboardRefresh.trigger()` (invalidates `app:month`).
- Screens: `/` (reste à dépenser + enveloppes), `/historique` (dépenses par jour), `/mois` (salaire, coûts fixes,
  épargne, budgets des enveloppes, clôture). Navigation in `src/lib/config/nav.ts` → `TabBar`.
- Every amount is typed in the single bottom sheet `src/lib/components/ui/AmountSheet.svelte`, driven by the
  `sheet` store (`src/lib/stores/sheet.ts`): modes `add` / `edit` / `value` / `create`.
- Toast (`$lib/stores/toast`): one at a time, optional `undo`. Mutations in `data/month.ts` return `{ error, undo? }`.
- Layout: `.shell` > `.device` (edge to edge on phones, a 390 px frame ≥ 480 px). Each page renders one
  `<main class="screen">` with a sticky `.topbar`. Shared classes live in `src/app.css` (`.row`, `.row-ico`, `.list`,
  `.section-h`, `.balance`, `.btn-ghost`…); page-specific styles are scoped.

## UI rules
- Quasi-monochrome + one accent. Tokens in `src/app.css` (`--bg`, `--ink`, `--muted`, `--line`, `--soft`, `--accent`,
  `--warn`, `--over`…), dark variant follows `prefers-color-scheme`. Font: Geist. Numbers use `.num` (tabular).
- **No gradients, no cards, no heavy shadows.** Lists are rows separated by hairlines. Colour carries meaning only:
  accent = ok, `warn` = < 25 % left, `over` = exceeded (`src/lib/utils/tone.ts`).
- Money formatting: `eur()` in `src/lib/utils/currency.ts` (whole euros without decimals). Category icons are
  inferred from the name (`src/lib/config/icons.ts`, `Icon.svelte`); there is no icon column.

## Money model
- Enveloppes = `budget_categories` (`type = 'variable'`) + `category_budgets.amount` for the active month.
- Coûts fixes = `type = 'fixed'`; the check on `/mois` creates (or deletes) the period's expense for the category.
- Salaire = `monthly_budgets.income`. Épargne = `monthly_savings_allocations` on a savings account (auto-created
  if none). Home stats show these three and `free = income − fixed − savings − envelopes`.
- `expenses.amount` = what counts in the budget; `bank_amount` (imports) = what the bank debited. `amount > 0`
  is enforced by the DB, so "Corriger le total" downwards trims the latest expenses instead of inserting a negative one.
- **The salary ends the month, not the calendar.** Periods are open-ended: past `naturalEnd` (start + 1 month) the home
  shows a nudge and keeps counting expenses (`period.overdueDays`). `ClosePeriod` (`closeMonth` → `archiveBudgetAndStartNew`)
  archives today and opens the next month (named month + 1, starting today) with the same allocations and savings.
  There is no automatic rollover on purpose.

## Bank statement import (parked)
- The UI for importing statements was removed in the phone-first redesign; the pure parsers and the server
  pipeline are kept (`src/lib/import/`, `src/lib/server/import/`, `src/lib/server/ai/`) with their tests.
  Every imported line lived in `bank_transactions`; fixtures are synthetic — never commit real statements.

## Migrations
- `supabase/migrations/` is the source of truth; apply new ones through the Supabase MCP
  (`apply_migration`) or the SQL editor. Destructive statements are blocked for agents — hand them
  to the user. `supabase/scripts/reset_user_data.sql` wipes transactional data for a fresh start (keeps categories, accounts, rules).

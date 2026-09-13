# Budget Planner

A personal finance management app for tracking budgets, expenses, savings goals, and net worth. Built with SvelteKit, Supabase, and Tailwind CSS. Available as an installable PWA.

## Features

- **Budget Management** — Create monthly budgets with income tracking, fixed and variable category allocations, and period archiving
- **Expense Tracking** — Log daily expenses with inline editing, category/account filtering, date range selection, and pagination
- **Savings Goals** — Set targets, allocate budget surplus, track progress, and break goals into sub-items
- **Net Worth (Patrimoine)** — Manage multiple account types (checking, savings, investment, credit card, loan) and track total net worth
- **Monthly Recap (Bilan)** — Compare spending across months, analyze category breakdowns, and archive completed periods
- **Dashboard** — Real-time overview with budget usage gauges, expense breakdowns, savings progress, and net worth summary
- **Bank Statement Import** — Drop BNP Paribas Fortis / Revolut CSV exports; duplicates and internal transfers are detected, learned rules and Claude categorise the rest, shared expenses can be split (÷2 ÷3 ÷4)
- **PWA** — Installable on mobile and desktop with offline support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit 2 + Svelte 5 (Runes) |
| Styling | Tailwind CSS 4 + DaisyUI 5 |
| Backend | Supabase (PostgreSQL + PostgREST + Auth) |
| Validation | Zod |
| Auth | Google OAuth via Supabase |
| Language | TypeScript |
| PWA | @vite-pwa/sveltekit |
| Deployment | Vercel (adapter-auto) |

## Project Structure

```
src/
├── lib/
│   ├── components/       # UI components organized by feature
│   │   ├── dashboard/    # Dashboard cards and widgets
│   │   ├── budget/       # Budget management components
│   │   ├── expense/      # Expense list, inline editing
│   │   ├── savings/      # Savings goals and allocations
│   │   ├── goals/        # Goal detail and breakdown
│   │   ├── ui/           # Shared UI (modals, dropdowns, toasts)
│   │   └── forms/        # Form components
│   ├── data/             # Data layer (Supabase queries)
│   ├── import/           # Bank statement parsers (pure, unit-tested)
│   ├── schemas/          # Zod validation schemas
│   ├── stores/           # Svelte stores (toast, refresh)
│   ├── types/            # TypeScript types (database schema)
│   ├── server/           # Server-only: import pipeline, Claude categorisation
│   └── utils/            # Helpers (currency, date, colors)
├── routes/
│   ├── (app)/            # Authenticated routes
│   │   ├── +page.svelte          # Dashboard
│   │   ├── budgets/              # Budget management
│   │   ├── expenses/             # Expense tracking
│   │   ├── import/               # Bank statement import & review
│   │   ├── epargne/              # Savings goals
│   │   ├── patrimoine/           # Net worth / accounts
│   │   ├── bilan/                # Monthly recap
│   │   ├── parametres/           # Settings
│   │   └── tutoriel/             # Tutorial
│   └── auth/             # Login, callback, logout
supabase/
└── migrations/           # 16 SQL migration files
static/
├── icons/                # PWA icons (192px, 512px)
├── manifest.json         # PWA manifest
└── favicon.png
```

## Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profiles linked to Supabase Auth |
| `accounts` | Financial accounts (checking, savings, investment, etc.) |
| `monthly_budgets` | Budget periods with income, start/end dates, archive status |
| `budget_categories` | Expense categories (fixed or variable, color-coded) |
| `category_budgets` | Monthly amount allocations per category |
| `expenses` | Individual transactions linked to categories and accounts |
| `income_entries` | Income records (salary, bonus, freelance, etc.) |
| `savings_goals` | Savings targets with progress tracking |
| `goal_breakdown_items` | Sub-items within a savings goal |
| `monthly_savings_allocations` | Monthly allocations to savings goals/accounts |
| `imports` | One row per uploaded bank statement |
| `bank_transactions` | Every imported statement line (dedup key, kind, link to expense/income) |
| `category_rules` | Categorisation rules learned from the user's corrections |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A [Supabase](https://supabase.com/) project with Google OAuth configured

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/<your-username>/Budget_planner.git
   cd Budget_planner
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example env file and fill in your Supabase credentials:

   ```bash
   cp .env.example .env
   ```

   ```env
   PUBLIC_SUPABASE_URL=your_supabase_project_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ANTHROPIC_API_KEY=sk-ant-...   # optional: AI categorisation of imported statements (server-side only)
   ```

4. **Set up the database**

   Run the SQL migrations in `supabase/migrations/` against your Supabase project (in order, 001 through 018).
   To start over while keeping your categories, accounts and learned rules, run `supabase/scripts/reset_user_data.sql` in the SQL editor.

5. **Configure Google OAuth**

   In your Supabase dashboard, enable Google as an auth provider and set the redirect URL to `http://localhost:5173/auth/callback`.

6. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run check` | Run svelte-check (type checking) |
| `npm test` | Run unit tests (statement parsers, import pipeline) |
| `npm run check:watch` | Type checking in watch mode |
| `npm run lint` | Check formatting and linting |
| `npm run format` | Auto-format code with Prettier |

## Architecture Notes

- **Data layer isolation** — Components never import Supabase directly. All database queries go through `src/lib/data/*.ts` modules.
- **Validation** — Zod schemas in `src/lib/schemas/` with `validateX()` wrapper functions for form submission.
- **Dashboard refresh** — A `dashboardRefresh.trigger()` store pattern keeps the dashboard in sync after mutations.
- **Toast notifications** — Svelte writable store at `$lib/stores/toast` (not runes-based).
- **Auth** — Server-side session handling via `hooks.server.ts` with automatic redirect for unauthenticated users.

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Sage | `#639A88` | Primary / theme color |
| Terracotta | `#C07D5A` | Accents / over-budget |
| Coffee 900 | `#2D2520` | Text |
| Cotton | `#FDFBF8` | Card backgrounds |
| Linen | `#FAF7F2` | Page background |
| Oat | `#F5F1EA` | Subtle backgrounds |
| Sand | `#E2DCD2` | Borders / dividers |

## Deployment

The app uses `@sveltejs/adapter-auto` and is deployed on **Vercel**. Push to `main` to trigger a deploy. Make sure your Supabase environment variables are configured in Vercel's project settings.

## License

Private project.

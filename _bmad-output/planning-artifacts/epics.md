---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
status: 'complete'
completedAt: '2026-01-23'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
---

# Budget_planner - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Budget_planner, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Account & Patrimoine Management**
- FR1: User can add a bank account with name, type, and current balance
- FR2: User can edit an existing account's details
- FR3: User can delete an account
- FR4: User can view total patrimoine (sum of all accounts) on dashboard
- FR5: User can update account balances manually

**Budget Management**
- FR6: User can create budget categories with custom names
- FR7: User can edit category names
- FR8: User can delete categories (with confirmation)
- FR9: User can allocate a monthly budget amount to each category
- FR10: User can adjust budget allocations (intended for monthly setup)
- FR10b: System does not prompt or encourage budget changes during the month
- FR11: User can enter monthly income amount

**Expense Tracking**
- FR12: User can add an expense with amount, category, and date
- FR13: User can add an optional description to an expense
- FR14: User can edit an existing expense
- FR15: User can delete an expense
- FR16: User can view expense history filtered by category
- FR17: User can view expense history filtered by date range

**Visual Dashboard & Gauges**
- FR18: User can view all budget categories as visual gauges on dashboard
- FR19: User can see each gauge's current percentage (spent/budget)
- FR20: User can see gauges that exceed 100% (overspent) with distinct visual feedback
- FR21: User can see remaining amount for each category
- FR22: User can see gauges animate when values change
- FR23: User can see color changes as gauges fill (progression visuelle)

**Savings Goals**
- FR24: User can create a savings goal with name and target amount
- FR25: User can optionally set a target date for a savings goal
- FR26: User can allocate monthly amount toward a savings goal
- FR27: User can view savings progress as a gauge that fills up
- FR28: User can edit a savings goal's details
- FR29: User can delete a savings goal
- FR30: User can view projected completion date based on current pace

**Monthly Planning & Review**
- FR31: User can view monthly recap showing all categories with final percentages
- FR32: User can compare budget vs actual for each category
- FR33: User can identify over-budget and under-budget categories
- FR34: User can view savings progress for the month
- FR35: User can view simple savings projections

**Fixed Expenses / Subscriptions (P3 - If Time)**
- FR36: User can add a recurring expense with name, amount, and day of month
- FR37: User can edit a recurring expense
- FR38: User can delete a recurring expense
- FR39: User can view total fixed expenses for current month

**User Authentication**
- FR40: User can sign in using Google account
- FR41: User can sign out
- FR42: User can remain signed in across sessions (persistent login)

**Data Synchronization**
- FR43: User's data is automatically saved after each change
- FR44: User's data syncs across devices when online
- FR45: User's data is preserved locally if offline, then synced when reconnected

### NonFunctional Requirements

**Performance**
- NFR1: Dashboard loads in < 2 seconds
- NFR2: Expense entry saves in < 500ms
- NFR3: Gauge animations run at 60fps
- NFR4: App remains responsive during data sync
- NFR5: Lighthouse Performance score > 90

**Security**
- NFR6: All data transmitted over HTTPS
- NFR7: Authentication via Google OAuth only
- NFR8: User can only access their own data (Row Level Security)
- NFR9: No sensitive data stored in localStorage (only sync buffer)
- NFR10: Session expires after 30 days of inactivity

**Reliability & Data Integrity**
- NFR11: Zero data loss - all entries persisted locally before sync
- NFR12: Offline entries sync automatically when connection restored
- NFR13: Data conflicts resolved with "last write wins" strategy
- NFR14: Application available 99%+ of time

**Usability**
- NFR15: UI consistent with DaisyUI design system
- NFR16: All interactive elements have visible feedback
- NFR17: Error messages are clear and actionable
- NFR18: App works without page refresh (SPA behavior)

### Additional Requirements

**From Architecture - Starter Template:**
- Project initialization with Official SvelteKit + curated setup
- TypeScript strict mode with Svelte 5 runes
- Tailwind CSS + DaisyUI theming
- @vite-pwa/sveltekit for PWA support
- Supabase client (@supabase/supabase-js, @supabase/ssr)
- Vercel adapter for deployment

**From Architecture - Data Layer:**
- Centralized data layer in `src/lib/data/`
- All functions return `{ data, error }` format
- Zod validation for all inputs
- LocalStorage-first writes for offline support
- Sync queue pattern for offline operations

**From Architecture - State Management:**
- Svelte 5 Runes ($state, $derived) for reactive state
- Auth state in `auth.svelte.ts`
- Budget state in `budget.svelte.ts`
- Sync queue in `sync-queue.ts`

**From Architecture - Database:**
- PostgreSQL via Supabase
- Row Level Security (user_id = auth.uid())
- Snake_case for all DB columns/tables
- SQL migrations in `supabase/migrations/`

**From Architecture - Project Structure:**
- Complete file structure defined (~50 files)
- Component organization: gauges/, forms/, ui/, dashboard/
- Routes: /, /auth, /expenses, /budget, /accounts, /goals, /monthly-recap

**From UX - Visual Design:**
- Warm color palette: Sage (#639A88), Linen (#FAF7F2), Terracotta (#C07D5A)
- Inter font family
- Soft shadow system (warm-tinted)
- Gauge display shows "% restant" (positive framing)

**From UX - Layout:**
- Fixed sidebar (240px) + sticky header
- Dashboard cards: Budget du mois, Répartition, Patrimoine + Épargne, Extras, Budgets par catégorie
- Circular gauges (220px main, 80px mini)

**From UX - Interactions:**
- Gauge animations: 300-400ms ease-in-out
- Card hover: 150ms translateY(-1px) + shadow
- Page transitions: 200ms ease-out
- Toast notifications for feedback

**From UX - User Flows:**
- 5-step onboarding: Welcome → Comptes → Revenus → Budgets → C'est parti
- Expense entry modal with category budget preview
- Monthly planning with previous month comparison
- Budget overflow (>100%) shows informative orange, not alarming red
- Savings goals with detailed budget breakdown (transport, lodging, food, etc.)

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 2 | Add bank account |
| FR2 | Epic 2 | Edit account details |
| FR3 | Epic 2 | Delete account |
| FR4 | Epic 2 | View total patrimoine |
| FR5 | Epic 2 | Update account balances |
| FR6 | Epic 3 | Create budget categories |
| FR7 | Epic 3 | Edit category names |
| FR8 | Epic 3 | Delete categories |
| FR9 | Epic 3 | Allocate monthly budget |
| FR10 | Epic 3 | Adjust budget allocations |
| FR10b | Epic 3 | No mid-month prompts |
| FR11 | Epic 3 | Enter monthly income |
| FR12 | Epic 4 | Add expense |
| FR13 | Epic 4 | Add description to expense |
| FR14 | Epic 4 | Edit expense |
| FR15 | Epic 4 | Delete expense |
| FR16 | Epic 4 | Filter by category |
| FR17 | Epic 4 | Filter by date range |
| FR18 | Epic 4 | View gauges on dashboard |
| FR19 | Epic 4 | See gauge percentage |
| FR20 | Epic 4 | See >100% overflow |
| FR21 | Epic 4 | See remaining amount |
| FR22 | Epic 4 | See gauge animations |
| FR23 | Epic 4 | See color progression |
| FR24 | Epic 5 | Create savings goal |
| FR25 | Epic 5 | Set target date |
| FR26 | Epic 5 | Allocate monthly savings |
| FR27 | Epic 5 | View savings gauge |
| FR28 | Epic 5 | Edit savings goal |
| FR29 | Epic 5 | Delete savings goal |
| FR30 | Epic 5 | View projected completion |
| FR31 | Epic 6 | View monthly recap |
| FR32 | Epic 6 | Compare budget vs actual |
| FR33 | Epic 6 | Identify over/under budget |
| FR34 | Epic 6 | View savings progress |
| FR35 | Epic 6 | View savings projections |
| FR36 | Post-MVP | Add recurring expense |
| FR37 | Post-MVP | Edit recurring expense |
| FR38 | Post-MVP | Delete recurring expense |
| FR39 | Post-MVP | View fixed expenses total |
| FR40 | Epic 1 | Sign in with Google |
| FR41 | Epic 1 | Sign out |
| FR42 | Epic 1 | Persistent login |
| FR43 | Epic 1+ | Auto-save (woven into all) |
| FR44 | Epic 1+ | Cross-device sync (woven into all) |
| FR45 | Epic 1+ | Offline persistence (woven into all) |

## Epic List

### Epic 1: Project Setup & Authentication
**Goal:** User can sign in securely and have their own private financial space.

This epic establishes the foundation: project scaffolding, database schema, authentication flow, and the base layout that all other features build upon.

**FRs covered:** FR40, FR41, FR42
**Infrastructure:** FR43, FR44, FR45 (sync foundation woven into data layer)

---

### Epic 2: Patrimoine & Account Management
**Goal:** User can see all their accounts and track their total net worth in one place.

Enables the user to build a complete picture of their financial situation by adding bank accounts, viewing total patrimoine, and updating balances.

**FRs covered:** FR1, FR2, FR3, FR4, FR5

---

### Epic 3: Budget Categories & Allocation
**Goal:** User can define their monthly income and decide how to distribute it across budget categories.

Sets up the budgeting framework: income configuration, category creation, and budget allocation. This is the planning foundation for tracking.

**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR10b, FR11

---

### Epic 4: Expense Tracking & Live Dashboard
**Goal:** User can log their spending and watch their budget gauges respond in real-time.

This is the **core daily loop** - the heart of Budget_planner. Users enter expenses, view their history, and see animated gauges that provide immediate, non-judgmental feedback on their spending.

**FRs covered:** FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23

---

### Epic 5: Savings Goals & Projections
**Goal:** User can set savings goals and track their progress toward them.

Enables goal-based saving with progress visualization, optional target dates, and projected completion. Includes detailed budget breakdown for complex goals (like vacations).

**FRs covered:** FR24, FR25, FR26, FR27, FR28, FR29, FR30

---

### Epic 6: Monthly Review & Planning
**Goal:** User can review their spending patterns and make data-driven decisions for the next month.

Provides the monthly ritual: reviewing what happened, comparing budget vs actual, and using insights to calibrate future budgets.

**FRs covered:** FR31, FR32, FR33, FR34, FR35

---

### Post-MVP: Fixed Expenses & Subscriptions
**Goal:** User can track recurring bills so they know what's already committed each month.

Deferred to post-MVP. Can be done manually initially. Straightforward CRUD feature to add later.

**FRs covered:** FR36, FR37, FR38, FR39

---

## Epic 1: Project Setup & Authentication

**Goal:** User can sign in securely and have their own private financial space.

This epic establishes the foundation: project scaffolding, database schema, authentication flow, and the base layout that all other features build upon.

### Story 1.1: Project Initialization

As a developer,
I want to scaffold the Budget_planner project with all required dependencies,
So that I have a working development environment to build upon.

**Acceptance Criteria:**

**Given** I have Node.js 18+ installed
**When** I run the project initialization commands
**Then** a SvelteKit project is created with TypeScript strict mode
**And** Tailwind CSS + DaisyUI are configured and working
**And** @vite-pwa/sveltekit is installed and configured
**And** @supabase/supabase-js and @supabase/ssr are installed
**And** the project structure matches the Architecture specification
**And** `npm run dev` starts the development server without errors
**And** a basic "Hello Budget_planner" page renders at localhost

**Technical Notes:**
- Follow initialization commands from Architecture document
- Create folder structure: `src/lib/components/`, `src/lib/data/`, `src/lib/stores/`, `src/lib/schemas/`, `src/lib/utils/`, `src/lib/types/`
- Configure Tailwind with custom color palette (Sage, Linen, Terracotta)
- Set up Inter font

---

### Story 1.2: Supabase Setup & User Schema

As a developer,
I want to set up Supabase with the initial database schema,
So that user data can be securely stored and isolated.

**Acceptance Criteria:**

**Given** the project is initialized (Story 1.1)
**When** I configure Supabase connection
**Then** environment variables are set up (.env.local with SUPABASE_URL, SUPABASE_ANON_KEY)
**And** a Supabase client is created in `src/lib/supabase.ts`
**And** a `profiles` table exists with columns: id (uuid, FK to auth.users), created_at, updated_at
**And** Row Level Security is enabled on the profiles table
**And** RLS policy ensures users can only access their own profile (auth.uid() = id)
**And** SQL migration file is saved in `supabase/migrations/`

**Technical Notes:**
- Use Supabase Dashboard to create project
- Generate TypeScript types for database schema
- Test RLS policies work correctly

---

### Story 1.3: Google OAuth Sign-In

As a user,
I want to sign in with my Google account,
So that I can access my personal financial data securely.

**Acceptance Criteria:**

**Given** I am on the login page (`/auth`)
**When** I click the "Sign in with Google" button
**Then** I am redirected to Google's OAuth consent screen
**And** after authorizing, I am redirected back to the app
**And** my session is established
**And** I am redirected to the dashboard (`/`)
**And** a profile record is created for me if it's my first sign-in

**Given** I am not authenticated
**When** I try to access any protected route
**Then** I am redirected to the login page

**Given** Google OAuth fails (user cancels or error)
**When** I am redirected back to the app
**Then** I see a clear error message
**And** I remain on the login page

**Technical Notes:**
- Implement `/auth/callback` route for OAuth callback
- Use @supabase/ssr for cookie-based session handling
- Create auth layout that doesn't require authentication

---

### Story 1.4: Session Persistence & Sign-Out

As a user,
I want my session to persist across browser sessions and be able to sign out,
So that I don't have to log in every time and can securely end my session.

**Acceptance Criteria:**

**Given** I am signed in
**When** I close the browser and reopen it
**Then** I am still signed in (session persists for up to 30 days)

**Given** I am signed in
**When** I click the "Sign out" button
**Then** my session is terminated
**And** I am redirected to the login page
**And** I cannot access protected routes without signing in again

**Given** my session has expired (30 days of inactivity)
**When** I try to access a protected route
**Then** I am redirected to the login page
**And** I see a message indicating my session expired

**Technical Notes:**
- Implement `/auth/logout` server route
- Session duration configured via Supabase (30 days per NFR10)
- Clear all client-side auth state on logout

---

### Story 1.5: Base Layout & Navigation

As a user,
I want to see a consistent navigation layout across the app,
So that I can easily navigate between different sections.

**Acceptance Criteria:**

**Given** I am signed in
**When** I view any page in the app
**Then** I see a fixed sidebar (240px) on the left with navigation links
**And** I see a sticky header at the top with the current month and an "Add" button
**And** the main content area is scrollable

**Given** I am viewing the sidebar
**When** I look at the navigation items
**Then** I see links for: Dashboard, Transactions, Budgets, Patrimoine, Objectifs
**And** I see a separator followed by: Préférences
**And** I see a Sign Out option

**Given** I click a navigation link
**When** the page changes
**Then** the transition is smooth (200ms ease-out)
**And** the active link is visually highlighted

**Given** any action triggers feedback
**When** the action completes or fails
**Then** a toast notification appears with the appropriate message
**And** the toast auto-dismisses after 3 seconds (or can be manually dismissed)

**Technical Notes:**
- Create `src/lib/components/ui/navbar.svelte` for sidebar
- Create `src/lib/components/ui/toast.svelte` for notifications
- Implement in `src/routes/+layout.svelte`
- Use DaisyUI components where appropriate
- Apply warm color palette and Inter font
- Header shows current month in format "Janvier 2026"

---

## Epic 2: Patrimoine & Account Management

**Goal:** User can see all their accounts and track their total net worth in one place.

Enables the user to build a complete picture of their financial situation by adding bank accounts, viewing total patrimoine, and updating balances as values change.

### Story 2.1: Add Bank Account

As a user,
I want to add a bank account with a name and current balance,
So that I can start tracking my total patrimoine.

**Acceptance Criteria:**

**Given** I am signed in
**When** I navigate to the Patrimoine page
**Then** I see an "Add Account" button

**Given** I click "Add Account"
**When** the modal opens
**Then** I see a form with fields for: Account name (text), Current balance (number)

**Given** I fill in the account form with valid data
**When** I click "Add"
**Then** the account is saved to the database
**And** I see the new account in my accounts list
**And** a success toast appears

**Given** I try to add an account with empty name or invalid balance
**When** I click "Add"
**Then** I see inline validation errors
**And** the account is not saved

**Technical Notes:**
- Create `accounts` table: id (uuid), user_id (FK), name (text), balance (numeric), created_at, updated_at
- RLS policy: users can only CRUD their own accounts
- Create `src/lib/data/accounts.ts` with `{ data, error }` response pattern
- Create Zod schema in `src/lib/schemas/account.ts`
- Create `src/lib/components/forms/account-form.svelte`

---

### Story 2.2: View Accounts & Total Patrimoine

As a user,
I want to see all my accounts and my total patrimoine,
So that I have a clear picture of my financial situation.

**Acceptance Criteria:**

**Given** I am signed in and have added accounts
**When** I navigate to the Patrimoine page
**Then** I see a list of all my accounts with their names and balances
**And** I see my total patrimoine (sum of all account balances) prominently displayed

**Given** I have no accounts yet
**When** I view the Patrimoine page
**Then** I see an empty state encouraging me to add my first account
**And** the total patrimoine shows 0 €

**Given** I have multiple accounts
**When** I view the total
**Then** the sum is calculated correctly
**And** the display updates reactively when accounts change

**Technical Notes:**
- Create `/routes/accounts/+page.svelte`
- Use $derived rune for total calculation
- Format currency with `utils/currency.ts` (formatCurrency)

---

### Story 2.3: Edit Account Details & Update Balance

As a user,
I want to edit my account's name and update its balance,
So that I can keep my patrimoine accurate as values change over time.

**Acceptance Criteria:**

**Given** I am viewing my accounts list
**When** I click on an account (or an edit button)
**Then** a modal opens with the current account details pre-filled

**Given** I am editing an account
**When** I change the name and/or balance
**And** I click "Save"
**Then** the account is updated in the database
**And** the accounts list reflects the changes
**And** the total patrimoine updates immediately
**And** a success toast appears

**Given** I change my investment account balance from 500€ to 650€
**When** I save
**Then** my total patrimoine increases by 150€

**Technical Notes:**
- Reuse account-form.svelte in edit mode
- Implement `updateAccount` in data layer
- Optimistic UI update for responsiveness

---

### Story 2.4: Delete Account

As a user,
I want to delete an account I no longer need,
So that my patrimoine only reflects my current accounts.

**Acceptance Criteria:**

**Given** I am viewing my accounts
**When** I click the delete button on an account
**Then** a confirmation dialog appears asking "Delete [Account Name]?"

**Given** I confirm the deletion
**When** I click "Delete"
**Then** the account is removed from the database
**And** the account disappears from my list
**And** the total patrimoine updates
**And** a success toast appears

**Given** I cancel the deletion
**When** I click "Cancel"
**Then** the account remains unchanged
**And** the dialog closes

**Technical Notes:**
- Create confirmation modal component
- Implement `deleteAccount` in data layer
- Cascade considerations: accounts standalone, no linked expenses

---

### Story 2.5: Patrimoine Dashboard Card

As a user,
I want to see my total patrimoine on the main dashboard,
So that I have instant visibility of my net worth.

**Acceptance Criteria:**

**Given** I am signed in and on the dashboard
**When** I view the Patrimoine card
**Then** I see my total patrimoine displayed prominently with large typography
**And** the card has a green gradient background (Sage to Accent)
**And** I see a monthly change indicator (+ or - from last month)

**Given** I have no accounts
**When** I view the Patrimoine card
**Then** I see 0 € with a prompt to add accounts

**Given** my patrimoine increased this month
**When** I view the card
**Then** the change is shown in green with a + sign

**Given** my patrimoine decreased this month
**When** I view the card
**Then** the change is shown in a neutral color (not alarming)

**Technical Notes:**
- Create `src/lib/components/dashboard/patrimoine-card.svelte`
- Green gradient: from Sage (#639A88) to Accent (#3D6B5A)
- Monthly change calculation: compare current total to total at start of month
- Store monthly snapshots in `patrimoine_history` table (id, user_id, month, total, created_at)

---

## Epic 3: Budget Categories & Allocation

**Goal:** User can define their monthly income and decide how to distribute it across budget categories.

Sets up the budgeting framework: income configuration, category creation, and budget allocation. This is the planning foundation for expense tracking.

### Story 3.1: Set Monthly Income

As a user,
I want to enter my monthly income,
So that I know how much money I have to allocate across my budgets.

**Acceptance Criteria:**

**Given** I am signed in
**When** I navigate to the Budget setup page
**Then** I see a field to enter my monthly income

**Given** I enter a valid income amount (e.g., 2800 €)
**When** I save
**Then** the income is stored for the current month
**And** a success toast confirms the save

**Given** I have set my income
**When** I view the budget page
**Then** I see my income displayed at the top
**And** this becomes the base for calculating "remaining" during allocation

**Given** it's a new month
**When** I access budget setup
**Then** I see my previous month's income pre-filled (I can adjust if needed)

**Technical Notes:**
- Create `monthly_budgets` table: id, user_id, month (YYYY-MM), income, created_at, updated_at
- Create data layer functions in `src/lib/data/budgets.ts`
- Month format: "2026-01" for January 2026

---

### Story 3.2: Create Budget Category

As a user,
I want to create budget categories with custom names,
So that I can organize my spending in a way that makes sense to me.

**Acceptance Criteria:**

**Given** I am on the Budget page
**When** I click "Add Category"
**Then** a modal opens with a form for category name

**Given** I enter a category name (e.g., "Courses alimentaires")
**When** I click "Create"
**Then** the category is saved
**And** it appears in my categories list
**And** it has a default budget of 0 € (to be allocated)

**Given** I try to create a category with an empty name
**When** I click "Create"
**Then** I see a validation error
**And** the category is not created

**Given** I try to create a category with a duplicate name
**When** I click "Create"
**Then** I see an error "Category already exists"

**Technical Notes:**
- Create `budget_categories` table: id, user_id, name, color (optional), icon (optional), created_at
- RLS: users can only access their own categories
- Predefined color palette for categories (auto-assign or user-select)
- Create `src/lib/data/categories.ts`

---

### Story 3.3: Allocate Budget Amounts

As a user,
I want to allocate specific amounts to each category and see what's remaining,
So that I can distribute my income across my expenses.

**Acceptance Criteria:**

**Given** I have set my income and created categories
**When** I view the budget allocation page
**Then** I see each category with an input field for the budget amount
**And** I see a visual bar showing what percentage of income is allocated
**And** I see "Remaining: X €" updating in real-time

**Given** I allocate 600 € to "Courses" out of 2800 € income
**When** I view the allocation
**Then** I see "Courses: 600 €" with a bar showing ~21%
**And** "Remaining: 2200 €"

**Given** I allocate more than my income total
**When** the total exceeds income
**Then** "Remaining" shows a negative value in orange
**And** no error blocks me (it's informational)

**Given** I finish allocating
**When** I click "Save"
**Then** all allocations are saved for the current month
**And** a success toast appears

**Technical Notes:**
- Create `category_budgets` table: id, category_id, month (YYYY-MM), amount, created_at, updated_at
- Use $derived for real-time remaining calculation
- Visual bars use Tailwind width utilities or inline styles

---

### Story 3.4: Edit Category Name & Budget

As a user,
I want to edit my category names and budget amounts,
So that I can refine my budget structure over time.

**Acceptance Criteria:**

**Given** I am viewing my categories
**When** I click edit on a category
**Then** I can modify the category name

**Given** I change a category name from "Resto" to "Restaurant & Sorties"
**When** I save
**Then** the name updates everywhere it appears
**And** historical expenses remain linked to this category

**Given** I am on the budget allocation page
**When** I change an allocation amount
**Then** the "Remaining" recalculates immediately
**And** I can save the new allocation

**Given** it's mid-month and I want to change allocations
**When** I edit
**Then** I CAN make changes (no system block)
**But** the system does NOT prompt or encourage mid-month changes (FR10b)

**Technical Notes:**
- Category name edit: update `budget_categories` table
- Budget amount edit: update `category_budgets` for current month
- No "suggestion" UI for mid-month changes - neutral editing

---

### Story 3.5: Delete Budget Category

As a user,
I want to delete a budget category I no longer need,
So that my budget structure stays clean and relevant.

**Acceptance Criteria:**

**Given** I am viewing my categories
**When** I click delete on a category
**Then** a confirmation dialog appears with warning about linked expenses

**Given** the category has expenses linked to it
**When** I see the confirmation
**Then** the warning states "This category has X expenses. They will become uncategorized."

**Given** I confirm deletion
**When** I click "Delete"
**Then** the category is removed
**And** linked expenses have their category set to null (uncategorized)
**And** the budget allocation is removed
**And** a success toast appears

**Given** I cancel the deletion
**When** I click "Cancel"
**Then** nothing changes

**Technical Notes:**
- Soft handling of linked expenses: set category_id to null, don't delete expenses
- Update "Remaining" calculation after deletion
- Consider: show "Uncategorized" in expense list for orphaned expenses

---

## Epic 4: Expense Tracking & Live Dashboard

**Goal:** User can log their spending and watch their budget gauges respond in real-time.

This is the **core daily loop** - the heart of Budget_planner. Users enter expenses, view their history, and see animated gauges that provide immediate, non-judgmental feedback on their spending.

### Story 4.1: Add Expense (Basic)

As a user,
I want to add an expense with amount, category, and date,
So that I can track my spending.

**Acceptance Criteria:**

**Given** I am signed in
**When** I click the "+ Ajouter" button in the header
**Then** an expense entry form/modal opens

**Given** I am adding an expense
**When** I fill in: amount (47.50 €), category (Courses), date (today by default)
**And** I click "Add"
**Then** the expense is saved to the database
**And** a success toast appears
**And** the form resets for another entry (stay in modal)

**Given** I want to add an optional description
**When** I fill in the description field
**Then** it is saved with the expense

**Given** I submit with missing required fields
**When** I click "Add"
**Then** I see validation errors for amount and category
**And** the expense is not saved

**Technical Notes:**
- Create `expenses` table: id, user_id, category_id (nullable FK), amount, description (nullable), date, created_at, updated_at
- RLS: users can only access their own expenses
- Create `src/lib/data/expenses.ts`
- Create Zod schema in `src/lib/schemas/expense.ts`
- Date picker defaults to today

---

### Story 4.2: Expense Entry Modal with Budget Preview

As a user,
I want to see how much budget remains in a category when adding an expense,
So that I can make informed spending decisions.

**Acceptance Criteria:**

**Given** I am adding an expense
**When** I select a category (e.g., "Courses")
**Then** I see a preview showing: Budget: 600 € | Dépensé: 312 € | Reste: 288 €
**And** I see a small progress bar showing 52% utilized

**Given** I enter an amount that would exceed the budget
**When** I view the preview
**Then** the preview updates to show the projected overage
**And** no blocking warning - just informational display

**Given** I change the category selection
**When** I select a different category
**Then** the budget preview updates to reflect the new category's status

**Technical Notes:**
- Real-time calculation using $derived
- Reuse gauge color logic for the preview bar
- Query current month's expenses for the selected category

---

### Story 4.3: View Expense History List

As a user,
I want to see a list of my expenses,
So that I can review my spending history.

**Acceptance Criteria:**

**Given** I am signed in
**When** I navigate to the Transactions page
**Then** I see a list of my expenses sorted by date (most recent first)
**And** each expense shows: date, description (or category if no description), category badge, amount

**Given** I have many expenses
**When** I view the list
**Then** the list is paginated or virtualized for performance
**And** I can scroll through all my expenses

**Given** I have no expenses yet
**When** I view the Transactions page
**Then** I see an empty state encouraging me to add my first expense

**Technical Notes:**
- Create `/routes/expenses/+page.svelte`
- Load expenses with category names joined
- Consider pagination (20-50 per page) or infinite scroll

---

### Story 4.4: Filter Expenses by Category & Date

As a user,
I want to filter my expenses by category and date range,
So that I can analyze specific spending patterns.

**Acceptance Criteria:**

**Given** I am viewing my expense history
**When** I select a category filter (e.g., "Resto")
**Then** only expenses in that category are shown
**And** I see the total for the filtered expenses

**Given** I am viewing my expense history
**When** I select a date range (e.g., "This month", "Last month", or custom range)
**Then** only expenses within that range are shown

**Given** I apply both category and date filters
**When** I view the results
**Then** both filters are applied (AND logic)
**And** I can clear filters to see all expenses again

**Given** no expenses match my filters
**When** I view the results
**Then** I see "No expenses match your filters"

**Technical Notes:**
- Filter controls at top of expense list
- Date range presets: "This month", "Last month", "Last 3 months", "Custom"
- Category dropdown with "All categories" option
- URL params for shareable filter state (optional)

---

### Story 4.5: Edit & Delete Expenses

As a user,
I want to edit or delete an expense,
So that I can correct mistakes or remove erroneous entries.

**Acceptance Criteria:**

**Given** I am viewing my expense history
**When** I click on an expense
**Then** I can edit its details (amount, category, date, description)

**Given** I edit an expense
**When** I save
**Then** the expense is updated
**And** any affected budget gauges update
**And** a success toast appears

**Given** I want to delete an expense
**When** I click delete
**Then** a confirmation appears
**And** upon confirmation, the expense is removed
**And** budget gauges update to reflect the removal

**Given** I delete an expense from a category that was over 100%
**When** the deletion brings it under 100%
**Then** the gauge updates to reflect the new, healthy state

**Technical Notes:**
- Edit via modal or inline editing
- Implement `updateExpense` and `deleteExpense` in data layer
- Cascade gauge updates reactively via stores

---

### Story 4.6: Dashboard with Budget Gauges (Basic)

As a user,
I want to see all my budget categories as gauges on the dashboard,
So that I can instantly see where I stand.

**Acceptance Criteria:**

**Given** I am signed in and on the dashboard
**When** I view the "Budgets par catégorie" section
**Then** I see a grid of circular gauges (one per category)
**And** each gauge shows: category name, amount spent / budget, percentage

**Given** a category has 312 € spent of 600 € budget
**When** I view its gauge
**Then** the gauge shows 52% filled
**And** the remaining amount (288 €) is visible

**Given** I have 6 categories
**When** I view the dashboard
**Then** I see 6 mini gauges arranged in a grid (2-3 columns)

**Given** I have no categories or budgets set
**When** I view the dashboard
**Then** I see a prompt to set up my budget

**Technical Notes:**
- Create `src/lib/components/gauges/circular-gauge.svelte`
- SVG-based circular gauge with stroke-dasharray
- Mini gauges: 80px diameter
- Create `src/lib/components/dashboard/budget-overview.svelte`

---

### Story 4.7: Gauge Animations & Color Progression

As a user,
I want gauges to animate smoothly and change color based on my spending,
So that I get satisfying, informative visual feedback.

**Acceptance Criteria:**

**Given** I add an expense
**When** I return to the dashboard
**Then** the affected gauge animates smoothly from the old percentage to the new
**And** the animation takes 300-400ms with ease-in-out timing

**Given** my spending is 0-75% of budget (healthy)
**When** I view the gauge
**Then** the gauge color is Sage (#639A88)

**Given** my spending is 75-100% of budget (caution)
**When** I view the gauge
**Then** the gauge color is Warm Amber (#D4A04D)

**Given** my spending exceeds 100% of budget (over)
**When** I view the gauge
**Then** the gauge color is Soft Terracotta (#C07D5A)
**And** the gauge displays >100% (e.g., "112%")
**And** there is NO alarming red or negative messaging

**Given** my spending changes and crosses a threshold
**When** I view the gauge
**Then** the color transition is smooth, not jarring

**Technical Notes:**
- Svelte transitions for animation
- Create `src/lib/components/gauges/gauge-colors.ts` for threshold logic
- CSS transitions for color changes
- 60fps animation performance (NFR3)

---

### Story 4.8: Category Breakdown Donut Chart

As a user,
I want to see a donut chart showing how my spending is distributed across categories,
So that I can understand my spending patterns at a glance.

**Acceptance Criteria:**

**Given** I am on the dashboard
**When** I view the "Répartition des dépenses" card
**Then** I see a donut chart showing category breakdown
**And** each segment is colored by category
**And** I see a legend with category names and percentages

**Given** I hover over a segment
**When** I view the chart
**Then** the segment highlights
**And** I see the exact amount and percentage

**Given** I have no expenses this month
**When** I view the chart
**Then** I see an empty state or placeholder

**Given** my spending is: Courses 40%, Resto 25%, Transport 15%, Autres 20%
**When** I view the chart
**Then** segments are sized proportionally
**And** the legend is sorted by value (highest first)

**Technical Notes:**
- SVG-based donut chart or lightweight chart library
- Create `src/lib/components/dashboard/expense-breakdown.svelte`
- Calculate percentages from current month's expenses
- Category colors from predefined palette

---

## Epic 5: Savings Goals & Projections

**Goal:** User can set savings goals and track their progress toward them.

Enables goal-based saving with progress visualization, optional target dates, and projected completion. Includes optional detailed budget breakdown for complex goals (like vacations).

### Story 5.1: Create Savings Goal

As a user,
I want to create a savings goal with a name and target amount,
So that I can save toward something specific.

**Acceptance Criteria:**

**Given** I am signed in
**When** I navigate to Objectifs page and click "New Goal"
**Then** a form/modal opens for creating a goal

**Given** I fill in goal name ("Voyage Japon") and target amount (2500 €)
**When** I click "Create"
**Then** the goal is saved
**And** it appears in my goals list with 0% progress
**And** a success toast appears

**Given** I create a goal without a detailed breakdown
**When** I view the goal
**Then** I see the simple target amount (2500 €)
**And** there's no breakdown displayed (simple mode)

**Given** I try to create a goal with empty name or zero amount
**When** I click "Create"
**Then** I see validation errors

**Technical Notes:**
- Create `savings_goals` table: id, user_id, name, target_amount, target_date (nullable), current_amount (default 0), created_at, updated_at
- Create `src/lib/data/goals.ts`
- Create Zod schema in `src/lib/schemas/goal.ts`

---

### Story 5.2: Set Target Date & View Projections

As a user,
I want to optionally set a target date and see how much I need to save monthly,
So that I can plan my savings pace.

**Acceptance Criteria:**

**Given** I am creating or editing a goal
**When** I optionally set a target date (e.g., April 2026)
**Then** the date is saved with the goal

**Given** my goal has a target date
**When** I view the goal
**Then** I see a projection: "X €/month needed to reach goal by [date]"
**And** I see how many months remain

**Given** my goal is 2500 € with 1800 € saved, target April 2026 (3 months away)
**When** I view the projection
**Then** I see "≈ 234 €/month needed" (700 € ÷ 3 months)

**Given** my goal has no target date
**When** I view the goal
**Then** I see progress but no monthly projection
**And** I can add a target date anytime

**Given** I've already passed the target date but haven't reached the goal
**When** I view the goal
**Then** the projection shows "Target date passed" without judgment

**Technical Notes:**
- Projection calculation: (target_amount - current_amount) / months_remaining
- Handle edge cases: past dates, 0 months remaining
- Display with formatCurrency utility

---

### Story 5.3: Optional Detailed Budget Breakdown

As a user,
I want to optionally break down my savings goal into sub-categories,
So that I can better estimate how much I actually need for complex goals.

**Acceptance Criteria:**

**Given** I am creating or editing a goal
**When** I see the form
**Then** I see an optional "Détailler le budget" section (collapsed by default)

**Given** I click "Détailler le budget"
**When** the section expands
**Then** I can add line items: name + amount (e.g., "Transport - 800 €")
**And** I can add multiple lines
**And** I see a running total that auto-calculates

**Given** I add breakdown items: Transport 800 €, Logement 900 €, Nourriture 400 €
**When** I view the total
**Then** it shows 2100 € (sum of all items)
**And** this becomes the goal's target amount

**Given** I have a detailed breakdown
**When** I view the goal later
**Then** I see the breakdown with each item and amount
**And** I can edit or remove items

**Given** I don't want to detail my budget
**When** I skip the breakdown section
**Then** the goal works with just the simple target amount
**And** no breakdown is stored or displayed

**Technical Notes:**
- Create `goal_breakdown_items` table: id, goal_id (FK), name, amount, created_at
- Breakdown is optional - goal can exist without items
- If breakdown exists, target_amount = SUM(items)
- UI: collapsible section, "+" button to add lines

---

### Story 5.4: Allocate & Track Monthly Savings

As a user,
I want to add money to my savings goals and track my progress,
So that I can see my savings grow over time.

**Acceptance Criteria:**

**Given** I have a savings goal
**When** I view the goal
**Then** I see a button to "Add savings" or "Update progress"

**Given** I click to add savings
**When** I enter an amount (e.g., 200 €)
**Then** the goal's current_amount increases by 200 €
**And** the progress percentage updates
**And** a success toast appears

**Given** my goal has target 2500 € and current 1800 €
**When** I add 200 €
**Then** current becomes 2000 €
**And** progress shows 80%

**Given** my savings exceed the target (e.g., 2600 € of 2500 € goal)
**When** I view the goal
**Then** it shows 104% complete
**And** this is displayed positively (goal achieved!)

**Technical Notes:**
- Update current_amount in savings_goals table
- Consider: savings_transactions table for history (optional for MVP)
- For MVP: simple running total, not detailed transaction history

---

### Story 5.5: Savings Progress Gauge on Dashboard

As a user,
I want to see my savings progress on the dashboard,
So that I can stay motivated by seeing my goals grow.

**Acceptance Criteria:**

**Given** I am on the dashboard
**When** I view the Patrimoine + Épargne card
**Then** I see a mini savings gauge showing my primary goal's progress

**Given** I have a goal "Voyage Japon" at 72% (1800 € / 2500 €)
**When** I view the dashboard
**Then** I see the gauge filled to 72%
**And** I see "Objectif épargne: 1800 € / 2500 €"

**Given** I have multiple goals
**When** I view the dashboard
**Then** I see the most relevant goal (active, closest to target date, or most recently updated)
**And** I can click to see all goals

**Given** I have no savings goals
**When** I view the dashboard
**Then** I see a prompt to create my first goal

**Technical Notes:**
- Savings gauge fills UP (opposite of budget gauges that "drain")
- Green/Eucalyptus color (#5AAA8C) for savings progress
- Integrate into patrimoine-card.svelte or create savings-progress.svelte

---

### Story 5.6: Edit & Delete Savings Goals

As a user,
I want to edit or delete my savings goals,
So that I can adjust my plans as life changes.

**Acceptance Criteria:**

**Given** I am viewing a goal
**When** I click "Edit"
**Then** I can modify: name, target amount, target date, breakdown items

**Given** I edit a goal's target amount
**When** I save
**Then** the progress percentage recalculates
**And** the projection updates if there's a target date

**Given** I want to delete a goal
**When** I click "Delete"
**Then** a confirmation dialog appears

**Given** I confirm deletion
**When** I click "Delete"
**Then** the goal and its breakdown items are removed
**And** a success toast appears

**Given** I cancel deletion
**When** I click "Cancel"
**Then** nothing changes

**Technical Notes:**
- Cascade delete: removing goal removes breakdown items
- Edit modal reuses goal form with pre-filled data
- Implement updateGoal, deleteGoal in data layer

---

## Epic 6: Monthly Review & Planning

**Goal:** User can review their spending patterns and make data-driven decisions for the next month.

Provides the monthly ritual: reviewing what happened, comparing budget vs actual, and using insights to calibrate future budgets.

**FRs covered:** FR31, FR32, FR33, FR34, FR35

**Integration Notes (based on existing codebase):**
- New data layer: `src/lib/data/analytics.ts` for recap-specific queries
- Reuse existing components: `CircularGauge.svelte`, `MonthYearPicker.svelte`
- Leverage existing functions: `getCategoryBudgets()`, `getAllCategoriesSpending()`, `getSavingsAllocations()`
- Follow established patterns: `$state` runes, `{ data, error }` responses, toast notifications
- Color palette: Sage (#639A88) for savings, Amber (#D4A04D) for overspend, Terracotta (#C07D5A) for >100%

---

### Story 6.1: Monthly Recap Page & Navigation

As a user,
I want to access a dedicated Monthly Recap page from the navigation,
So that I can review my spending patterns for any month.

**Acceptance Criteria:**

**Given** I am signed in
**When** I look at the navigation sidebar
**Then** I see a "Bilan" link (between "Épargne" and "Préférences")

**Given** I click on "Bilan"
**When** the page loads
**Then** I see a Monthly Recap page for the current month
**And** the page header shows "Bilan - Janvier 2026" (current month)

**Given** I am on the Monthly Recap page
**When** I use the month navigation arrows
**Then** I can navigate to previous months
**And** the data updates to show that month's figures

**Given** I view a month that is still in progress
**When** I look at the header
**Then** I see a badge "En cours" next to the month name

**Given** I view a past archived month
**When** I look at the header
**Then** I see a badge "Clôturé" next to the month name

**Given** I view the recap
**When** I look at the summary section
**Then** I see: Total Revenus | Total Dépensé | Total Épargné | Solde

**Technical Notes:**
- Create route: `src/routes/bilan/+page.svelte`
- Add "Bilan" to `src/lib/components/ui/Navbar.svelte` (icon: chart-bar or clipboard-document-list)
- Reuse `MonthYearPicker.svelte` for month navigation
- Create `src/lib/data/analytics.ts` with:
  - `getMonthlyRecap(month: string)` - returns summary data
  - Uses existing `getMonthlyBudget()`, `getMonthlyIncome()`, `getSavingsAllocations()`
- Create components:
  - `src/lib/components/bilan/RecapHeader.svelte` - month title + navigation + status badge
  - `src/lib/components/bilan/RecapSummaryCard.svelte` - top-level KPIs

---

### Story 6.2: Budget vs Actual Comparison

As a user,
I want to compare my budget vs actual spending for each category,
So that I can see where I was accurate and where I need to adjust.

**Acceptance Criteria:**

**Given** I am viewing the monthly recap
**When** I look at the "Catégories" section
**Then** I see a table/list with all my budget categories

**Given** I look at a category row
**When** I view its details
**Then** I see: Category name (with color) | Budget | Dépensé | Écart | Mini-gauge

**Given** a category is under budget (spent 580 € of 600 € budget)
**When** I view the comparison
**Then** I see "✓ -20 €" in Sage color (#639A88)
**And** the mini-gauge shows the percentage with Sage fill

**Given** a category is over budget (spent 420 € of 300 € budget)
**When** I view the comparison
**Then** I see "⚠ +120 €" in Amber color (#D4A04D)
**And** the mini-gauge shows >100% with Terracotta fill (#C07D5A)

**Given** a category is exactly on budget
**When** I view the comparison
**Then** I see "✓ Pile poil" in Sage color

**Given** I view the summary row at the top
**When** I look at the totals
**Then** I see: Total Budgeté | Total Dépensé | Écart Net
**And** colors indicate overall status (under/over)

**Given** I click on a category row
**When** the detail view opens
**Then** I see a list of expenses for that category this month (reuse CategoryExpensesModal pattern)

**Technical Notes:**
- Add to `src/lib/data/analytics.ts`:
  - `getCategoryComparison(month: string)` - combines `getCategoryBudgets()` + `getAllCategoriesSpending()`
  - Returns: `{ categoryId, name, color, budget, spent, difference, percentage }[]`
- Create components:
  - `src/lib/components/bilan/CategoryComparisonTable.svelte` - main comparison view
  - `src/lib/components/bilan/CategoryComparisonRow.svelte` - individual row with mini-gauge
- Reuse `CategoryExpensesModal.svelte` for drill-down (already exists in dashboard/)
- Mini-gauge: simplified inline SVG or progress bar (not full CircularGauge)

---

### Story 6.3: Savings Progress Summary

As a user,
I want to see how my savings goals progressed this month,
So that I can track my wealth-building momentum.

**Acceptance Criteria:**

**Given** I am viewing the monthly recap
**When** I look at the "Épargne du mois" section
**Then** I see a summary of savings activity

**Given** I have savings goals with allocations this month
**When** I view the section
**Then** I see each goal with: Goal name | Alloué ce mois | Transféré | Progression

**Given** I allocated 200 € to "Voyage Japon" and transferred 150 €
**When** I view the goal
**Then** I see "Voyage Japon: 150 € transféré (200 € alloué)"
**And** I see the progress bar updated with +150 €

**Given** I have multiple goals
**When** I view the section
**Then** I see a total "Total Épargne: +X € ce mois"

**Given** I have no savings allocations this month
**When** I view the section
**Then** I see "Aucune épargne ce mois" without negative messaging
**And** I see a link "Configurer l'épargne →" to /epargne

**Given** I also allocated to accounts (not just goals)
**When** I view the section
**Then** I see accounts separately: "Comptes épargne: +X €"

**Technical Notes:**
- Add to `src/lib/data/analytics.ts`:
  - `getSavingsProgress(month: string)` - uses existing `getSavingsAllocations()`
  - Returns: `{ goals: [...], accounts: [...], totalAllocated, totalTransferred }`
- Create component:
  - `src/lib/components/bilan/SavingsRecapCard.svelte`
- Leverage existing `monthly_savings_allocations` table (has allocated_amount, transferred_amount)
- Show both allocated and transferred to give full picture
- Use Eucalyptus/Sage colors for positive savings messaging

---

### Story 6.4: Previous Month Context for Budget Planning

As a user,
I want to see last month's results when allocating my new budget,
So that I can make informed adjustments based on real data.

**Acceptance Criteria:**

**Given** I am on the Budget page (/budgets)
**When** I view the category allocation section
**Then** I see a small hint under each category input showing last month's performance

**Given** last month I budgeted 300 € for "Resto" but spent 420 €
**When** I view the Resto allocation row
**Then** I see below the input: "Mois dernier: 420/300 € ⚠ +120 €" in Amber

**Given** last month I budgeted 200 € for "Loisirs" but only spent 85 €
**When** I view the Loisirs allocation row
**Then** I see below the input: "Mois dernier: 85/200 € ✓ -115 €" in Sage

**Given** a category is new (didn't exist last month)
**When** I view that category
**Then** no previous month hint appears (just the input)

**Given** I'm a new user with no previous month data
**When** I view the budget page
**Then** no previous month hints appear anywhere

**Given** I want to hide the hints
**When** I look for a toggle
**Then** I see a small "Masquer historique" toggle at the top of allocations

**Technical Notes:**
- Add to `src/lib/data/analytics.ts`:
  - `getPreviousMonthComparison(currentMonth: string)` - gets last month's budget vs spent per category
  - Returns: `Map<categoryId, { budget, spent, difference }>`
- Modify existing `src/lib/components/budget/AllocationRow.svelte`:
  - Add optional `previousMonthData` prop
  - Render hint below input if data exists
- Add toggle state in `/budgets/+page.svelte` (localStorage preference)
- Keep hints subtle (text-xs, text-stone-500) to not overwhelm the UI
- Non-blocking: purely informational, no forced adjustments

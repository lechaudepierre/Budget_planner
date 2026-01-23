# Story 1.5: Base Layout & Navigation

Status: complete

## Story

As a user,
I want to see a consistent navigation layout across the app,
so that I can easily navigate between different sections.

## Acceptance Criteria

1. Fixed sidebar (240px) visible on all authenticated pages
2. Sticky header at top with current month and "+ Ajouter" button
3. Main content area is scrollable
4. Sidebar contains navigation links: Dashboard, Transactions, Budgets, Patrimoine, Objectifs
5. Sidebar has separator followed by: Préférences, Sign Out
6. Page transitions are smooth (200ms ease-out)
7. Active navigation link is visually highlighted
8. Toast notification system for feedback messages
9. Toast auto-dismisses after 3 seconds (or manual dismiss)

## Tasks / Subtasks

- [x] Task 1: Create sidebar component (AC: 1, 4, 5)
  - [x] Create src/lib/components/ui/navbar.svelte
  - [x] Fixed position, 240px width, full height
  - [x] Add Budget_planner logo/title at top
  - [x] Navigation links: Dashboard, Transactions, Budgets, Patrimoine, Objectifs
  - [x] Separator line
  - [x] Bottom section: Préférences, Sign Out
  - [x] Style with Tailwind (Linen background, Sage accents)

- [x] Task 2: Implement active link highlighting (AC: 7)
  - [x] Use SvelteKit $page.url.pathname to detect current route
  - [x] Apply active styles (background color, font weight)
  - [x] Use Sage color for active state

- [x] Task 3: Create header component (AC: 2)
  - [x] Create src/lib/components/ui/header.svelte
  - [x] Sticky position at top of main content
  - [x] Display current month in French format ("Janvier 2026")
  - [x] "+ Ajouter" button (placeholder action for now)
  - [x] Style with subtle shadow

- [x] Task 4: Create main layout structure (AC: 1, 2, 3)
  - [x] Update src/routes/+layout.svelte for authenticated layout
  - [x] Grid/flex layout: sidebar (fixed) + main (flex-1)
  - [x] Main content scrollable with padding
  - [x] Apply Linen background color

- [x] Task 5: Add page transitions (AC: 6)
  - [x] Implement Svelte transition on route changes
  - [x] Use fade or slide with 200ms duration
  - [x] Ensure smooth feel without jarring jumps

- [x] Task 6: Create toast notification system (AC: 8, 9)
  - [x] Create src/lib/components/ui/toast.svelte
  - [x] Support types: success, error, info
  - [x] Position: bottom-right or top-right
  - [x] Auto-dismiss after 3 seconds
  - [x] Manual dismiss button (X)
  - [x] Create toast store in src/lib/stores/toast.ts

- [x] Task 7: Create date utilities (AC: 2)
  - [x] Create src/lib/utils/date.ts
  - [x] Function: formatMonth(date) → "Janvier 2026"
  - [x] Function: getCurrentMonth() → current month date

- [x] Task 8: Verify layout on dashboard (AC: 1-9)
  - [x] Update +page.svelte to use new layout
  - [x] Test all navigation links (placeholder pages OK)
  - [x] Test toast notifications
  - [x] Verify responsive behavior (sidebar stays fixed)

## Dev Notes

### Architecture References

- [Source: architecture.md#Frontend Architecture]
- [Source: architecture.md#Project Structure]
- [Source: ux-design-specification.md#Layout Architecture]

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ SIDEBAR (240px fixed)  │  HEADER (sticky)               │
│                        │  Janvier 2026 | + Ajouter      │
│ • Logo Budget_planner  ├────────────────────────────────│
│ • Dashboard            │                                │
│ • Transactions         │  MAIN CONTENT                  │
│ • Budgets              │  (scrollable)                  │
│ • Patrimoine           │                                │
│ • Objectifs            │                                │
│                        │                                │
│ ────────────────────   │                                │
│ • Préférences          │                                │
│ • Sign Out             │                                │
└─────────────────────────────────────────────────────────┘
```

### Sidebar Navigation

```svelte
<!-- src/lib/components/ui/navbar.svelte -->
<script>
  import { page } from '$app/stores';

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '...' },
    { href: '/expenses', label: 'Transactions', icon: '...' },
    { href: '/budget', label: 'Budgets', icon: '...' },
    { href: '/accounts', label: 'Patrimoine', icon: '...' },
    { href: '/goals', label: 'Objectifs', icon: '...' },
  ];
</script>

<nav class="fixed w-60 h-full bg-linen border-r border-sand">
  <!-- Logo -->
  <div class="p-4">
    <h1 class="text-xl font-semibold text-sage">Budget_planner</h1>
  </div>

  <!-- Nav items -->
  <ul class="space-y-1 px-2">
    {#each navItems as item}
      <li>
        <a
          href={item.href}
          class="block px-4 py-2 rounded-lg {$page.url.pathname === item.href ? 'bg-sage/10 text-sage font-medium' : 'text-coffee-900 hover:bg-oat'}"
        >
          {item.label}
        </a>
      </li>
    {/each}
  </ul>

  <!-- Separator -->
  <div class="border-t border-sand my-4 mx-4"></div>

  <!-- Bottom items -->
  <ul class="px-2">
    <li><a href="/preferences" class="...">Préférences</a></li>
    <li>
      <form method="POST" action="/auth/logout">
        <button class="...">Sign Out</button>
      </form>
    </li>
  </ul>
</nav>
```

### Toast Store Pattern

```typescript
// src/lib/stores/toast.ts
import { writable } from 'svelte/store';

type Toast = {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
};

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  return {
    subscribe,
    show: (message: string, type: Toast['type'] = 'info') => {
      const id = crypto.randomUUID();
      update(toasts => [...toasts, { id, type, message }]);
      setTimeout(() => {
        update(toasts => toasts.filter(t => t.id !== id));
      }, 3000);
    },
    dismiss: (id: string) => {
      update(toasts => toasts.filter(t => t.id !== id));
    }
  };
}

export const toast = createToastStore();
```

### French Month Names

```typescript
// src/lib/utils/date.ts
const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function formatMonth(date: Date): string {
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}
```

### Color Classes (Tailwind)

Ensure tailwind.config.js has:
- `bg-linen` → #FAF7F2
- `bg-sage` → #639A88
- `bg-oat` → #F5F1EA
- `border-sand` → #E2DCD2
- `text-coffee-900` → #2D2520

### Prerequisites

- Story 1.1 completed
- Story 1.2 completed
- Story 1.3 completed
- Story 1.4 completed (sign-out works)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (GitHub Copilot)

### Debug Log References

- `npm run check` ✅ - 0 errors, 0 warnings
- `npm run build` ✅ - Production build successful (1.15s)

### Completion Notes List

1. **Task 1**: Created Navbar.svelte with 240px fixed sidebar, icons for all nav items
2. **Task 2**: Active link highlighting using `$page.url.pathname` with sage/10 bg
3. **Task 3**: Created Header.svelte with French month format and + Ajouter button
4. **Task 4**: Updated +layout.svelte with flex layout (sidebar + main content)
5. **Task 5**: Added 200ms fade transition on route changes using Svelte transitions
6. **Task 6**: Created toast store and Toast.svelte with success/error/info/warning types
7. **Task 7**: Created date.ts with formatMonth and getCurrentMonth utilities
8. **Task 8**: All components integrated, build passes

### File List

- `src/lib/components/ui/Navbar.svelte` - Fixed sidebar navigation
- `src/lib/components/ui/Header.svelte` - Sticky header with month display
- `src/lib/components/ui/Toast.svelte` - Toast notification component
- `src/lib/stores/toast.ts` - Toast state management
- `src/lib/utils/date.ts` - Date formatting utilities
- `src/routes/+layout.svelte` - Main authenticated layout
- `src/routes/+page.svelte` - Simplified dashboard page

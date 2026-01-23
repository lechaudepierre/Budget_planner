# Story 1.1: Project Initialization

Status: ready-for-dev

## Story

As a developer,
I want to scaffold the Budget_planner project with all required dependencies,
so that I have a working development environment to build upon.

## Acceptance Criteria

1. SvelteKit project created with TypeScript strict mode
2. Tailwind CSS + DaisyUI configured and working
3. @vite-pwa/sveltekit installed and configured
4. @supabase/supabase-js and @supabase/ssr installed
5. Project structure matches Architecture specification
6. `npm run dev` starts development server without errors
7. Basic "Hello Budget_planner" page renders at localhost

## Tasks / Subtasks

- [ ] Task 1: Create SvelteKit project (AC: 1)
  - [ ] Run `npm create svelte@latest budget-planner` with TypeScript, ESLint, Prettier
  - [ ] Verify TypeScript strict mode in tsconfig.json
  - [ ] Confirm project runs with `npm run dev`

- [ ] Task 2: Install and configure Tailwind CSS + DaisyUI (AC: 2)
  - [ ] Install: `npm install -D tailwindcss postcss autoprefixer daisyui`
  - [ ] Run `npx tailwindcss init -p`
  - [ ] Configure tailwind.config.js with DaisyUI plugin
  - [ ] Configure custom color palette (Sage #639A88, Linen #FAF7F2, Terracotta #C07D5A)
  - [ ] Add Tailwind directives to src/app.css
  - [ ] Verify Tailwind classes work in a test component

- [ ] Task 3: Install PWA plugin (AC: 3)
  - [ ] Install: `npm install -D @vite-pwa/sveltekit`
  - [ ] Configure in vite.config.ts with basic PWA settings
  - [ ] Create static/manifest.json with app name and icons placeholder

- [ ] Task 4: Install Supabase client (AC: 4)
  - [ ] Install: `npm install @supabase/supabase-js @supabase/ssr`
  - [ ] Create src/lib/supabase.ts placeholder (client setup for later)
  - [ ] Create .env.example with SUPABASE_URL and SUPABASE_ANON_KEY placeholders

- [ ] Task 5: Create project folder structure (AC: 5)
  - [ ] Create src/lib/components/ (with gauges/, forms/, ui/, dashboard/ subdirs)
  - [ ] Create src/lib/data/
  - [ ] Create src/lib/stores/
  - [ ] Create src/lib/schemas/
  - [ ] Create src/lib/utils/
  - [ ] Create src/lib/types/
  - [ ] Create supabase/migrations/
  - [ ] Create static/icons/
  - [ ] Add .gitkeep to empty directories

- [ ] Task 6: Configure Inter font (AC: 2, 5)
  - [ ] Add Inter font import to app.html or app.css
  - [ ] Configure Tailwind fontFamily to use Inter

- [ ] Task 7: Create Hello Budget_planner page (AC: 6, 7)
  - [ ] Update src/routes/+page.svelte with welcome message
  - [ ] Apply Tailwind/DaisyUI styling to verify configuration
  - [ ] Display "Budget_planner" with Sage color
  - [ ] Verify page renders correctly at localhost:5173

- [ ] Task 8: Final verification (AC: 1-7)
  - [ ] Run `npm run dev` - no errors
  - [ ] Run `npm run build` - builds successfully
  - [ ] Run `npm run check` - no TypeScript errors
  - [ ] Verify all folder structure exists

## Dev Notes

### Architecture References

- [Source: architecture.md#Starter Template Evaluation]
- [Source: architecture.md#Project Structure & Boundaries]

### Initialization Commands (from Architecture)

```bash
# 1. Create SvelteKit project with TypeScript
npm create svelte@latest budget-planner
# Select: Skeleton project, TypeScript, ESLint, Prettier

cd budget-planner

# 2. Install Tailwind CSS + DaisyUI
npm install -D tailwindcss postcss autoprefixer daisyui
npx tailwindcss init -p

# 3. Install PWA plugin
npm install -D @vite-pwa/sveltekit

# 4. Install Supabase client
npm install @supabase/supabase-js @supabase/ssr

# 5. Install deployment adapter
npm install -D @sveltejs/adapter-vercel
```

### Custom Color Palette (from UX Spec)

```javascript
// tailwind.config.js colors
colors: {
  sage: {
    DEFAULT: '#639A88',
    dark: '#4F7D6E',
  },
  linen: '#FAF7F2',
  cotton: '#FDFBF8',
  oat: '#F5F1EA',
  sand: '#E2DCD2',
  terracotta: '#C07D5A',
  amber: '#D4A04D',
  eucalyptus: '#5AAA8C',
  coffee: {
    900: '#2D2520',
  },
  stone: {
    500: '#8A827A',
  },
}
```

### Project Structure Notes

Target structure after this story:
```
budget-planner/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── gauges/
│   │   │   ├── forms/
│   │   │   ├── ui/
│   │   │   └── dashboard/
│   │   ├── data/
│   │   ├── stores/
│   │   ├── schemas/
│   │   ├── utils/
│   │   └── types/
│   ├── routes/
│   │   └── +page.svelte
│   ├── app.css
│   ├── app.html
│   └── app.d.ts
├── static/
│   ├── icons/
│   └── manifest.json
├── supabase/
│   └── migrations/
├── .env.example
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
└── package.json
```

### Testing Standards

- This is a scaffolding story - manual verification acceptable
- Verify: `npm run dev`, `npm run build`, `npm run check` all pass
- Visual verification of Hello page with Tailwind styling

## Dev Agent Record

### Agent Model Used

(To be filled during implementation)

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation)

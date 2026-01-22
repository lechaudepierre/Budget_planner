---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
status: 'complete'
completedAt: '2026-01-22'
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-Budget_planner-2026-01-21.md'
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/analysis/brainstorming-session-2026-01-21.md'
designDirection:
  style: 'Flat design with subtle depth'
  shadows: 'Soft shadows on interactive elements (buttons, cards)'
  gradients: 'Minimal - solid colors preferred'
  aesthetic: 'Minimalist, modern, motivational'
  trends: '2026 design patterns'
  inspiration: 'Épuré, joli, minimaliste - Linear, Arc, Raycast aesthetic'
---

# UX Design Specification - Budget_planner

**Author:** Pierrelechaude
**Date:** 2026-01-22

---

## Executive Summary

### Project Vision

Budget_planner delivers a **feeling of control and clarity over personal finances** - not a cold tracking tool. The app transforms budget management from an anxiety-inducing chore into a motivating visual experience where users feel empowered rather than judged.

Core philosophy: **"Jauges > 100% = Data, pas échec"** - overspending is learning data, not failure.

### Target Users

**Primary Persona: Young Professional (Pre/Early Career)**
- Transitioning from student to working life
- Has 2-3 bank accounts with no unified view
- Checks balances sporadically without method
- Wants to build financial habits before "real salary" arrives
- Tech-savvy but craves beautiful, motivating UX over functional-but-cold tools
- Values feeling in control over being lectured

**User Mindset:** "I want to KNOW where my money goes so I can make better choices - not be told what to do."

### Key Design Challenges

1. **Gauges as emotional feedback** - Progress bars must feel alive and satisfying, not clinical
2. **Information density vs. clarity** - Multiple data points (patrimoine, budgets, savings) without overwhelm
3. **Overspending visual language** - Communicate >100% as "data point" not "failure state"
4. **Daily entry friction** - Make expense logging feel quick and rewarding, not burdensome
5. **Monthly ritual value** - 30-minute planning sessions should feel like productive self-care

### Design Opportunities

1. **Fluid animated gauges** - Smooth transitions, micro-celebrations, satisfying visual feedback
2. **Progressive color language** - Informative color shifts that guide without alarming
3. **Flat design + soft shadows** - Clean, modern aesthetic with subtle depth on interactive elements
4. **Minimalist information hierarchy** - Clear visual priorities with patrimoine as hero element
5. **Motivational moments** - Celebrate savings milestones and prediction accuracy

## Core User Experience

### Defining Experience

**The Core Loop:** Budget_planner operates on two intertwined rhythms:
- **Daily rhythm:** Quick expense entry → immediate gauge feedback → feeling of awareness
- **Monthly rhythm:** Planning session → budget review/adjustment → feeling of control

**The Defining Interaction:** Entering an expense and watching the gauge respond. This single interaction must feel:
- Fast (< 10 seconds from thought to done)
- Rewarding (visual feedback that feels satisfying)
- Informative (instantly understand impact on budget)

### Platform Strategy

| Platform | Priority | Experience Focus |
|----------|----------|------------------|
| **Desktop/PC** | Primary | Full dashboard experience, monthly planning sessions |
| **Tablet** | Secondary | Comfortable browsing, occasional expense entry |
| **Mobile** | Tertiary | Quick expense capture when away from PC |

**Architecture:** Progressive Web App (PWA) with SvelteKit
- Installable on all platforms
- Offline-capable with LocalStorage buffer
- Syncs via Supabase when online
- PC-first design, responsive for smaller screens

### Effortless Interactions

1. **Expense Entry** - From "I spent money" to "it's recorded" in under 10 seconds
2. **Status Check** - Open app → instant dashboard with no loading state
3. **Gauge Understanding** - Single glance = percentage, remaining, and status (via color)
4. **Navigation** - Fluid transitions between dashboard and expense entry

### Critical Success Moments

| Moment | Success Criteria |
|--------|------------------|
| **First Expense** | Gauge animates smoothly, user feels "this is nice" |
| **First Month Review** | Gauges match reality, user thinks "this actually works" |
| **First Overspend** | >100% gauge feels informative, not judgmental |
| **First Savings Win** | Goal milestone triggers subtle celebration |
| **The Aha Moment** | Month-end gauges match predictions - "I called it!" |

### Experience Principles

1. **Clarity over features** - Every pixel serves understanding, nothing decorative without purpose
2. **Feedback is instant** - Every action produces immediate, visible response
3. **Data, not judgment** - Information is presented neutrally; interpretation is the user's
4. **Satisfying by default** - Micro-interactions reward engagement without being childish
5. **Respect user time** - Daily tasks < 2 minutes, monthly tasks < 30 minutes

## Desired Emotional Response

### Primary Emotional Goals

**The Core Promise:** Budget_planner delivers a **feeling of control and financial clarity**.

| Emotional Goal | Description |
|----------------|-------------|
| **Control** | "I know exactly where my money goes and where I stand" |
| **Clarity** | "I can see my financial situation at a glance" |
| **Empowerment** | "I make informed choices about my spending" |
| **Satisfaction** | "My predictions match reality - I understand my patterns" |
| **Motivation** | "Watching my savings grow makes me want to save more" |

### Emotional Journey Mapping

| Stage | Emotional State | Design Response |
|-------|-----------------|-----------------|
| **First Open** | Curious, slightly uncertain | Welcoming, clear first steps |
| **Setup Complete** | Relief, empowerment | Celebratory feedback, "you're ready" |
| **Daily Use** | Calm awareness | Quick, satisfying interactions |
| **After Entry** | Micro-satisfaction | Smooth gauge animation |
| **Overspending** | Neutral observation | Informative colors, no judgment |
| **Month Review** | Pride or learning | Insights framed as discoveries |
| **Savings Milestone** | Accomplishment | Subtle celebration moment |

### Micro-Emotions

**Emotions We Cultivate:**
- Confidence (always know what to do)
- Trust (data feels accurate and instant)
- Accomplishment (every action feels successful)
- Curiosity (want to check in, not obligated to)
- Pride (watching progress over time)

**Emotions We Actively Prevent:**
- Guilt (no judgmental language or alarming colors)
- Overwhelm (progressive disclosure, clear hierarchy)
- Anxiety (calm palette, no dramatic notifications)
- Boredom (satisfying micro-interactions, visual personality)

### Design Implications

| Emotional Goal | UX Design Approach |
|----------------|-------------------|
| **Control** | Always-visible patrimoine total, clear gauge states |
| **Clarity** | Single-glance dashboard comprehension |
| **No Guilt** | >100% gauges use warm orange, not angry red |
| **Satisfaction** | Smooth 300ms gauge animations with easing |
| **Motivation** | Savings gauges that fill UP (progress visualization) |

### Emotional Design Principles

1. **Inform, don't alarm** - Colors and states communicate information, not judgment
2. **Celebrate quietly** - Achievements acknowledged without being childish
3. **Calm over exciting** - The app is a serene financial companion, not a game
4. **Trust through transparency** - Every number is explainable, no magic
5. **Progress is visible** - Both spending (down) and saving (up) show movement

## UX Pattern Analysis & Inspiration

### Design Philosophy

**Épuré, joli, minimaliste** - Every element earns its place. Whitespace is a feature, not empty space. The few elements present are *perfectly* executed.

Reference aesthetic: Linear, Arc Browser, Raycast, Cron Calendar - modern tools that feel premium through restraint.

### Inspiring Products Analysis

**Linear (Project Management)**
- Flat design reference with perfectly-dosed subtle shadows
- Fluid animations (200-300ms) that bring life without distraction
- Restrained but expressive color palette
- **À adopter:** Card system, shadow values, transition timing

**Arc Browser (Web Browser)**
- Ultra-clean interface that feels fresh and modern
- Bold use of whitespace
- Subtle color accents that pop against neutral backgrounds
- **À adopter:** Whitespace confidence, accent color strategy

**Apple Fitness (Health)**
- Circular progress rings that create visual addiction
- Subtle celebrations (no excessive confetti)
- Progress feels tangible and motivating
- **À adopter:** Gauge animation philosophy, milestone acknowledgment

**Raycast (Productivity)**
- Minimalist but not cold - has personality
- Perfect typography hierarchy
- Micro-interactions that feel premium
- **À adopter:** Typography scale, interaction polish

**Revolut/Monzo (Finance)**
- Modern finance that doesn't feel like traditional banking
- Card-based account display
- Color-coded spending categories
- **À adopter:** Category visualization, friendly finance aesthetic

### Transferable UX Patterns

**Visual Patterns:**

| Pattern | Implementation |
|---------|----------------|
| Soft shadow cards | `box-shadow: 0 2px 8px rgba(0,0,0,0.06)` |
| Subtle hover elevation | `transform: translateY(-1px)` + shadow increase |
| Circular gauges | SVG-based with smooth fill animation |
| Status colors | Teal/Green → Amber → Orange (no angry red) |
| Generous whitespace | 24-32px between sections minimum |

**Interaction Patterns:**

| Pattern | Timing |
|---------|--------|
| Page transitions | 200ms ease-out |
| Gauge animations | 300-400ms ease-in-out |
| Button feedback | 100ms scale(0.98) + shadow |
| Card hover | 150ms all properties |
| Focus states | Subtle ring, not harsh outline |

**Layout Patterns:**

| Pattern | Application |
|---------|-------------|
| Sidebar + main | Primary navigation structure |
| Card grid | Budget categories display (2-3 columns) |
| Hero number | Patrimoine total - large, prominent, top |
| Progressive disclosure | Details expand on demand |
| Breathing room | Generous padding inside cards |

### Anti-Patterns to Avoid

| Anti-Pattern | Why Harmful | Our Alternative |
|--------------|-------------|-----------------|
| Alarming red for overspend | Creates guilt and anxiety | Warm orange = information only |
| Excessive charts/graphs | Overwhelms, loses focus | One clear gauge per category |
| Badge gamification | Feels childish, not serious | Subtle milestone glow effect |
| Push notifications | Anxiety-inducing | In-app visual cues only |
| Judgment language | "You failed" messaging | Neutral data presentation |
| Cluttered dashboards | Cognitive overload | Whitespace as design element |
| Gradients everywhere | Dated, distracting | Solid colors with shadow depth |

### Design Inspiration Strategy

**Adopt Directly:**
- Linear's shadow values and animation timing
- Arc's confident whitespace usage
- Apple Fitness gauge satisfaction
- Raycast's typography precision

**Adapt for Budget_planner:**
- Revolut's card UI → simpler, more gauge-focused
- Monzo's color system → our own palette, same philosophy
- Notion's layout → streamlined for single-purpose app

**Explicitly Avoid:**
- YNAB's guilt-inducing red alerts
- Mint's dashboard information overload
- Any gamification that feels forced or childish
- Gradients or glass-morphism effects
- Anything that prioritizes "pretty" over "clear"

## Design System Foundation

### Design System Choice

**Tailwind CSS + DaisyUI + Custom Components**

A hybrid approach leveraging:
- **Tailwind CSS** for utility-first styling and precise design control
- **DaisyUI** for pre-built, themeable components (buttons, forms, cards, modals)
- **Custom Svelte components** for critical UI elements (gauges, charts, specialized interactions)

### Rationale for Selection

1. **Alignment with tech stack** - SvelteKit pairs naturally with Tailwind
2. **Design flexibility** - Utilities allow pixel-perfect implementation of Linear/Arc aesthetic
3. **Gauge freedom** - No framework conflicts for custom animated SVG gauges
4. **Speed where it matters** - DaisyUI handles routine components (forms, buttons)
5. **Theming support** - Easy to implement custom color palette
6. **Solo developer efficiency** - No custom design system maintenance burden

### Implementation Approach

| Component Type | Approach |
|----------------|----------|
| Layout & spacing | Tailwind utilities |
| Buttons, inputs, modals | DaisyUI (themed) |
| Cards | DaisyUI base + custom shadows |
| Gauges (circular) | Custom Svelte + SVG + transitions |
| Navigation | Custom Svelte + Tailwind |
| Colors & typography | Tailwind config + DaisyUI theme |

### Customization Strategy

**Theme Configuration:**
- Extend Tailwind config with custom color palette
- Override DaisyUI theme tokens (primary, secondary, accent)
- Define custom shadow values matching Linear aesthetic

**Custom Components:**
- `<CircularGauge>` - SVG-based with Svelte transitions
- `<PatrimoineCard>` - Hero number display
- `<CategoryCard>` - Budget category with embedded gauge
- `<SavingsGoal>` - Upward-filling progress visualization

**Animation Tokens:**
- Gauge fill: 300-400ms ease-in-out
- Card hover: 150ms translateY(-1px) + shadow
- Page transitions: 200ms ease-out

## Defining Experience

### The Core Interaction

**"Enter expenses → Watch gauges respond"**

This interaction defines Budget_planner's soul. It transforms budget tracking from an anxiety-inducing chore into a satisfying daily ritual.

**User Description:** "I log my expenses and watch beautiful gauges show me exactly where my money goes."

### User Mental Model

**Current State:**
- Checks balances sporadically without method
- No unified financial view
- Associates budgeting with guilt (traditional apps teach this)
- Wants awareness, not judgment

**Target Mental Model:**
- End-of-day expense entry = awareness ritual
- Gauges = honest feedback, not report cards
- >100% = useful data for next month, not failure
- Checking the app = feeling in control

### Core Experience Success Criteria

| Criteria | Target | Rationale |
|----------|--------|-----------|
| Simplicity | Intuitive flow, no learning curve | Should feel obvious what to do |
| Cognitive load | Minimal decisions required | Category + amount, optional details |
| Visual feedback | Satisfying gauge animation | Reinforces the habit with micro-reward |
| Single-glance comprehension | %, remaining €, status color | Instant understanding of budget state |
| Emotional response | Neutral-to-positive | Never guilt, never anxiety |
| Daily rhythm | Comfortable 2-5 min session | End-of-day ritual, not in-the-moment capture |

### Novel UX Patterns

**Informative Color Progression (Not Alarming States)**

Traditional finance apps: Green → Yellow → RED (FAILURE!)
Budget_planner: Teal/Green → Amber → Soft Orange (information)

This deliberate pattern inversion removes the guilt association with overspending.

**Gauge as Emotional Feedback**

The gauge isn't just a data display - it's designed to create micro-satisfaction:
- Smooth 300-400ms fill animation
- Subtle easing that feels "weighted"
- Color transitions that feel informative, not alarming

### Experience Mechanics

**1. Daily Ritual Context**
- User opens app at end of day (or every 1-3 days)
- Dashboard shows current gauge states
- Natural invitation to add today's expenses

**2. Expense Entry Flow**
- Clear entry point (dedicated page or prominent button)
- Simple form: Amount → Category → Optional note
- Visual category selection with icons
- Add another expense without leaving the flow
- Batch-friendly: enter 3-5 expenses in sequence comfortably

**3. Feedback After Each Entry**
- Gauge animates smoothly to new percentage
- If crossing threshold (75%, 100%), color transitions smoothly
- Remaining budget updates in real-time
- Satisfying but not distracting

**4. Session Completion**
- Dashboard reflects all new entries
- Clear view of "where I stand now"
- User feels: "Done for today, I know my situation"

**5. Edge Cases**
- Overspend (>100%): Gauge shows overflow state, orange color, no alarm
- Multiple entries: Each animates, creating cumulative satisfaction
- Forgot yesterday: Easy to backdate entries

## Visual Design Foundation

### Color System

**Brand Colors:**

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | Sage | `#639A88` | Main actions, buttons, healthy gauges |
| Primary Hover | Sage Dark | `#4F7D6E` | Hover states |
| Secondary | Warm Stone | `#6B635A` | Secondary text, UI elements |
| Accent | Deep Sage | `#3D6B5A` | Focus points, highlights |

**Background Palette (Warm Neutrals):**

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Background | Linen | `#FAF7F2` | Main app background |
| Surface | Cotton | `#FDFBF8` | Cards, elevated surfaces |
| Subtle | Oat | `#F5F1EA` | Secondary areas |
| Border | Sand | `#E2DCD2` | Dividers, card borders |

**Text Colors:**

| Role | Color | Hex |
|------|-------|-----|
| Text Primary | Coffee-900 | `#2D2520` |
| Text Secondary | Stone-500 | `#8A827A` |

**Gauge Status Colors (Progressive, Not Alarming):**

| State | Color | Hex | Meaning |
|-------|-------|-----|---------|
| Healthy (0-75%) | Sage | `#639A88` | Budget on track |
| Heads-up (75-100%) | Warm Amber | `#D4A04D` | Gentle awareness |
| Over (>100%) | Soft Terracotta | `#C07D5A` | Information, NOT alarm |
| Savings Progress | Eucalyptus | `#5AAA8C` | Goals filling up |

**Shadow System (Warm-tinted):**

| Level | Value | Usage |
|-------|-------|-------|
| Subtle | `0 1px 2px rgba(45,37,32,0.04)` | Resting cards |
| Default | `0 2px 8px rgba(45,37,32,0.06)` | Interactive cards |
| Hover | `0 4px 12px rgba(45,37,32,0.08)` | Hovered cards |

### Typography System

**Typeface:** Inter (Variable)

Rationale: Excellent number legibility (critical for finance), modern and clean aesthetic matching Linear/Raycast inspiration, open source.

**Type Scale:**

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero Numbers | 48px | Bold (700) | 1.1 |
| Gauge % | 24px | Semibold (600) | 1.2 |
| H1 | 24px | Semibold (600) | 1.3 |
| H2 | 18px | Medium (500) | 1.4 |
| Body | 14px | Regular (400) | 1.5 |
| Caption | 12px | Regular (400) | 1.4 |

### Spacing & Layout Foundation

**Base Unit:** 4px (Tailwind-compatible)

**Spacing Scale:**

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Micro-gaps |
| space-2 | 8px | Related elements |
| space-3 | 12px | Compact internal padding |
| space-4 | 16px | Standard padding |
| space-6 | 24px | Section separation |
| space-8 | 32px | Large separations |

**Layout Structure:**
- Sidebar: 240px fixed
- Main content: Fluid, max-width 1200px
- Card padding: 16-24px
- Section spacing: 24-32px

### Accessibility Considerations

| Criterion | Standard | Implementation |
|-----------|----------|----------------|
| Text contrast | WCAG AA 4.5:1 | Coffee-900 on Linen = compliant ✓ |
| Large text contrast | WCAG AA 3:1 | All headings compliant ✓ |
| Color independence | Not color-only | Gauges show % + color ✓ |
| Focus visibility | Visible focus rings | Ring-2 with Sage color ✓ |
| Touch targets | 44x44px minimum | Buttons meet minimum ✓ |

---

## Step 9: Design Directions (Approved)

### Selected Direction: "Flow Vision"

**Mockup Reference:** `ux-design-directions-v3.html`

### Layout Architecture

**Structure:** Fixed Sidebar + Sticky Header + Scrollable Main Content

```
┌─────────────────────────────────────────────────────────┐
│ SIDEBAR (240px fixed)  │  HEADER (sticky)               │
│                        │  Janvier 2026 | + Ajouter      │
│ • Logo Budget_planner  ├────────────────────────────────│
│ • Dashboard            │                                │
│ • Transactions         │  ┌─────────────┐ ┌───────────┐ │
│ • Budgets              │  │ BUDGET MOIS │ │ RÉPARTIT. │ │
│ • Patrimoine           │  │  40% restant│ │  Donut    │ │
│ • Objectifs            │  │  (gauge)    │ │  Chart    │ │
│ • Analyses             │  └─────────────┘ └───────────┘ │
│                        │  ┌─────────────┐ ┌───────────┐ │
│ ────────────────────   │  │ PATRIMOINE  │ │  EXTRAS   │ │
│ • Préférences          │  │ + Épargne   │ │  (scroll) │ │
│ • Aide                 │  └─────────────┘ └───────────┘ │
│                        │  ┌─────────────────────────────│
│                        │  │ BUDGETS PAR CATÉGORIE       │
│                        │  │ (6 mini-gauges)             │
└─────────────────────────────────────────────────────────┘
```

### Dashboard Cards

#### Card 1: Budget du mois
- **Visual:** Large circular gauge (220px diameter)
- **Data:** Shows "X% restant" with remaining €
- **Color Logic:** 
  - Green (Sage) when healthy (>30% restant)
  - Orange (Warning) when caution (10-30%)
  - Terracotta when critical (<10%)
- **Stats:** Revenus / Dépensé / Restant below gauge

#### Card 2: Répartition des dépenses
- **Visual:** Donut chart with category breakdown
- **Legend:** Category name + percentage, sorted by value
- **Categories:** Courses, Resto, Sorties, Transport, Vêtements, Loisirs
- **Interaction:** Hover highlights segment

#### Card 3: Patrimoine + Épargne (Merged)
- **Visual:** Green gradient card (Sage to Accent)
- **Layout:**
  - Top: "Patrimoine Total" + large € value + monthly change
  - Bottom: Mini savings gauge (75%) + "Objectif épargne" + €
- **Colors:** White text on green, #A8E6CF for highlights

#### Card 4: Dépenses exceptionnelles
- **Visual:** White card with scrollable list
- **Items:** Icon + description + amount + date
- **Layout:** Max-height with styled scrollbar
- **Total:** Sum displayed at bottom

#### Card 5: Budgets par catégorie
- **Visual:** Grid of 6 mini circular gauges (80px each)
- **Data:** Category name + spent/budget + percentage
- **Color:** Each category has unique color from palette

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Gauge display | "% restant" not "% utilisé" | Positive framing - focus on what's left |
| Gauge fill direction | Fill = spent, Empty = remaining | Visual metaphor: "budget draining" |
| Patrimoine card | Green gradient | Distinction from other cards, wealth = positive |
| Extras list | Scrollable | Keep card height consistent, show all items |
| Sidebar | Fixed 240px | Always accessible navigation |
| Header | Sticky | Month context always visible |

### Approved Visual Elements

- ✅ Circular gauges with stroke-dasharray animation
- ✅ Donut charts for category breakdown
- ✅ Green gradient for wealth/savings card
- ✅ Warm color palette (Sage & Linen)
- ✅ Inter font family
- ✅ Soft shadows on cards
- ✅ Fixed sidebar + sticky header
- ✅ Scrollable content areas with styled scrollbars
- ❌ No emojis in UI
- ❌ No complex 3D effects

---

## Step 10: User Journey Flows

### Flow 1: Onboarding (First Launch)

**Trigger:** First app launch / new user
**Goal:** Set up financial foundation to start using the app

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Welcome                                            │
│  "Bienvenue sur Budget_planner"                             │
│  Brief value prop + "Commencer" button                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Comptes & Patrimoine                               │
│  "Quel est ton patrimoine actuel ?"                         │
│                                                             │
│  + Ajouter un compte                                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Nom: [Compte courant    ]  Solde: [1 500 €]        │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Nom: [Livret A          ]  Solde: [3 200 €]        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Total patrimoine: 4 700 €                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Revenus                                            │
│  "Quand arrives ton salaire ?"                              │
│                                                             │
│  Montant mensuel: [2 800 €        ]                         │
│  Date d'arrivée:  [    25    ] du mois                      │
│                                                             │
│  ℹ️ Cette date définira ton cycle budgétaire mensuel        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Premier budget                                     │
│  "Répartis ton salaire dans tes catégories"                 │
│                                                             │
│  Salaire: 2 800 €                    Restant: 400 €         │
│                                                             │
│  [Courses alimentaires  ] [  600 € ]  ████████░░  21%       │
│  [Restaurant/Sorties    ] [  300 € ]  ████░░░░░░  11%       │
│  [Transport             ] [  150 € ]  ██░░░░░░░░   5%       │
│  [Loisirs               ] [  200 € ]  ███░░░░░░░   7%       │
│  [Épargne               ] [  500 € ]  ██████░░░░  18%       │
│  [Loyer/Charges fixes   ] [  650 € ]  ████████░░  23%       │
│                                                             │
│  + Ajouter une catégorie                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: C'est parti !                                      │
│  "Tu es prêt à prendre le contrôle"                         │
│                                                             │
│  Récap visuel: Patrimoine + Budget mensuel                  │
│                                                             │
│  [Accéder au Dashboard →]                                   │
└─────────────────────────────────────────────────────────────┘
```

**Key UX Decisions:**
- Date du salaire = date du cycle mensuel (Monthly Review)
- Répartition visuelle du budget avec barres de progression
- "Restant" visible en temps réel pendant la répartition
- Possibilité d'ajouter des catégories personnalisées

---

### Flow 2: Ajouter une dépense (Daily Use)

**Trigger:** Bouton "+ Ajouter dépense" (header) ou raccourci
**Goal:** Logger une dépense rapidement avec contexte

```
┌─────────────────────────────────────────────────────────────┐
│  MODAL: Nouvelle dépense                              [✕]   │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  Nom de la dépense                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Courses Carrefour                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Montant                                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 47,50 €                                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Catégorie                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🛒 Courses alimentaires              ▼              │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Budget: 600 € | Dépensé: 312 € | Reste: 288 €      │    │
│  │ ████████████████░░░░░░░░░░  52% utilisé            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Date                                                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 📅 22 janvier 2026                          [📆]   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Ajouter la dépense                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

         📆 Date Picker (on click)
┌─────────────────────────────────────────────────────────────┐
│      ◀  Janvier 2026  ▶                                     │
│  Lu   Ma   Me   Je   Ve   Sa   Di                           │
│       1    2    3    4    5    6                            │
│   7   8    9   10   11   12   13                            │
│  14  15   16   17   18   19   20                            │
│  21 [22]  23   24   25   26   27                            │
│  28  29   30   31                                           │
└─────────────────────────────────────────────────────────────┘
```

**Key UX Decisions:**
- **Nom:** Champ texte libre (pas de suggestions imposées)
- **Catégorie:** Dropdown avec preview du budget restant
- **Date:** Calendrier visuel (pas de saisie manuelle)
- **Feedback:** Voir impact sur le budget AVANT de confirmer
- **Date par défaut:** Aujourd'hui

---

### Flow 3: Monthly Planning (Budget Review)

**Trigger:** Notification à la date du salaire OU accès via Sidebar > Budgets
**Goal:** Ajuster les budgets pour le nouveau mois

```
┌─────────────────────────────────────────────────────────────┐
│  PAGE: Gestion des Budgets                                  │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  Février 2026                          Salaire: 2 800 €     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ BILAN JANVIER                                       │    │
│  │                                                     │    │
│  │ Courses     600 €  → Dépensé: 580 €   ✓ -20 €      │    │
│  │ Resto       300 €  → Dépensé: 420 €   ⚠ +120 €     │    │
│  │ Transport   150 €  → Dépensé: 140 €   ✓ -10 €      │    │
│  │ Loisirs     200 €  → Dépensé: 85 €    ✓ -115 €     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  BUDGETS FÉVRIER                         Alloué: 2 400 €    │
│                                          Restant: 400 €     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Courses alimentaires                                 │   │
│  │ Janvier: 580/600 €          [  600 € ] [−] [+]      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Restaurant/Sorties                      ⚠ dépassé   │   │
│  │ Janvier: 420/300 €          [  350 € ] [−] [+]      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  + Ajouter un nouveau budget                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key UX Decisions:**
- **Bilan du mois précédent** visible pour informer les décisions
- **Pas de report automatique** - ajustement manuel intentionnel
- **Indicateurs visuels** : ✓ sous budget, ⚠ dépassé
- **Total "Restant"** visible pour équilibrer
- **+ Ajouter un budget** pour créer nouvelles catégories

---

### Flow 4: Créer un nouveau budget/catégorie

**Trigger:** "+ Ajouter un nouveau budget" dans page Budgets
**Goal:** Créer une catégorie personnalisée

```
┌─────────────────────────────────────────────────────────────┐
│  MODAL: Nouveau budget                                [✕]   │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  Nom de la catégorie                                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Vêtements                                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Icône (optionnel)                                          │
│  ○👕 ○🎮 ○📚 ○🎵 ○💊 ○🏠 ○🚗 ○✈️ ○🎁 ○📱             │
│                                                             │
│  Couleur                                                    │
│  ○🟢 ○🔵 ○🟣 ○🟠 ○🔴 ○🟤                               │
│                                                             │
│  Budget mensuel                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 150 €                                               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [        Créer le budget        ]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Flow 5: Budget Projet (Épargne avec objectif)

**Trigger:** Sidebar > Objectifs > "+ Nouveau projet"
**Goal:** Planifier une épargne pour un objectif précis (voyage, achat, etc.)

```
┌─────────────────────────────────────────────────────────────┐
│  PAGE: Objectifs d'épargne                                  │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  Mes projets                                                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ✈️ Voyage Japon - Avril 2026                        │    │
│  │                                                     │    │
│  │ ████████████████░░░░░░░░  1 800 € / 2 500 €        │    │
│  │                                         72%         │    │
│  │                                                     │    │
│  │ Épargne mensuelle suggérée: 350 €/mois             │    │
│  │ (3 mois restants)                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  + Nouveau projet                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

         MODAL: Créer un projet
┌─────────────────────────────────────────────────────────────┐
│  Nouveau projet d'épargne                             [✕]   │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  Nom du projet                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Voyage Japon                                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Date cible (optionnel)                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 📅 Avril 2026                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ── Détailler le budget ──                                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ✈️ Transport (vols)              [  800 € ]         │    │
│  │ 🏨 Logement                      [  900 € ]         │    │
│  │ 🍜 Nourriture                    [  400 € ]         │    │
│  │ 🎌 Activités                     [  300 € ]         │    │
│  │ 🎁 Souvenirs/Divers              [  100 € ]         │    │
│  │                                                     │    │
│  │ + Ajouter une ligne                                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ TOTAL PROJET                          2 500 €       │    │
│  │ Déjà économisé                           0 €        │    │
│  │ Mois restants                              3        │    │
│  │ ─────────────────────────────────────────────       │    │
│  │ Épargne suggérée/mois              ≈ 834 €         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [        Créer le projet        ]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key UX Decisions:**
- **Budget détaillé** : Pouvoir décomposer par poste (transport, logement, etc.)
- **Calcul automatique** : Total + épargne mensuelle suggérée
- **Date cible** : Optionnel, mais permet de calculer le rythme d'épargne
- **Flexibilité** : Ajouter autant de lignes que nécessaire
- **Suivi visuel** : Gauge de progression sur le dashboard Objectifs

---

### Flow 6: Dépassement de budget (>100%)

**Trigger:** Une dépense fait passer une catégorie au-delà de 100%
**Goal:** Informer sans culpabiliser, proposer des options

```
┌─────────────────────────────────────────────────────────────┐
│  NOTIFICATION (toast)                                       │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  ⚠️ Budget "Restaurant" dépassé                             │
│                                                             │
│  Tu as dépensé 320 € sur 300 € alloués (+20 €)             │
│                                                             │
│  [Voir les dépenses]  [Ajuster le budget]  [OK]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Gauge Visual Change:**
- Couleur passe de Sage → Terracotta
- Affiche ">100%" ou le % exact (ex: "107%")
- La jauge "déborde" visuellement (effet subtil)

**Philosophy:** Information, pas jugement. "Tu as dépassé" ≠ "Tu as échoué"

---

### Flow 7: Dépenses Fixes & Abonnements

**Trigger:** Sidebar > Dépenses fixes OU Onboarding (optionnel)
**Goal:** Anticiper les prélèvements récurrents chaque mois

```
┌─────────────────────────────────────────────────────────────┐
│  PAGE: Dépenses Fixes                                       │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  Janvier 2026                    Total fixes: 892 €/mois    │
│                                                             │
│  Ce mois-ci                                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  5 jan   Spotify           9,99 €    ✓ Payé        │    │
│  │  8 jan   Salle de sport   35,00 €    ✓ Payé        │    │
│  │ 15 jan   Électricité      ~85,00 €   ✓ Payé        │    │
│  │ 28 jan   Loyer           650,00 €    ○ À venir     │    │
│  │ 30 jan   Internet         39,99 €    ○ À venir     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Restant à payer ce mois: 689,99 €                         │
│                                                             │
│  + Ajouter une dépense fixe                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘

         MODAL: Nouvelle dépense fixe
┌─────────────────────────────────────────────────────────────┐
│  Nouvelle dépense fixe                                [✕]   │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  Nom                                                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Netflix                                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Montant                                                    │
│  ○ Fixe      ┌──────────────┐                               │
│              │ 13,49 €      │                               │
│              └──────────────┘                               │
│  ○ Variable  ┌──────────────┐                               │
│     (≈)      │ ~80 €        │  (estimation moyenne)         │
│              └──────────────┘                               │
│                                                             │
│  Jour du mois                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │     15                                              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Catégorie (optionnel)                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Loisirs                                    ▼        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [        Ajouter        ]                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key UX Decisions:**
- **Timeline visuelle** : Voir les prélèvements à venir ce mois
- **Montant variable** : Pour factures qui changent (électricité, eau)
- **Statut** : ✓ Payé / ○ À venir
- **Anticipation** : "Restant à payer" = clarté sur l'argent bloqué
- **Catégorie optionnelle** : Lier aux budgets ou non

---

### Flow 8: Super-catégories (Budgets flexibles)

**Trigger:** Configuration dans Budgets > Créer une super-catégorie
**Goal:** Permettre de la flexibilité entre catégories liées

**Concept:** Certains budgets peuvent "s'emprunter" entre eux. Ex: Resto + Sorties + Loisirs = "Plaisir" avec enveloppe globale.

```
┌─────────────────────────────────────────────────────────────┐
│  MODAL: Créer une super-catégorie                     [✕]   │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  Nom de la super-catégorie                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Plaisir                                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Catégories incluses                                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ☑ Restaurant        300 €                          │    │
│  │ ☑ Sorties           150 €                          │    │
│  │ ☑ Loisirs           200 €                          │    │
│  │ ☐ Transport                                        │    │
│  │ ☐ Vêtements                                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Budget total "Plaisir": 650 €                              │
│                                                             │
│  Mode de fonctionnement:                                    │
│  ○ Strict (chaque catégorie indépendante)                   │
│  ● Flexible (les catégories peuvent s'équilibrer)          │
│                                                             │
│  ℹ️ Mode flexible: Si tu dépasses "Resto" mais pas         │
│     "Loisirs", le total "Plaisir" reste OK.                │
│                                                             │
│  [        Créer        ]                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Dashboard avec Super-catégorie:**
```
┌─────────────────────────────────────────────────────────────┐
│  PLAISIR                                   520 € / 650 €    │
│  ████████████████████░░░░░░░░  80%                          │
│                                                             │
│  ├─ Restaurant    280/300 €  ████████████████░░  93%       │
│  ├─ Sorties       140/150 €  ██████████████████░  93%      │
│  └─ Loisirs       100/200 €  ██████████░░░░░░░░  50%       │
│                                                             │
│  ✓ Total OK même si catégories individuelles serrées       │
└─────────────────────────────────────────────────────────────┘
```

**Key UX Decisions:**
- **Optionnel** : Feature avancée, pas obligatoire
- **Deux modes** : Strict (classique) ou Flexible (équilibrage)
- **Visuel hiérarchique** : Super-catégorie > sous-catégories
- **Feedback clair** : "Total OK" même si une sous-cat dépasse

---

### Flow 9: Gros Achat Planifié

**Trigger:** Sidebar > Objectifs > "Planifier un achat"
**Goal:** Deux stratégies pour les grosses dépenses

**Concept du PRD:** Deux modèles possibles :
- **Modèle A** : Acheter maintenant, "rembourser" sur les mois suivants
- **Modèle B** : Accumuler d'abord, acheter quand objectif atteint

```
┌─────────────────────────────────────────────────────────────┐
│  MODAL: Planifier un achat                            [✕]   │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  Nom de l'achat                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Nouveau vélo                                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Montant                                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 450 €                                               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ── Comment veux-tu procéder ? ──                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ○ ACHETER MAINTENANT                                │    │
│  │   L'achat est fait. Je "rembourse" sur X mois.     │    │
│  │                                                     │    │
│  │   Répartir sur: [  3  ] mois                       │    │
│  │   = 150 €/mois déduits de ton budget disponible    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ● ACCUMULER D'ABORD                                 │    │
│  │   J'économise jusqu'à avoir le montant.            │    │
│  │                                                     │    │
│  │   Objectif: [  3  ] mois                           │    │
│  │   = 150 €/mois à mettre de côté                    │    │
│  │   Achat prévu: Avril 2026                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [        Créer le plan        ]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Modèle A - Dashboard après achat:**
```
┌─────────────────────────────────────────────────────────────┐
│  REMBOURSEMENTS EN COURS                                    │
│                                                             │
│  🚲 Vélo                            150 € / 450 €          │
│  ████████░░░░░░░░░░░░░░  33% remboursé                      │
│  Reste: 300 € sur 2 mois                                   │
│                                                             │
│  ℹ️ -150 €/mois sur ton budget disponible                   │
└─────────────────────────────────────────────────────────────┘
```

**Modèle B - Dashboard accumulation:**
```
┌─────────────────────────────────────────────────────────────┐
│  ACHATS PLANIFIÉS                                           │
│                                                             │
│  🚲 Vélo - Avril 2026               300 € / 450 €          │
│  ████████████████░░░░░░  67% économisé                      │
│  Reste: 150 € (1 mois)                                     │
│                                                             │
│  [Marquer comme acheté]                                    │
└─────────────────────────────────────────────────────────────┘
```

**Key UX Decisions:**
- **Choix explicite** : L'utilisateur décide de sa stratégie
- **Calcul automatique** : Montant mensuel basé sur durée
- **Impact visible** : Montre comment ça affecte le budget
- **Flexibilité** : Changer de stratégie en cours de route possible

---

### Flow 10: Alertes Visuelles aux Seuils

**Trigger:** Automatique quand une catégorie atteint 50%, 75%, 100%
**Goal:** Feedback visuel progressif sans interruption

**Pas de notifications push** - uniquement visuel dans l'app.

```
État de la jauge selon le %:

  0-50%    Sage (vert)         Normal, tout va bien
           ████████░░░░░░░░░░

  50-75%   Sage → légèrement   Attention douce
           plus foncé          
           ████████████░░░░░░

  75-99%   Warning (orange)    Vigilance
           ████████████████░░
           
  100%+    Over (terracotta)   Dépassé - data point
           ████████████████████ +12%
```

**Dashboard Indicator:**
```
┌─────────────────────────────────────────────────────────────┐
│  Budgets du mois                                            │
│                                                             │
│  Courses        ████████████░░░░░░  520/600 €   87%  ⚠     │
│  Restaurant     ████████████████░░  280/300 €   93%  ⚠     │
│  Transport      ████████░░░░░░░░░░  80/150 €    53%        │
│  Sorties        ████████████████████ 165/150 € 110%  🔴    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Légende icônes:
  (rien) = OK (< 75%)
  ⚠      = Attention (75-99%)
  🔴     = Dépassé (≥ 100%)
```

**Key UX Decisions:**
- **Pas intrusif** : Pas de popup, pas de notification
- **Couleur progressive** : Feedback naturel par la couleur
- **Icône optionnelle** : Petit indicateur pour scan rapide
- **Toujours positif** : Même rouge = information, pas échec

---

## Step 11: Component Strategy

### Design System Components (DaisyUI + Tailwind)

**Composants réutilisés depuis DaisyUI :**

| Composant | Usage | Personnalisation |
|-----------|-------|------------------|
| `btn` | Boutons primaires/secondaires | Couleurs Sage, border-radius 10px |
| `card` | Conteneurs de dashboard | Shadow subtle, border-radius 16px |
| `modal` | Ajout dépense, création budget | Overlay semi-transparent |
| `input` | Champs de formulaire | Focus ring Sage |
| `select` | Dropdown catégories | Style cohérent avec inputs |
| `drawer` | Sidebar navigation | Fixed 240px, bg-cotton |
| `badge` | Indicateurs de statut | Couleurs de seuil |
| `tooltip` | Infobulles explicatives | Style discret |

---

### Custom Components

#### 1. CircularGauge (Jauge circulaire principale)

**Purpose:** Afficher le pourcentage restant du budget mensuel de manière visuelle et motivante.

**Reference:** Implémenté dans `ux-design-directions-v3.html` classe `.main-gauge`

**Anatomy:**
```
┌─────────────────────────────┐
│                             │
│     ╭───────────────╮       │
│    ╱                 ╲      │
│   │    ┌───────┐      │     │
│   │    │  40%  │      │     │  ← Cercle SVG (stroke-dasharray)
│   │    │restant│      │     │
│   │    │1 120 €│      │     │  ← Centre: %, label, montant
│   │    └───────┘      │     │
│    ╲                 ╱      │
│     ╰───────────────╯       │
│                             │
└─────────────────────────────┘
```

**Technical Specs:**
```css
.main-gauge {
  width: 220px;
  height: 220px;
  position: relative;
}

/* SVG Circle */
circle.gauge-bg {
  stroke: var(--bg-oat);      /* #F5F1EA */
  stroke-width: 16;
  fill: none;
}

circle.gauge-remaining {
  stroke: var(--primary);      /* #639A88 - dynamique selon seuil */
  stroke-width: 16;
  stroke-linecap: round;
  stroke-dasharray: 590.6;     /* 2 * π * r (r=94) */
  stroke-dashoffset: 236;      /* 590.6 * (1 - percent) */
  transform: rotate(-90deg);
  transition: stroke-dashoffset 600ms ease-in-out;
}
```

**Props (Svelte):**
```typescript
interface CircularGaugeProps {
  percent: number;           // 0-100+ (peut dépasser 100)
  value: string;             // "1 120 €"
  label?: string;            // "restant" | "utilisé"
  size?: 'sm' | 'md' | 'lg'; // 80px | 160px | 220px
  showCenter?: boolean;      // Afficher le centre
}
```

**States:**
| State | Couleur stroke | Condition |
|-------|----------------|-----------|
| Healthy | `--primary` (#639A88) | percent ≤ 50 |
| Caution | `--primary-hover` (#4F7D6E) | 50 < percent ≤ 75 |
| Warning | `--gauge-warning` (#D4A04D) | 75 < percent < 100 |
| Over | `--gauge-over` (#C07D5A) | percent ≥ 100 |

**Variants:**
- `lg` (220px) : Dashboard principal "Budget du mois"
- `md` (160px) : Summary cards
- `sm` (80px) : Catégories individuelles

**Accessibility:**
- `role="progressbar"`
- `aria-valuenow={percent}`
- `aria-valuemin="0"`
- `aria-valuemax="100"`
- `aria-label="Budget restant: {percent}%"`

---

#### 2. DonutChart (Répartition des dépenses)

**Purpose:** Visualiser la répartition des dépenses par catégorie dans un graphique circulaire.

**Reference:** Implémenté dans `ux-design-directions-v3.html` classe `.donut-gauge`

**Anatomy:**
```
┌─────────────────────────────────────────────┐
│                                             │
│     ╭───────────╮    ● Courses      35%    │
│    ╱  ████████   ╲   ● Resto        18%    │
│   │  ██      ██   │  ● Sorties      15%    │
│   │ ██ 1680€ ██   │  ● Transport    12%    │
│   │  ██      ██   │  ● Vêtements    10%    │
│    ╲  ████████   ╱   ● Loisirs      10%    │
│     ╰───────────╯                          │
│                                             │
└─────────────────────────────────────────────┘
     Donut SVG          Legend items
```

**Technical Specs:**
```css
.donut-gauge {
  width: 200px;
  height: 200px;
  position: relative;
}

/* Chaque segment est un cercle avec stroke-dasharray */
circle.donut-segment {
  fill: none;
  stroke-width: 32;
  stroke-linecap: butt;
  /* stroke-dasharray: segment, gap */
  /* stroke-dashoffset: rotation */
}
```

**Props (Svelte):**
```typescript
interface DonutChartProps {
  segments: {
    name: string;
    value: number;
    percent: number;
    color: string;
  }[];
  total: string;           // "1 680 €"
  centerLabel?: string;    // "dépensé"
  size?: number;           // Default 200
  showLegend?: boolean;
}
```

**Category Colors (from CSS variables):**
```css
--cat-courses: #639A88;
--cat-resto: #7DB8A8;
--cat-sorties: #D4A04D;
--cat-transport: #C07D5A;
--cat-vetements: #9B8AA0;
--cat-loisirs: #6B8CA0;
```

**Legend Component:**
```html
<div class="legend-item">
  <span class="legend-dot" style="background: {color}"></span>
  <span class="legend-name">{name}</span>
  <span class="legend-percent">{percent}%</span>
</div>
```

**Accessibility:**
- `role="img"`
- `aria-label="Répartition des dépenses: {description}"`
- Legend items clickable pour filtrer

---

#### 3. MiniGauge (Jauge compacte)

**Purpose:** Version réduite de CircularGauge pour affichages secondaires (épargne, catégories).

**Reference:** Implémenté dans `ux-design-directions-v3.html` classe `.mini-gauge`

**Anatomy:**
```
┌─────────┐
│  ╭───╮  │
│ │ 75%│  │  ← 48px × 48px
│  ╰───╯  │
└─────────┘
```

**Technical Specs:**
```css
.mini-gauge {
  width: 48px;
  height: 48px;
  position: relative;
}

.mini-gauge svg {
  viewBox: 0 0 48 48;
}

.mini-gauge circle {
  stroke-width: 4;
  cx: 24;
  cy: 24;
  r: 18;
  /* circumference = 2 * π * 18 ≈ 113 */
}

.mini-gauge-value {
  font-size: 11px;
  font-weight: 700;
}
```

**Props:**
```typescript
interface MiniGaugeProps {
  percent: number;
  color?: string;        // Default: #A8E6CF (savings green)
  bgColor?: string;      // Default: rgba(255,255,255,0.2)
  showPercent?: boolean; // Show % in center
  size?: number;         // 40-56px
}
```

**Usage Contexts:**
- Carte Patrimoine (objectif épargne)
- Liste des catégories compacte
- Projets d'épargne

---

#### 4. CategoryGauge (Jauge par catégorie)

**Purpose:** Afficher le budget d'une catégorie spécifique avec son pourcentage et montant.

**Reference:** Implémenté dans `ux-design-directions-v3.html` classe `.category-item`

**Anatomy:**
```
┌─────────────────┐
│     ╭───╮       │
│    │ 52%│       │  ← Gauge 80×80
│     ╰───╯       │
│                 │
│    Courses      │  ← Nom catégorie
│   312 / 600 €   │  ← Dépensé / Budget
└─────────────────┘
```

**Technical Specs:**
```css
.category-item {
  text-align: center;
  padding: 16px 8px;
  background: var(--bg-linen);
  border-radius: 12px;
  border: 1px solid var(--border-sand);
  cursor: pointer;
  transition: all 150ms ease;
}

.category-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.category-gauge {
  width: 80px;
  height: 80px;
  margin: 0 auto 12px;
}

.category-gauge circle {
  stroke-width: 8;
}
```

**Props:**
```typescript
interface CategoryGaugeProps {
  name: string;
  spent: number;
  budget: number;
  color: string;
  onClick?: () => void;
}
```

**Computed:**
```typescript
const percent = Math.round((spent / budget) * 100);
const displayPercent = percent > 100 ? `>${percent}%` : `${percent}%`;
```

**States:**
- Default : Fond linen, bordure sand
- Hover : translateY(-2px), shadow-hover
- Active/Selected : Bordure primary
- Over budget : Couleur terracotta

---

#### 5. DatePicker (Sélecteur de date calendrier)

**Purpose:** Permettre de sélectionner une date visuellement sans saisie manuelle.

**Anatomy:**
```
┌─────────────────────────────────────┐
│        ◀  Janvier 2026  ▶           │
├─────────────────────────────────────┤
│  Lu   Ma   Me   Je   Ve   Sa   Di   │
│                                     │
│       1    2    3    4    5    6    │
│   7   8    9   10   11   12   13    │
│  14  15   16   17   18   19   20    │
│  21 [22]  23   24   25   26   27    │  ← [22] = sélectionné
│  28  29   30   31                   │
└─────────────────────────────────────┘
```

**Technical Specs:**
```css
.date-picker {
  background: var(--bg-cotton);
  border: 1px solid var(--border-sand);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow-default);
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.date-picker-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.date-picker-day {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.date-picker-day:hover {
  background: var(--bg-oat);
}

.date-picker-day.selected {
  background: var(--primary);
  color: white;
}

.date-picker-day.today {
  border: 2px solid var(--primary);
}

.date-picker-day.other-month {
  color: var(--text-secondary);
  opacity: 0.5;
}
```

**Props:**
```typescript
interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
}
```

**Accessibility:**
- `role="grid"`
- Arrow keys navigation
- `aria-selected` on selected date
- `aria-label` with full date name

---

#### 6. TimelineList (Liste chronologique)

**Purpose:** Afficher une liste de dépenses fixes/récurrentes avec statut et timeline.

**Reference:** Inspiré de `.extras-list` dans v3

**Anatomy:**
```
┌─────────────────────────────────────────────┐
│  5 jan   ● Spotify        9,99 €   ✓ Payé  │
│  8 jan   ● Salle sport   35,00 €   ✓ Payé  │
│ 15 jan   ● Électricité   ~85,00 €  ✓ Payé  │
│ 28 jan   ○ Loyer        650,00 €  À venir  │
│ 30 jan   ○ Internet      39,99 €  À venir  │
└─────────────────────────────────────────────┘
```

**Technical Specs:**
```css
.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 60px auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-linen);
  border-radius: 10px;
}

.timeline-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.timeline-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.timeline-indicator.paid {
  background: var(--primary);
}

.timeline-indicator.pending {
  border: 2px solid var(--text-secondary);
  background: transparent;
}

.timeline-name {
  font-size: 14px;
  font-weight: 500;
}

.timeline-amount {
  font-size: 14px;
  font-weight: 600;
  text-align: right;
}

.timeline-amount.variable::before {
  content: "~";
  color: var(--text-secondary);
}

.timeline-status {
  font-size: 12px;
  color: var(--text-secondary);
}

.timeline-status.paid {
  color: var(--primary);
}
```

**Props:**
```typescript
interface TimelineListProps {
  items: {
    date: Date;
    name: string;
    amount: number;
    isVariable?: boolean;
    isPaid: boolean;
  }[];
  showTotal?: boolean;
}
```

---

#### 7. ProgressThreshold (Barre de progression avec seuils)

**Purpose:** Barre de progression linéaire avec couleur qui change selon les seuils.

**Anatomy:**
```
Budget courses                    520 / 600 €   87%
████████████████████████░░░░░░  ⚠
```

**Technical Specs:**
```css
.progress-threshold {
  height: 8px;
  background: var(--bg-oat);
  border-radius: 4px;
  overflow: hidden;
}

.progress-threshold-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 300ms ease, background 300ms ease;
}

/* États par seuil */
.progress-threshold-fill[data-state="healthy"] {
  background: var(--primary);
}

.progress-threshold-fill[data-state="caution"] {
  background: var(--primary-hover);
}

.progress-threshold-fill[data-state="warning"] {
  background: var(--gauge-warning);
}

.progress-threshold-fill[data-state="over"] {
  background: var(--gauge-over);
}
```

**Props:**
```typescript
interface ProgressThresholdProps {
  value: number;
  max: number;
  showLabel?: boolean;
  showIndicator?: boolean;  // ⚠ ou 🔴
  size?: 'sm' | 'md';       // 4px | 8px height
}
```

---

### Component Implementation Strategy

**Phase 1 - Core (MVP):**
1. `CircularGauge` - Essentiel pour le dashboard
2. `CategoryGauge` - Affichage des budgets par catégorie
3. `DatePicker` - Ajout de dépenses
4. `ProgressThreshold` - Feedbacks visuels

**Phase 2 - Enhanced:**
5. `DonutChart` - Répartition des dépenses
6. `MiniGauge` - Épargne et objectifs
7. `TimelineList` - Dépenses fixes

**Phase 3 - Polish:**
- Animations d'entrée
- Micro-interactions hover
- Transitions entre états

---

### Implementation Roadmap

| Composant | Priorité | Dépendances | Effort |
|-----------|----------|-------------|--------|
| CircularGauge | P0 | - | 4h |
| ProgressThreshold | P0 | - | 2h |
| CategoryGauge | P0 | CircularGauge | 2h |
| DatePicker | P0 | - | 4h |
| DonutChart | P1 | - | 4h |
| MiniGauge | P1 | CircularGauge | 1h |
| TimelineList | P2 | - | 3h |

**Total estimé :** ~20h de développement composants

---

## Step 12: UX Consistency Patterns

### Feedback Patterns

#### Seuils de couleur (Budget Status)

Le système de feedback visuel est au cœur de l'expérience Budget_planner. Les couleurs communiquent l'état du budget sans jugement.

| Seuil | Couleur | Variable CSS | Signification | Message implicite |
|-------|---------|--------------|---------------|-------------------|
| 0-50% | Sage | `--primary` (#639A88) | Healthy | "Tu gères bien" |
| 50-75% | Sage foncé | `--primary-hover` (#4F7D6E) | Attention douce | "Continue comme ça" |
| 75-99% | Orange | `--gauge-warning` (#D4A04D) | Vigilance | "Fais attention" |
| 100%+ | Terracotta | `--gauge-over` (#C07D5A) | Dépassé | "C'est une donnée" |

**Principe fondamental :** Même le rouge n'est pas un échec. C'est de l'information pour mieux calibrer le mois suivant.

#### Toast Notifications

Notifications non-intrusives qui apparaissent en bas à droite.

```
┌─────────────────────────────────────────────┐
│  ✓  Dépense ajoutée                    [✕]  │
│     Courses Carrefour - 47,50 €             │
└─────────────────────────────────────────────┘
```

**Types de toasts :**

| Type | Icône | Couleur bordure | Durée | Usage |
|------|-------|-----------------|-------|-------|
| Success | ✓ | Sage | 3s | Confirmation d'action |
| Warning | ⚠ | Orange | 5s | Dépassement de budget |
| Error | ✕ | Terracotta | Sticky | Erreur à corriger |
| Info | ℹ | Blue-grey | 4s | Information neutre |

**Specs CSS :**
```css
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--bg-cotton);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: var(--shadow-hover);
  border-left: 4px solid var(--toast-color);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 360px;
  animation: slideIn 300ms ease-out;
}

.toast-success { --toast-color: var(--primary); }
.toast-warning { --toast-color: var(--gauge-warning); }
.toast-error { --toast-color: var(--gauge-over); }
.toast-info { --toast-color: var(--secondary); }

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

#### Micro-animations

**Jauges :**
```css
/* Remplissage progressif */
.gauge-fill {
  transition: stroke-dashoffset 600ms ease-in-out;
}

/* Changement de couleur au seuil */
.gauge-fill {
  transition: stroke 300ms ease, stroke-dashoffset 600ms ease-in-out;
}
```

**Cards au hover :**
```css
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
  transition: all 150ms ease;
}
```

**Boutons :**
```css
.btn:hover {
  transform: translateY(-1px);
  transition: all 150ms ease;
}

.btn:active {
  transform: translateY(0);
}
```

---

### Button Hierarchy

#### Types de boutons

| Type | Usage | Exemple | Style |
|------|-------|---------|-------|
| **Primary** | Action principale unique | "Ajouter dépense" | Sage filled |
| **Secondary** | Actions importantes | "Enregistrer" | Sage outline |
| **Ghost** | Actions tertiaires | "Annuler" | Text only |
| **Danger** | Suppression/destructif | "Supprimer" | Terracotta |
| **Icon** | Actions compactes | Fermer modal | Icon only |

**Specs CSS :**
```css
/* Primary */
.btn-primary {
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-hover);
}

/* Secondary */
.btn-secondary {
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);
  padding: 10px 18px;
  border-radius: 10px;
}

.btn-secondary:hover {
  background: var(--primary);
  color: white;
}

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  padding: 12px 20px;
}

.btn-ghost:hover {
  color: var(--text-primary);
  background: var(--bg-oat);
}

/* Danger */
.btn-danger {
  background: var(--gauge-over);
  color: white;
  border: none;
}

/* Icon button */
.btn-icon {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: transparent;
  color: var(--text-secondary);
}

.btn-icon:hover {
  background: var(--bg-oat);
  color: var(--text-primary);
}
```

#### Règles de placement

| Contexte | Primary | Secondary | Ghost |
|----------|---------|-----------|-------|
| Modal actions | À droite | À gauche du primary | - |
| Page actions | Header droite | - | - |
| Form | En bas, full width ou droite | À gauche | Lien "Annuler" |
| Card | Dans la card | - | - |

---

### Form Patterns

#### Structure d'un champ

```
Label
┌─────────────────────────────────────┐
│ Placeholder ou valeur               │
└─────────────────────────────────────┘
Helper text ou message d'erreur
```

**Specs CSS :**
```css
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  padding: 12px 16px;
  border: 1px solid var(--border-sand);
  border-radius: 10px;
  font-size: 14px;
  background: var(--bg-cotton);
  transition: all 150ms ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 154, 136, 0.1);
}

.form-input.error {
  border-color: var(--gauge-over);
}

.form-helper {
  font-size: 12px;
  color: var(--text-secondary);
}

.form-error {
  font-size: 12px;
  color: var(--gauge-over);
}
```

#### Validation

**Validation en temps réel :**
- Montant : Valider au blur, afficher erreur si non-numérique ou négatif
- Catégorie : Required, afficher erreur si vide à la soumission
- Date : Valider format, ne pas permettre dates futures lointaines

**Messages d'erreur :**

| Champ | Erreur | Message |
|-------|--------|---------|
| Montant | Vide | "Le montant est requis" |
| Montant | Invalide | "Entrez un montant valide" |
| Montant | Négatif | "Le montant doit être positif" |
| Catégorie | Vide | "Sélectionnez une catégorie" |
| Nom budget | Vide | "Donnez un nom à ce budget" |
| Nom budget | Doublon | "Ce budget existe déjà" |

**Pattern de feedback :**
```
✓ Valide    → Bordure verte discrète (optionnel)
✕ Invalide  → Bordure terracotta + message sous le champ
○ Neutre    → Bordure sand (par défaut)
```

---

### Navigation Patterns

#### Sidebar

**Structure :**
```
┌──────────────────────┐
│ 🌿 Budget_planner    │  ← Logo + nom (toujours visible)
├──────────────────────┤
│ ◉ Dashboard          │  ← Item actif (bg primary)
│ ○ Transactions       │
│ ○ Budgets            │
│ ○ Patrimoine         │
│ ○ Objectifs          │
│ ○ Analyses           │
├──────────────────────┤  ← Séparateur
│ PARAMÈTRES           │  ← Section label
│ ○ Préférences        │
│ ○ Aide               │
└──────────────────────┘
```

**États des items :**

| État | Style |
|------|-------|
| Default | Text secondary, bg transparent |
| Hover | Text primary, bg oat |
| Active | Text white, bg primary |

**Specs CSS :**
```css
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.nav-item:hover {
  background: var(--bg-oat);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--primary);
  color: white;
}
```

#### Breadcrumbs (si nécessaire)

Pour les pages profondes (ex: détail d'un budget spécifique).

```
Dashboard  /  Budgets  /  Courses alimentaires
```

**Règle :** Maximum 3 niveaux. Si plus, repenser l'architecture.

---

### Modal Patterns

#### Types de modales

| Type | Usage | Taille | Fermeture |
|------|-------|--------|-----------|
| **Form modal** | Ajout dépense, création | Medium (480px) | X, Escape, clic extérieur |
| **Confirmation** | Suppression, action importante | Small (360px) | Boutons uniquement |
| **Full form** | Onboarding, planning | Large (640px) | X, bouton "Terminer" |

**Structure Form Modal :**
```
┌─────────────────────────────────────────────┐
│  Titre de la modale                    [✕]  │
├─────────────────────────────────────────────┤
│                                             │
│  Contenu du formulaire                      │
│  ...                                        │
│                                             │
├─────────────────────────────────────────────┤
│              [Annuler]  [Confirmer]         │
└─────────────────────────────────────────────┘
```

**Specs CSS :**
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(45, 37, 32, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 200ms ease;
}

.modal {
  background: var(--bg-cotton);
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(45, 37, 32, 0.15);
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: scaleIn 200ms ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-sand);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-sand);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

#### Confirmation de suppression

```
┌─────────────────────────────────────────────┐
│  Supprimer ce budget ?                      │
├─────────────────────────────────────────────┤
│                                             │
│  Tu es sur le point de supprimer le budget  │
│  "Restaurant". Cette action est             │
│  irréversible.                              │
│                                             │
│  Les dépenses associées seront conservées   │
│  mais non catégorisées.                     │
│                                             │
├─────────────────────────────────────────────┤
│              [Annuler]  [Supprimer]         │
│                         (rouge)             │
└─────────────────────────────────────────────┘
```

**Règle :** Toujours expliquer les conséquences avant une action destructive.

---

### Empty States

#### Premier lancement (Onboarding)

```
┌─────────────────────────────────────────────┐
│                                             │
│           🌿                                │
│                                             │
│     Bienvenue sur Budget_planner            │
│                                             │
│     Prenons quelques minutes pour           │
│     configurer ton espace financier.        │
│                                             │
│         [Commencer →]                       │
│                                             │
└─────────────────────────────────────────────┘
```

#### Catégorie vide

```
┌─────────────────────────────────────────────┐
│                                             │
│           ○                                 │
│                                             │
│     Aucune dépense ce mois                  │
│                                             │
│     Les dépenses "Restaurant" apparaîtront  │
│     ici quand tu en ajouteras.              │
│                                             │
│         [+ Ajouter une dépense]             │
│                                             │
└─────────────────────────────────────────────┘
```

#### Mois futur

```
┌─────────────────────────────────────────────┐
│                                             │
│           📅                                │
│                                             │
│     Février 2026                            │
│                                             │
│     Ce mois n'a pas encore commencé.        │
│     Tu pourras définir tes budgets à        │
│     partir du 25 janvier.                   │
│                                             │
└─────────────────────────────────────────────┘
```

**Règles Empty States :**
1. Toujours un visuel (icône simple, pas de robot triste)
2. Message court et positif
3. Action claire si possible
4. Ton léger, jamais culpabilisant

---

### Loading States

#### Skeleton loading

Pendant le chargement des données, afficher des "squelettes" animés.

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-oat) 25%,
    var(--bg-linen) 50%,
    var(--bg-oat) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Skeleton pour une card :**
```
┌─────────────────────────────────────────────┐
│  ████████                                   │
│                                             │
│     ╭───────╮                               │
│    │ ░░░░░░ │    ████████████               │
│     ╰───────╯    ████████                   │
│                                             │
│  ████████████████████████████               │
└─────────────────────────────────────────────┘
```

#### Spinner (actions courtes)

Pour les actions < 2 secondes (sauvegarde, etc.)

```css
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-sand);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 800ms linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

### Data Entry Patterns

#### Montant (€)

**Input spécialisé pour les montants :**
```
┌─────────────────────────────────────┐
│                           47,50  €  │
└─────────────────────────────────────┘
```

- Symbole € à droite, non éditable
- Séparateur décimal : virgule (locale FR)
- Maximum 2 décimales
- Padding numérique (aligné à droite)

**Validation :**
- Accepte : `47`, `47,5`, `47,50`, `1234,56`
- Refuse : `47.50`, `-12`, `abc`, `12,345`

#### Quick Actions

**Raccourcis clavier globaux :**

| Raccourci | Action |
|-----------|--------|
| `N` ou `+` | Nouvelle dépense |
| `Escape` | Fermer modal |
| `Enter` | Confirmer (dans modal) |
| `?` | Aide / raccourcis |

---

### Consistency Checklist

| Élément | Valeur | Appliqué partout |
|---------|--------|------------------|
| Border radius cards | 16px | ✓ |
| Border radius buttons | 10px | ✓ |
| Border radius inputs | 10px | ✓ |
| Padding cards | 24px | ✓ |
| Padding modal body | 24px | ✓ |
| Gap between elements | 12-24px | ✓ |
| Transition duration | 150ms | ✓ |
| Shadow subtle | 0 1px 2px rgba(45,37,32,0.04) | ✓ |
| Shadow hover | 0 4px 12px rgba(45,37,32,0.08) | ✓ |
| Font body | 14px | ✓ |
| Font small | 12px | ✓ |

---

## Step 13: Responsive Design & Accessibility

### Responsive Strategy

**Approche : Desktop-First (PC prioritaire)**

Budget_planner est conçu comme une PWA avec priorité PC. Le mobile est supporté mais n'est pas le cas d'usage principal.

| Plateforme | Priorité | Usage principal |
|------------|----------|-----------------|
| Desktop (1024px+) | 🔴 Primary | Planning mensuel, analyses détaillées |
| Tablet (768-1023px) | 🟡 Secondary | Consultation, ajout rapide |
| Mobile (< 768px) | 🟢 Tertiary | Ajout dépense en déplacement |

#### Desktop (≥ 1024px)

**Layout :**
- Sidebar fixe 240px
- Main content fluid (max-width: 1200px)
- Grid 2 colonnes pour dashboard cards
- Tous les éléments visibles

```
┌──────────┬─────────────────────────────────┐
│          │  Header (sticky)                │
│ Sidebar  ├─────────────────────────────────┤
│  240px   │  ┌─────────┐  ┌─────────┐       │
│          │  │ Card 1  │  │ Card 2  │       │
│          │  └─────────┘  └─────────┘       │
│          │  ┌─────────┐  ┌─────────┐       │
│          │  │ Card 3  │  │ Card 4  │       │
│          │  └─────────┘  └─────────┘       │
└──────────┴─────────────────────────────────┘
```

#### Tablet (768px - 1023px)

**Adaptations :**
- Sidebar devient collapsible (hamburger)
- Grid passe à 1 colonne
- Touch targets augmentés (48px minimum)
- Cards full-width

```
┌─────────────────────────────────────────────┐
│  ☰  Budget_planner         Janvier 2026    │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ Card 1 - Budget du mois             │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ Card 2 - Répartition                │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

#### Mobile (< 768px)

**Adaptations :**
- Header compact
- Navigation bottom bar
- Cards stackées verticalement
- Modales full-screen
- Jauges réduites (160px)
- Font sizes légèrement réduits

```
┌─────────────────────────┐
│  Budget_planner    ☰   │
├─────────────────────────┤
│                         │
│   ┌───────────────┐    │
│   │    Card 1     │    │
│   └───────────────┘    │
│                         │
│   ┌───────────────┐    │
│   │    Card 2     │    │
│   └───────────────┘    │
│                         │
├─────────────────────────┤
│  🏠   📊   ➕   💰   ⚙️  │  ← Bottom nav
└─────────────────────────┘
```

---

### Breakpoint Strategy

**Breakpoints Tailwind utilisés :**

```css
/* Mobile first approach dans le code, mais design desktop-first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md - Tablet */ }
@media (min-width: 1024px) { /* lg - Desktop */ }
@media (min-width: 1280px) { /* xl - Large desktop */ }
```

**Variables CSS responsive :**

```css
:root {
  /* Spacing adaptatif */
  --page-padding: 16px;
  --card-padding: 16px;
  --gauge-size: 160px;
}

@media (min-width: 768px) {
  :root {
    --page-padding: 24px;
    --card-padding: 20px;
    --gauge-size: 180px;
  }
}

@media (min-width: 1024px) {
  :root {
    --page-padding: 32px;
    --card-padding: 24px;
    --gauge-size: 220px;
  }
}
```

**Composants adaptatifs :**

| Composant | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| CircularGauge | 160px | 180px | 220px |
| CategoryGauge | 60px | 70px | 80px |
| Card padding | 16px | 20px | 24px |
| Grid columns | 1 | 1-2 | 2 |
| Sidebar | Hidden (bottom nav) | Collapsible | Fixed 240px |
| Modal | Full-screen | 90% width | 480px max |

---

### Accessibility Strategy

**Niveau de conformité : WCAG 2.1 AA**

C'est le standard recommandé pour les applications web modernes.

#### Contraste des couleurs

| Élément | Ratio requis | Notre ratio | Status |
|---------|--------------|-------------|--------|
| Text primary sur Linen | 4.5:1 | 7.2:1 ✓ | Pass |
| Text secondary sur Linen | 4.5:1 | 4.8:1 ✓ | Pass |
| White sur Sage | 4.5:1 | 4.6:1 ✓ | Pass |
| Sage sur Linen | 3:1 (large text) | 3.5:1 ✓ | Pass |

#### Navigation clavier

**Focus visible :**
```css
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Reset pour mouse users */
*:focus:not(:focus-visible) {
  outline: none;
}
```

**Tab order logique :**
1. Skip link (caché, apparaît au focus)
2. Sidebar navigation
3. Header actions
4. Main content (top to bottom, left to right)
5. Modal content (quand ouverte)

**Skip link :**
```html
<a href="#main-content" class="skip-link">
  Aller au contenu principal
</a>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  z-index: 9999;
}

.skip-link:focus {
  top: 0;
}
```

#### ARIA labels

**Jauges :**
```html
<div 
  role="progressbar" 
  aria-valuenow="40" 
  aria-valuemin="0" 
  aria-valuemax="100"
  aria-label="Budget restant: 40%, soit 1120 euros"
>
  <!-- SVG gauge -->
</div>
```

**Navigation :**
```html
<nav aria-label="Navigation principale">
  <ul role="list">
    <li><a href="/dashboard" aria-current="page">Dashboard</a></li>
    <li><a href="/transactions">Transactions</a></li>
  </ul>
</nav>
```

**Modales :**
```html
<div 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Nouvelle dépense</h2>
  <!-- content -->
</div>
```

#### Touch targets

| Élément | Taille minimum | Notre taille |
|---------|----------------|--------------|
| Boutons | 44×44px | 44px height ✓ |
| Nav items | 44×44px | 48px height ✓ |
| Icon buttons | 44×44px | 40×40px ⚠ (à corriger mobile) |
| Form inputs | 44px height | 44px ✓ |

**Correction mobile pour icon buttons :**
```css
@media (max-width: 767px) {
  .btn-icon {
    width: 44px;
    height: 44px;
  }
}
```

#### Screen readers

**Texte alternatif pour les jauges :**
- Annonce le pourcentage + montant
- Ex: "Budget courses: 52% utilisé, 312 euros sur 600"

**Annonces dynamiques :**
```html
<div aria-live="polite" aria-atomic="true" class="sr-only">
  <!-- Messages dynamiques annoncés aux screen readers -->
</div>
```

**Classes utilitaires :**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

### Motion & Reduced Motion

**Respect des préférences utilisateur :**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Animations essentielles conservées :**
- Remplissage des jauges (réduit mais visible)
- Feedback de validation (instantané)

---

### Color Blindness Support

**Stratégie : Ne jamais se fier uniquement à la couleur**

| Information | Couleur | Indicateur additionnel |
|-------------|---------|------------------------|
| Budget OK | Vert | Aucun icône |
| Attention | Orange | Icône ⚠ |
| Dépassé | Terracotta | Icône 🔴 + texte ">100%" |
| Succès | Vert | Icône ✓ |
| Erreur | Rouge | Icône ✕ + message texte |

**Test avec simulateurs :**
- Deuteranopia (vert-rouge)
- Protanopia (rouge)
- Tritanopia (bleu-jaune)

---

### Testing Strategy

#### Tests automatisés

| Outil | Usage |
|-------|-------|
| axe-core | Audit accessibilité automatisé |
| Lighthouse | Performance + Accessibility score |
| Pa11y | CI/CD accessibility checks |

**Intégration CI :**
```bash
# Dans le pipeline de build
npx axe-core --exit-code 1  # Fail si erreurs critiques
```

#### Tests manuels

**Checklist responsive :**
- [ ] Desktop Chrome 1920×1080
- [ ] Desktop Firefox 1440×900
- [ ] iPad Pro (1024×1366)
- [ ] iPad (768×1024)
- [ ] iPhone 14 Pro (393×852)
- [ ] iPhone SE (375×667)
- [ ] Android (360×800)

**Checklist accessibilité :**
- [ ] Navigation 100% clavier
- [ ] VoiceOver (macOS/iOS)
- [ ] Zoom 200% lisible
- [ ] Contraste mode sombre (futur)
- [ ] Focus visible partout

---

### Implementation Guidelines

#### HTML sémantique

```html
<main id="main-content">
  <header>
    <h1>Dashboard</h1>
  </header>
  
  <section aria-labelledby="budget-heading">
    <h2 id="budget-heading">Budget du mois</h2>
    <!-- content -->
  </section>
  
  <section aria-labelledby="expenses-heading">
    <h2 id="expenses-heading">Répartition des dépenses</h2>
    <!-- content -->
  </section>
</main>
```

#### Responsive images

```html
<picture>
  <source media="(min-width: 1024px)" srcset="chart-lg.png">
  <source media="(min-width: 768px)" srcset="chart-md.png">
  <img src="chart-sm.png" alt="Graphique de répartition des dépenses">
</picture>
```

#### Formulaires accessibles

```html
<div class="form-group">
  <label for="expense-amount">Montant</label>
  <input 
    type="text"
    id="expense-amount"
    inputmode="decimal"
    aria-describedby="amount-hint amount-error"
    aria-invalid="false"
  >
  <span id="amount-hint" class="form-helper">
    Entrez le montant en euros
  </span>
  <span id="amount-error" class="form-error" hidden>
    Le montant doit être un nombre positif
  </span>
</div>
```

---

### PWA Requirements

**Manifest.json :**
```json
{
  "name": "Budget_planner",
  "short_name": "Budget",
  "description": "Prends le contrôle de tes finances",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAF7F2",
  "theme_color": "#639A88",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Service Worker :**
- Cache assets statiques (CSS, JS, images)
- Cache-first pour les ressources
- Network-first pour les données API
- Offline fallback page

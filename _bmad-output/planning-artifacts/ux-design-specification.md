---
stepsCompleted: [1, 2, 3, 4, 5]
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

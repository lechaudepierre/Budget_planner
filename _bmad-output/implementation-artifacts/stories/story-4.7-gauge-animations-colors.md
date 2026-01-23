# Story 4.7: Gauge Animations & Color Progression

## User Story
As a user,
I want gauges to animate smoothly and change color based on my spending,
So that I get satisfying, informative visual feedback.

## Acceptance Criteria

### AC1: Smooth Animation on Update
**Given** I add an expense
**When** I return to the dashboard
**Then** the affected gauge animates smoothly from the old percentage to the new
**And** the animation takes 300-400ms with ease-in-out timing

### AC2: Healthy State (0-75%)
**Given** my spending is 0-75% of budget (healthy)
**When** I view the gauge
**Then** the gauge color is Sage (#639A88)

### AC3: Caution State (75-100%)
**Given** my spending is 75-100% of budget (caution)
**When** I view the gauge
**Then** the gauge color is Warm Amber (#D4A04D)

### AC4: Over Budget State (>100%)
**Given** my spending exceeds 100% of budget (over)
**When** I view the gauge
**Then** the gauge color is Soft Terracotta (#C07D5A)
**And** the gauge displays >100% (e.g., "112%")
**And** there is NO alarming red or negative messaging

### AC5: Smooth Color Transition
**Given** my spending changes and crosses a threshold
**When** I view the gauge
**Then** the color transition is smooth, not jarring

## Technical Notes

### Gauge Colors Utility (src/lib/utils/gauge-colors.ts)
```typescript
export const GAUGE_COLORS = {
    healthy: '#639A88',   // Sage - 0-75%
    caution: '#D4A04D',   // Amber - 75-100%
    over: '#C07D5A'       // Terracotta - >100%
} as const;

export function getGaugeColor(percentage: number): string {
    if (percentage <= 75) return GAUGE_COLORS.healthy;
    if (percentage <= 100) return GAUGE_COLORS.caution;
    return GAUGE_COLORS.over;
}

export function getGaugeStatus(percentage: number): 'healthy' | 'caution' | 'over' {
    if (percentage <= 75) return 'healthy';
    if (percentage <= 100) return 'caution';
    return 'over';
}

// For smooth color interpolation
export function interpolateColor(color1: string, color2: string, factor: number): string {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    
    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));
    
    return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}
```

### Enhanced Circular Gauge with Animation (update CircularGauge.svelte)
```svelte
<script lang="ts">
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import { getGaugeColor } from '$lib/utils/gauge-colors';

    let {
        percentage = 0,
        label,
        spent,
        budget,
        size = 80
    }: {
        percentage: number;
        label: string;
        spent: number;
        budget: number;
        size?: number;
    } = $props();

    // Animated percentage value
    const animatedPercentage = tweened(0, {
        duration: 400,
        easing: cubicOut
    });

    // Update animated value when percentage changes
    $effect(() => {
        animatedPercentage.set(percentage);
    });

    // SVG calculations
    const strokeWidth = size * 0.1;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    // Use animated value for visual display
    let displayPercentage = $derived($animatedPercentage);
    let dashOffset = $derived(circumference - (Math.min(displayPercentage, 100) / 100) * circumference);
    let gaugeColor = $derived(getGaugeColor(percentage));
</script>

<div class="flex flex-col items-center">
    <svg width={size} height={size} viewBox="0 0 {size} {size}" class="drop-shadow-sm">
        <!-- Background circle -->
        <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E2DCD2"
            stroke-width={strokeWidth}
        />
        <!-- Progress circle with animation -->
        <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={gaugeColor}
            stroke-width={strokeWidth}
            stroke-linecap="round"
            stroke-dasharray={circumference}
            stroke-dashoffset={dashOffset}
            transform="rotate(-90 {size / 2} {size / 2})"
            style="transition: stroke 0.3s ease-out;"
        />
        <!-- Percentage text -->
        <text
            x={size / 2}
            y={size / 2}
            text-anchor="middle"
            dominant-baseline="middle"
            class="font-semibold"
            style="font-size: {size * 0.18}px; fill: {gaugeColor}; transition: fill 0.3s ease-out;"
        >
            {Math.round(displayPercentage)}%
        </text>
    </svg>
    
    <!-- Category name -->
    <span class="text-xs text-gray-600 mt-1 text-center truncate max-w-[80px]">
        {label}
    </span>
    
    <!-- Spent/Budget with color indicator -->
    <span 
        class="text-xs transition-colors duration-300"
        style="color: {gaugeColor}"
    >
        {formatCompact(spent)} / {formatCompact(budget)}
    </span>
</div>

<script context="module" lang="ts">
    function formatCompact(value: number): string {
        if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k';
        }
        return Math.round(value) + '€';
    }
</script>
```

### CSS Transitions
```css
/* In app.css or component style */
.gauge-transition {
    transition: stroke 0.3s ease-out, fill 0.3s ease-out;
}
```

### Performance Considerations
- Use `tweened` for smooth number animations (Svelte motion)
- CSS transitions for color changes (GPU accelerated)
- Avoid re-renders during animation
- Target 60fps (NFR3 requirement)

## Files to Create/Modify
1. `src/lib/utils/gauge-colors.ts` - Create color utilities
2. `src/lib/components/gauges/CircularGauge.svelte` - Add animations
3. `src/app.css` - Add transition classes if needed

## Dependencies
- Story 4.6 must be complete

# Story 4.8: Category Breakdown Donut Chart

## User Story
As a user,
I want to see a donut chart showing how my spending is distributed across categories,
So that I can understand my spending patterns at a glance.

## Acceptance Criteria

### AC1: Donut Chart Display
**Given** I am on the dashboard
**When** I view the "Répartition des dépenses" card
**Then** I see a donut chart showing category breakdown
**And** each segment is colored by category
**And** I see a legend with category names and percentages

### AC2: Segment Interaction
**Given** I hover over a segment
**When** I view the chart
**Then** the segment highlights
**And** I see the exact amount and percentage

### AC3: Empty State
**Given** I have no expenses this month
**When** I view the chart
**Then** I see an empty state or placeholder

### AC4: Proportional Segments
**Given** my spending is: Courses 40%, Resto 25%, Transport 15%, Autres 20%
**When** I view the chart
**Then** segments are sized proportionally
**And** the legend is sorted by value (highest first)

## Technical Notes

### Donut Chart Component (src/lib/components/dashboard/ExpenseBreakdown.svelte)
```svelte
<script lang="ts">
    import type { CategoryWithSpending } from '$lib/types/database';
    import { formatCurrency } from '$lib/utils/format';

    let { categories = [] }: { categories: CategoryWithSpending[] } = $props();

    // Filter to only categories with spending, sorted by amount
    let categoriesWithSpending = $derived(
        categories
            .filter(c => c.spent > 0)
            .sort((a, b) => b.spent - a.spent)
    );

    // Calculate total spending
    let totalSpending = $derived(
        categoriesWithSpending.reduce((sum, c) => sum + c.spent, 0)
    );

    // Calculate percentages and angles for each segment
    let segments = $derived.by(() => {
        if (totalSpending === 0) return [];
        
        let currentAngle = 0;
        return categoriesWithSpending.map(category => {
            const percentage = (category.spent / totalSpending) * 100;
            const angle = (percentage / 100) * 360;
            const segment = {
                ...category,
                percentage,
                startAngle: currentAngle,
                endAngle: currentAngle + angle
            };
            currentAngle += angle;
            return segment;
        });
    });

    // For hover state
    let hoveredSegment = $state<string | null>(null);

    // SVG calculations
    const size = 180;
    const strokeWidth = 35;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    function getPathData(startAngle: number, endAngle: number): string {
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);
        
        const x1 = size / 2 + radius * Math.cos(startRad);
        const y1 = size / 2 + radius * Math.sin(startRad);
        const x2 = size / 2 + radius * Math.cos(endRad);
        const y2 = size / 2 + radius * Math.sin(endRad);
        
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
        
        return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
    }
</script>

<div class="bg-white rounded-xl p-6 shadow-sm">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Répartition des dépenses</h2>
    
    {#if segments.length === 0}
        <div class="text-center py-8">
            <div class="text-4xl mb-3">🍩</div>
            <p class="text-gray-500">Aucune dépense ce mois</p>
        </div>
    {:else}
        <div class="flex flex-col sm:flex-row items-center gap-6">
            <!-- Donut Chart -->
            <div class="relative">
                <svg width={size} height={size} viewBox="0 0 {size} {size}">
                    {#each segments as segment}
                        <path
                            d={getPathData(segment.startAngle, segment.endAngle)}
                            fill="none"
                            stroke={segment.color}
                            stroke-width={strokeWidth}
                            stroke-linecap="butt"
                            class="transition-all duration-200 cursor-pointer"
                            class:opacity-70={hoveredSegment && hoveredSegment !== segment.id}
                            onmouseenter={() => hoveredSegment = segment.id}
                            onmouseleave={() => hoveredSegment = null}
                        />
                    {/each}
                </svg>
                
                <!-- Center total -->
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-sm text-gray-500">Total</span>
                    <span class="text-lg font-bold text-gray-800">
                        {formatCurrency(totalSpending)}
                    </span>
                </div>
            </div>
            
            <!-- Legend -->
            <div class="flex-1 space-y-2">
                {#each segments as segment}
                    <div 
                        class="flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer"
                        class:bg-oat={hoveredSegment === segment.id}
                        onmouseenter={() => hoveredSegment = segment.id}
                        onmouseleave={() => hoveredSegment = null}
                    >
                        <div class="flex items-center gap-2">
                            <div 
                                class="w-3 h-3 rounded-full"
                                style="background-color: {segment.color}"
                            ></div>
                            <span class="text-sm text-gray-700">{segment.name}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-sm font-medium text-gray-800">
                                {formatCurrency(segment.spent)}
                            </span>
                            <span class="text-xs text-gray-500 ml-1">
                                ({Math.round(segment.percentage)}%)
                            </span>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>
```

### Alternative: Using a Lightweight Chart Library
If SVG-based approach becomes complex, consider:
- `chart.js` with `svelte-chartjs` wrapper
- `pancake` (Svelte-specific)
- Custom implementation is preferred for our simple use case

### Data Requirements
- Uses same `CategoryWithSpending` data as gauges
- Filter categories to only those with spending > 0
- Sort by spending amount (descending)

### UI/UX Notes
- Donut chart with center hole showing total
- Category colors from predefined palette
- Hover highlights both segment and legend item
- Legend sorted by amount (highest first)
- Responsive: chart above legend on mobile, side by side on desktop

## Files to Create/Modify
1. `src/lib/components/dashboard/ExpenseBreakdown.svelte`
2. `src/routes/+page.svelte` - Dashboard integration

## Dependencies
- Story 4.6 must be complete (CategoryWithSpending type)
- Expenses data available

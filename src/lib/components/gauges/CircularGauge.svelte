<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { getGaugeColor, formatCompact } from '$lib/utils/gauge-colors';

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
	const strokeWidth = size * 0.12;
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
			style="font-size: {size * 0.2}px; fill: {gaugeColor}; transition: fill 0.3s ease-out;"
		>
			{Math.round(displayPercentage)}%
		</text>
	</svg>

	<!-- Category name -->
	<span
		class="text-xs text-gray-600 mt-1 text-center truncate"
		style="max-width: {size}px;"
		title={label}
	>
		{label}
	</span>

	<!-- Spent/Budget with color indicator -->
	<span class="text-xs transition-colors duration-300" style="color: {gaugeColor}">
		{formatCompact(spent)} / {formatCompact(budget)}
	</span>
</div>

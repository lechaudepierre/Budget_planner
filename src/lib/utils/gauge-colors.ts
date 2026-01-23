/**
 * Gauge color utilities for budget visualization
 */

export const GAUGE_COLORS = {
	healthy: '#639A88', // Sage - 0-75%
	caution: '#D4A04D', // Amber - 75-100%
	over: '#C07D5A' // Terracotta - >100%
} as const;

/**
 * Get the appropriate gauge color based on percentage
 * @param percentage - The budget utilization percentage
 * @returns Hex color code
 */
export function getGaugeColor(percentage: number): string {
	if (percentage <= 75) return GAUGE_COLORS.healthy;
	if (percentage <= 100) return GAUGE_COLORS.caution;
	return GAUGE_COLORS.over;
}

/**
 * Get the gauge status based on percentage
 * @param percentage - The budget utilization percentage
 * @returns Status string
 */
export function getGaugeStatus(percentage: number): 'healthy' | 'caution' | 'over' {
	if (percentage <= 75) return 'healthy';
	if (percentage <= 100) return 'caution';
	return 'over';
}

/**
 * Format a compact number for gauge display
 * @param value - The number to format
 * @returns Formatted string like "1,2k€" or "123€"
 */
export function formatCompact(value: number): string {
	if (value >= 1000) {
		return (value / 1000).toFixed(1).replace('.', ',') + 'k€';
	}
	return Math.round(value) + '€';
}

const monthNames = [
	'Janvier',
	'Février',
	'Mars',
	'Avril',
	'Mai',
	'Juin',
	'Juillet',
	'Août',
	'Septembre',
	'Octobre',
	'Novembre',
	'Décembre'
];

/**
 * Format a date as "Month Year"
 * @param date - The date to format
 * @returns Formatted string like "January 2026"
 */
export function formatMonth(date: Date): string {
	return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Get the current month as a Date (first day of month)
 * @returns Date representing the first day of the current month
 */
export function getCurrentMonth(): Date {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Get the previous month from a given date
 * @param date - The reference date
 * @returns Date representing the first day of the previous month
 */
export function getPreviousMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

/**
 * Get the next month from a given date
 * @param date - The reference date
 * @returns Date representing the first day of the next month
 */
export function getNextMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

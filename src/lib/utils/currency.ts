/**
 * Format a number as currency (EUR)
 * @param amount - The amount to format
 * @param showSign - Whether to show + for positive values
 * @returns Formatted string like "1 234,56 €"
 */
export function formatCurrency(amount: number, showSign = false): string {
	const formatted = new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(Math.abs(amount));

	if (showSign && amount > 0) {
		return `+${formatted}`;
	}
	if (amount < 0) {
		return `-${formatted}`;
	}
	return formatted;
}

/**
 * Format a number as a compact currency (for small spaces)
 * @param amount - The amount to format
 * @returns Formatted string like "1,2k €" or "1 234 €"
 */
export function formatCurrencyCompact(amount: number): string {
	if (Math.abs(amount) >= 1000000) {
		return `${(amount / 1000000).toFixed(1).replace('.', ',')}M €`;
	}
	if (Math.abs(amount) >= 10000) {
		return `${(amount / 1000).toFixed(1).replace('.', ',')}k €`;
	}
	return formatCurrency(amount);
}

/**
 * Parse a string input to a number (handles French decimal separator)
 * @param value - The string value to parse
 * @returns Parsed number or 0 if invalid
 */
export function parseCurrency(value: string): number {
	const normalized = value.replace(/\s/g, '').replace(',', '.');
	const parsed = parseFloat(normalized);
	return isNaN(parsed) ? 0 : parsed;
}

const eur2 = new Intl.NumberFormat('fr-BE', {
	style: 'currency',
	currency: 'EUR',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});
const eur0 = new Intl.NumberFormat('fr-BE', {
	style: 'currency',
	currency: 'EUR',
	maximumFractionDigits: 0
});

/**
 * Compact money display: whole euros without decimals ("350 €"), otherwise two ("12,50 €").
 * Negative values keep their sign; callers wanting a typographic minus format the absolute value.
 */
export function eur(amount: number): string {
	return Math.abs(amount % 1) < 0.005 ? eur0.format(Math.round(amount)) : eur2.format(amount);
}

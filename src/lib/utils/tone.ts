export type Tone = '' | 'warn' | 'over';

/** Colour carries meaning only: warn under 25 % left, over when exceeded. */
export function tone(spent: number, budget: number): Tone {
	if (budget <= 0) return spent > 0 ? 'over' : '';
	const r = (budget - spent) / budget;
	return r < 0 ? 'over' : r < 0.25 ? 'warn' : '';
}

/** "−12,50 €" with a typographic minus, "12,50 €" otherwise */
export function signed(value: number, fmt: (n: number) => string): string {
	return value < 0 ? '−' + fmt(-value) : fmt(value);
}

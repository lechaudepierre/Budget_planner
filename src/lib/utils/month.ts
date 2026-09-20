const MONTHS = [
	'janvier',
	'février',
	'mars',
	'avril',
	'mai',
	'juin',
	'juillet',
	'août',
	'septembre',
	'octobre',
	'novembre',
	'décembre'
];

export const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** "2026-09" → "septembre" */
export function monthName(month: string): string {
	const m = Number(month.slice(5, 7));
	return MONTHS[m - 1] ?? month;
}

/** "2026-09" → "Septembre 2026" */
export function monthLabel(month: string): string {
	return `${cap(monthName(month))} ${month.slice(0, 4)}`;
}

/** Local ISO date (yyyy-mm-dd) for today, or `offset` days back */
export function isoDaysAgo(offset = 0): string {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() - offset);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Whole days between today and an ISO date (0 = today, 1 = yesterday) */
export function daysAgoOf(date: string): number {
	const today = new Date(isoDaysAgo(0) + 'T00:00:00');
	const d = new Date(date + 'T00:00:00');
	return Math.round((today.getTime() - d.getTime()) / 86_400_000);
}

/** "Aujourd'hui", "Hier", or "lun. 15 sept." */
export function dayLabel(date: string): string {
	const diff = daysAgoOf(date);
	if (diff === 0) return "Aujourd'hui";
	if (diff === 1) return 'Hier';
	const d = new Date(date + 'T00:00:00');
	return cap(d.toLocaleDateString('fr-BE', { weekday: 'short', day: 'numeric', month: 'short' }));
}

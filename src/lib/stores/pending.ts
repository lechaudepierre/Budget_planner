import { writable } from 'svelte/store';
import type { MonthData, MonthExpense } from '$lib/server/month';

export interface PendingExpense {
	key: string;
	categoryId: string;
	amount: number;
	date: string;
	note: string | null;
	/** Id of the saved row, once the insert is done (the fresh month may already contain it) */
	savedId?: string;
}

/**
 * Expenses typed but not confirmed by a reload yet. Screens render `withPending(data.month, …)`
 * so a new expense shows at once instead of after the save and the reload.
 */
export const pendingExpenses = writable<PendingExpense[]>([]);

export function withPending(m: MonthData, pending: PendingExpense[]): MonthData {
	const known = new Set(m.expenses.map((e) => e.id));
	const extra: MonthExpense[] = [];
	for (const p of pending) {
		if (p.savedId && known.has(p.savedId)) continue;
		const c = m.envelopes.find((e) => e.id === p.categoryId);
		if (!c) continue;
		extra.push({
			id: p.key,
			categoryId: c.id,
			categoryName: c.name,
			icon: c.icon,
			amount: p.amount,
			date: p.date,
			note: p.note,
			pending: true
		});
	}
	if (!extra.length) return m;

	const added = new Map<string, number>();
	for (const e of extra) added.set(e.categoryId, (added.get(e.categoryId) ?? 0) + e.amount);
	const sum = extra.reduce((s, e) => s + e.amount, 0);
	return {
		...m,
		envelopes: m.envelopes.map((c) =>
			added.has(c.id) ? { ...c, spent: c.spent + added.get(c.id)! } : c
		),
		// Newest first; the stable sort keeps the new ones on top of their day
		expenses: [...extra.reverse(), ...m.expenses].sort((a, b) =>
			a.date === b.date ? 0 : a.date < b.date ? 1 : -1
		),
		totals: { ...m.totals, spent: m.totals.spent + sum, remaining: m.totals.remaining - sum }
	};
}

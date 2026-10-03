import { describe, expect, it } from 'vitest';
import { withPending, type PendingExpense } from '../pending';
import type { MonthData } from '$lib/server/month';

const month = {
	envelopes: [{ id: 'a', name: 'Courses', icon: 'cart', budget: 300, spent: 50 }],
	expenses: [
		{
			id: 'e1',
			categoryId: 'a',
			categoryName: 'Courses',
			icon: 'cart',
			amount: 50,
			date: '2026-10-02',
			note: null
		}
	],
	totals: { budget: 300, spent: 50, remaining: 250, fixed: 0, exceptional: 0, savings: 0 }
} as unknown as MonthData;

const p = (over: Partial<PendingExpense> = {}): PendingExpense => ({
	key: 'pending:1',
	categoryId: 'a',
	amount: 12,
	date: '2026-10-03',
	note: null,
	...over
});

describe('withPending', () => {
	it('returns the month untouched when nothing is pending', () => {
		expect(withPending(month, [])).toBe(month);
	});

	it('counts a pending expense in the envelope, the totals and the list (newest first)', () => {
		const m = withPending(month, [p()]);
		expect(m.envelopes[0].spent).toBe(62);
		expect(m.totals.spent).toBe(62);
		expect(m.totals.remaining).toBe(238);
		expect(m.expenses.map((e) => e.id)).toEqual(['pending:1', 'e1']);
		expect(m.expenses[0].pending).toBe(true);
	});

	it('does not count twice once the reloaded month already holds the saved row', () => {
		const saved = { ...month, expenses: [{ ...month.expenses[0], id: 'e2' }, ...month.expenses] };
		expect(withPending(saved, [p({ savedId: 'e2' })])).toBe(saved);
	});

	it('ignores an envelope that no longer exists', () => {
		expect(withPending(month, [p({ categoryId: 'gone' })])).toBe(month);
	});
});

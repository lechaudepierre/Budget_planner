import { describe, expect, it } from 'vitest';
import { describePeriod, naturalEnd, nextMonthKey, plusDays } from '../month';

describe('period maths', () => {
	it('a period starting on the 1st ends on the last day of the month', () => {
		expect(naturalEnd('2026-10-01')).toBe('2026-10-31');
		expect(naturalEnd('2026-11-01')).toBe('2026-11-30');
		expect(naturalEnd('2026-12-01')).toBe('2026-12-31');
		expect(naturalEnd('2027-02-01')).toBe('2027-02-28');
		expect(naturalEnd('2028-02-01')).toBe('2028-02-29');
	});

	it('the next period starts the day after', () => {
		expect(plusDays(naturalEnd('2026-10-01'), 1)).toBe('2026-11-01');
		expect(plusDays(naturalEnd('2026-12-01'), 1)).toBe('2027-01-01');
		expect(nextMonthKey('2026-10')).toBe('2026-11');
		expect(nextMonthKey('2026-12')).toBe('2027-01');
	});

	it('describes October before, during and after the period', () => {
		const before = describePeriod('2026-10-01', null, '2026-09-20', '2026-10');
		expect(before.startsIn).toBe(11);
		expect(before.day).toBe(1);
		expect(before.daysTotal).toBe(31);

		const during = describePeriod('2026-10-01', null, '2026-10-20', '2026-10');
		expect(during.startsIn).toBe(0);
		expect(during.day).toBe(20);
		expect(during.daysLeft).toBe(11);
		expect(during.endDate).toBe('2026-10-31');

		const last = describePeriod('2026-10-01', null, '2026-10-31', '2026-10');
		expect(last.day).toBe(31);
		expect(last.daysLeft).toBe(0);
		expect(last.overdueDays).toBe(0);
	});

	it('keeps counting past the natural end until the salary closes the period', () => {
		const late = describePeriod('2026-10-01', null, '2026-11-03', '2026-10');
		expect(late.overdueDays).toBe(3);
		expect(late.day).toBe(34);
		expect(late.endDate).toBe('2026-11-03');
		expect(late.nextMonth).toBe('2026-11');
	});

	it('a period closed on salary day keeps the next month name', () => {
		// Closed on 26 October → "Novembre" runs from 26 Oct; its successor is still December
		const nov = describePeriod('2026-10-26', null, '2026-11-10', '2026-11');
		expect(nov.day).toBe(16);
		expect(nov.daysTotal).toBe(31);
		expect(nov.nextMonth).toBe('2026-12');
	});
});

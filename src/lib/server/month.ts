import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { IconName } from '$lib/components/ui/Icon.svelte';
import { iconFor } from '$lib/config/icons';

type Supabase = SupabaseClient<Database>;

export interface MonthEnvelope {
	id: string;
	name: string;
	icon: IconName;
	budget: number;
	spent: number;
}

export interface MonthFixed {
	id: string;
	name: string;
	icon: IconName;
	amount: number;
	/** True once the period holds an expense covering (almost) the whole amount */
	paid: boolean;
}

export interface MonthExpense {
	id: string;
	categoryId: string;
	categoryName: string;
	icon: IconName;
	amount: number;
	date: string;
	note: string | null;
}

export interface MonthData {
	budget: { id: string; month: string; income: number; startDate: string; endDate: string | null };
	period: {
		startDate: string;
		/** Last day counted for expenses (open periods run until today) */
		endDate: string;
		day: number;
		daysTotal: number;
		daysLeft: number;
		/** Days until the period starts (0 once it has started) */
		startsIn: number;
		/** Days past the natural end of an open period (0 when on time) — time to close it */
		overdueDays: number;
		/** Name of the period that "Clôturer" will open, e.g. "Novembre 2026" */
		nextMonth: string;
	};
	income: number;
	savings: { amount: number; accountId: string | null };
	envelopes: MonthEnvelope[];
	fixed: MonthFixed[];
	/** Variable expenses of the period, newest first */
	expenses: MonthExpense[];
	/** Account new manual expenses are attached to (checking first) */
	defaultAccountId: string | null;
	/** Account used to store the monthly savings amount */
	savingsAccountId: string | null;
	totals: { budget: number; spent: number; remaining: number; fixed: number; free: number };
}

const DAY = 86_400_000;

function localToday(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Everything the three screens need, in one round of parallel queries.
 * Creates the active period when the user has none, so the app always opens on a month.
 */
export async function loadMonth(supabase: Supabase, userId: string): Promise<MonthData> {
	const today = localToday();
	let { data: active } = await supabase
		.from('monthly_budgets')
		.select('id, month, income, start_date, end_date')
		.eq('user_id', userId)
		.eq('is_archived', false)
		.maybeSingle();

	if (!active) {
		const { data: created } = await supabase
			.from('monthly_budgets')
			.insert({
				user_id: userId,
				month: today.slice(0, 7),
				income: 0,
				start_date: today.slice(0, 8) + '01'
			})
			.select('id, month, income, start_date, end_date')
			.single();
		active = created;
	}
	if (!active) throw new Error('Impossible de créer la période active');

	const period = describePeriod(active.start_date, active.end_date, today, active.month);

	const [categoriesRes, allocationsRes, expensesRes, savingsRes, accountsRes] = await Promise.all([
		supabase
			.from('budget_categories')
			.select('id, name, type, sort_order')
			.eq('user_id', userId)
			.order('sort_order'),
		supabase.from('category_budgets').select('category_id, amount').eq('month', active.month),
		supabase
			.from('expenses')
			.select('id, category_id, amount, date, description, created_at')
			.eq('user_id', userId)
			.gte('date', period.startDate)
			.lte('date', period.endDate)
			.order('date', { ascending: false })
			.order('created_at', { ascending: false }),
		supabase
			.from('monthly_savings_allocations')
			.select('account_id, allocated_amount')
			.eq('user_id', userId)
			.eq('month', active.month),
		supabase
			.from('accounts')
			.select('id, account_type, created_at')
			.eq('user_id', userId)
			.order('created_at')
	]);

	const allocated = new Map(
		(allocationsRes.data ?? []).map((a) => [a.category_id, Number(a.amount)])
	);
	const spent = new Map<string, number>();
	for (const e of expensesRes.data ?? []) {
		if (!e.category_id) continue;
		spent.set(e.category_id, (spent.get(e.category_id) ?? 0) + Number(e.amount));
	}

	const categories = categoriesRes.data ?? [];
	const byId = new Map(categories.map((c) => [c.id, c]));

	const envelopes: MonthEnvelope[] = categories
		.filter((c) => c.type === 'variable')
		.map((c) => ({
			id: c.id,
			name: c.name,
			icon: iconFor(c.name),
			budget: allocated.get(c.id) ?? 0,
			spent: spent.get(c.id) ?? 0
		}));

	const fixed: MonthFixed[] = categories
		.filter((c) => c.type === 'fixed')
		.map((c) => {
			const amount = allocated.get(c.id) ?? 0;
			const paidAmount = spent.get(c.id) ?? 0;
			return {
				id: c.id,
				name: c.name,
				icon: iconFor(c.name),
				amount,
				paid: amount > 0 ? paidAmount >= amount * 0.95 : paidAmount > 0
			};
		});

	const expenses: MonthExpense[] = (expensesRes.data ?? [])
		.filter((e) => e.category_id && byId.get(e.category_id)?.type === 'variable')
		.map((e) => {
			const c = byId.get(e.category_id as string)!;
			return {
				id: e.id,
				categoryId: c.id,
				categoryName: c.name,
				icon: iconFor(c.name),
				amount: Number(e.amount),
				date: e.date,
				note: e.description
			};
		});

	const accounts = accountsRes.data ?? [];
	const defaultAccountId =
		accounts.find((a) => a.account_type === 'checking')?.id ?? accounts[0]?.id ?? null;
	const savingsAllocations = savingsRes.data ?? [];
	const savingsAccountId =
		savingsAllocations.find((a) => a.account_id)?.account_id ??
		accounts.find((a) => a.account_type === 'savings')?.id ??
		null;
	const savings = {
		amount: savingsAllocations.reduce((s, a) => s + Number(a.allocated_amount), 0),
		accountId: savingsAccountId
	};

	const budgetTotal = envelopes.reduce((s, c) => s + c.budget, 0);
	const spentTotal = envelopes.reduce((s, c) => s + c.spent, 0);
	const fixedTotal = fixed.reduce((s, f) => s + f.amount, 0);
	const income = Number(active.income);

	return {
		budget: {
			id: active.id,
			month: active.month,
			income,
			startDate: active.start_date,
			endDate: active.end_date
		},
		period,
		income,
		savings,
		envelopes,
		fixed,
		expenses,
		defaultAccountId,
		savingsAccountId,
		totals: {
			budget: budgetTotal,
			spent: spentTotal,
			remaining: budgetTotal - spentTotal,
			fixed: fixedTotal,
			free: income - fixedTotal - savings.amount - budgetTotal
		}
	};
}

/** Natural end of an open period: start + 1 month − 1 day, clamped to the month's length (ISO date) */
export function naturalEnd(startDate: string): string {
	const [y, m, d] = startDate.split('-').map(Number);
	const lastDayNext = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); // month index m = next month
	const end = new Date(Date.UTC(y, m, Math.min(d, lastDayNext)));
	end.setUTCDate(end.getUTCDate() - 1);
	return end.toISOString().slice(0, 10);
}

export function plusDays(date: string, days: number): string {
	const d = new Date(date + 'T00:00:00Z');
	d.setUTCDate(d.getUTCDate() + days);
	return d.toISOString().slice(0, 10);
}

export function nextMonthKey(month: string): string {
	const [y, m] = month.split('-').map(Number);
	return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
}

export function describePeriod(
	startDate: string,
	endDate: string | null,
	today: string,
	month: string
): MonthData['period'] {
	const start = new Date(startDate + 'T00:00:00Z');
	const end = new Date((endDate ?? naturalEnd(startDate)) + 'T00:00:00Z');
	const todayDate = new Date(today + 'T00:00:00Z');
	const daysTotal = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY) + 1);
	const dayRaw = Math.round((todayDate.getTime() - start.getTime()) / DAY) + 1;
	const day = Math.min(Math.max(dayRaw, 1), daysTotal);
	const daysLeft = Math.max(0, daysTotal - day);
	const startsIn = Math.max(0, 1 - dayRaw);
	// An open period that ran past its expected end keeps counting expenses until today
	const overdueDays =
		!endDate && todayDate > end ? Math.round((todayDate.getTime() - end.getTime()) / DAY) : 0;
	const queryEnd = overdueDays > 0 ? todayDate : end;
	return {
		startDate,
		endDate: queryEnd.toISOString().slice(0, 10),
		day: overdueDays > 0 ? daysTotal + overdueDays : day,
		daysTotal,
		daysLeft,
		startsIn,
		overdueDays,
		nextMonth: nextMonthKey(month)
	};
}

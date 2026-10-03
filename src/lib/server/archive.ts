import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { IconName } from '$lib/components/ui/Icon.svelte';
import { categoryIcon } from '$lib/config/icons';
import { loadCategories, type CategoryRow } from './month';

type Supabase = SupabaseClient<Database>;

/** One category of a closed month: what was planned, what really left the account */
export interface ArchiveLine {
	id: string;
	name: string;
	icon: IconName;
	planned: number;
	actual: number;
}

/** Summary of a closed period, rebuilt from its data (so later edits stay in sync) */
export interface MonthArchive {
	id: string;
	month: string;
	startDate: string;
	endDate: string;
	income: number;
	fixed: ArchiveLine[];
	exceptional: ArchiveLine[];
	envelopes: ArchiveLine[];
	totals: {
		/** Fixed costs actually ticked (unticked ones did not happen) */
		fixed: number;
		exceptional: number;
		budget: number;
		spent: number;
		/** What the month planned: income − fixed − exceptional − envelope budgets */
		plannedSavings: number;
		/** What really stayed: income − everything actually paid */
		realSavings: number;
	};
}

type BudgetRow = {
	id: string;
	month: string;
	income: number;
	start_date: string;
	end_date: string | null;
};

/** Closed periods, newest first. With `id`, only that one (empty when it is not a closed period of the user). */
export async function loadArchives(
	supabase: Supabase,
	userId: string,
	id?: string
): Promise<MonthArchive[]> {
	let query = supabase
		.from('monthly_budgets')
		.select('id, month, income, start_date, end_date')
		.eq('user_id', userId)
		.eq('is_archived', true)
		.order('start_date', { ascending: false });
	if (id) query = query.eq('id', id);
	const { data: budgets } = await query;
	const closed = (budgets ?? []).filter((b): b is BudgetRow & { end_date: string } => !!b.end_date);
	if (!closed.length) return [];

	const from = closed.reduce((d, b) => (b.start_date < d ? b.start_date : d), closed[0].start_date);
	const to = closed.reduce((d, b) => (b.end_date > d ? b.end_date : d), closed[0].end_date);
	const [categoriesRes, allocationsRes, expensesRes] = await Promise.all([
		loadCategories(supabase, userId),
		supabase
			.from('category_budgets')
			.select('category_id, month, amount')
			.in(
				'month',
				closed.map((b) => b.month)
			),
		supabase
			.from('expenses')
			.select('category_id, amount, date')
			.eq('user_id', userId)
			.gte('date', from)
			.lte('date', to)
	]);
	const categories = categoriesRes.data;
	const allocations = allocationsRes.data ?? [];
	const expenses = expensesRes.data ?? [];

	return closed.map((b) => {
		const planned = new Map(
			allocations.filter((a) => a.month === b.month).map((a) => [a.category_id, Number(a.amount)])
		);
		const actual = new Map<string, number>();
		for (const e of expenses) {
			if (!e.category_id || e.date < b.start_date || e.date > b.end_date) continue;
			actual.set(e.category_id, (actual.get(e.category_id) ?? 0) + Number(e.amount));
		}
		const lines = (type: CategoryRow['type']): ArchiveLine[] =>
			categories
				.filter((c) => c.type === type && ((planned.get(c.id) ?? 0) > 0 || actual.has(c.id)))
				.map((c) => ({
					id: c.id,
					name: c.name,
					icon: categoryIcon(c.icon, c.name),
					planned: planned.get(c.id) ?? 0,
					actual: actual.get(c.id) ?? 0
				}));
		const fixed = lines('fixed');
		const exceptional = lines('exceptional');
		const envelopes = lines('variable');
		const sum = (l: ArchiveLine[], k: 'planned' | 'actual') => l.reduce((s, x) => s + x[k], 0);
		const income = Number(b.income);
		const totals = {
			fixed: sum(fixed, 'actual'),
			exceptional: sum(exceptional, 'actual'),
			budget: sum(envelopes, 'planned'),
			spent: sum(envelopes, 'actual'),
			plannedSavings:
				income - sum(fixed, 'planned') - sum(exceptional, 'planned') - sum(envelopes, 'planned'),
			realSavings: 0
		};
		totals.realSavings = income - totals.fixed - totals.exceptional - totals.spent;
		return {
			id: b.id,
			month: b.month,
			startDate: b.start_date,
			endDate: b.end_date,
			income,
			fixed,
			exceptional,
			envelopes,
			totals
		};
	});
}

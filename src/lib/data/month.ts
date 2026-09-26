import { supabase } from '$lib/supabase';
import { createExpense, updateExpense, deleteExpense } from '$lib/data/expenses';
import {
	archiveBudgetAndStartNew,
	createCategory,
	deleteCategory,
	saveAllCategoryBudgets,
	saveCategoryBudget,
	updateCategory
} from '$lib/data/budgets';
import { upsertAccountAllocation } from '$lib/data/savings-allocations';
import { createAccount } from '$lib/data/accounts';
import type { MonthData } from '$lib/server/month';

/**
 * Client-side mutations behind the three screens. Each one returns an error message
 * (or null) and, where it makes sense, an `undo` that reverts the change.
 */
export type Result = { error: string | null; undo?: () => Promise<void> };

const fail = (e: { message: string } | string | null | undefined): Result => ({
	error: typeof e === 'string' ? e : (e?.message ?? 'Une erreur est survenue')
});
const ok = (undo?: () => Promise<void>): Result => ({ error: null, undo });

const round2 = (n: number) => Math.round(n * 100) / 100;

// ---------- Expenses ----------

export async function addExpense(
	month: MonthData,
	input: { categoryId: string; amount: number; date: string; note: string | null }
): Promise<Result> {
	const { data, error } = await createExpense({
		category_id: input.categoryId,
		account_id: month.defaultAccountId,
		amount: round2(input.amount),
		description: input.note,
		date: input.date
	});
	if (error || !data) return fail(error);
	const id = data.id;
	return ok(async () => {
		await deleteExpense(id);
	});
}

/**
 * "Corriger le total": bring an envelope's spent amount to `newTotal`.
 * Upwards → one adjustment expense. Downwards → trim the most recent expenses
 * (amounts must stay positive in the database).
 */
export async function setEnvelopeTotal(
	month: MonthData,
	envelopeId: string,
	newTotal: number
): Promise<Result> {
	const envelope = month.envelopes.find((c) => c.id === envelopeId);
	if (!envelope) return fail('Enveloppe introuvable');
	const diff = round2(newTotal - envelope.spent);
	if (Math.abs(diff) < 0.005) return ok();

	if (diff > 0) {
		return addExpense(month, {
			categoryId: envelopeId,
			amount: diff,
			date: today(),
			note: 'Correction du total'
		});
	}

	let remaining = -diff;
	const touched: {
		id: string;
		amount: number;
		deleted: boolean;
		snapshot: MonthExpenseSnapshot;
	}[] = [];
	for (const e of month.expenses.filter((x) => x.categoryId === envelopeId)) {
		if (remaining <= 0.004) break;
		const snapshot = { categoryId: e.categoryId, amount: e.amount, date: e.date, note: e.note };
		if (e.amount > remaining + 0.004) {
			const { error } = await updateExpense(e.id, { amount: round2(e.amount - remaining) });
			if (error) return fail(error);
			touched.push({ id: e.id, amount: e.amount, deleted: false, snapshot });
			remaining = 0;
		} else {
			const { error } = await deleteExpense(e.id);
			if (error) return fail(error);
			touched.push({ id: e.id, amount: e.amount, deleted: true, snapshot });
			remaining = round2(remaining - e.amount);
		}
	}
	return ok(async () => {
		for (const t of touched) {
			if (t.deleted) {
				await createExpense({
					category_id: t.snapshot.categoryId,
					account_id: month.defaultAccountId,
					amount: t.snapshot.amount,
					description: t.snapshot.note,
					date: t.snapshot.date
				});
			} else {
				await updateExpense(t.id, { amount: t.amount });
			}
		}
	});
}

type MonthExpenseSnapshot = {
	categoryId: string;
	amount: number;
	date: string;
	note: string | null;
};

export async function editExpense(
	month: MonthData,
	expenseId: string,
	input: { amount: number; date: string; note: string | null }
): Promise<Result> {
	const before = month.expenses.find((e) => e.id === expenseId);
	if (!before) return fail('Dépense introuvable');
	const { error } = await updateExpense(expenseId, {
		amount: round2(input.amount),
		date: input.date,
		description: input.note
	});
	if (error) return fail(error);
	return ok(async () => {
		await updateExpense(expenseId, {
			amount: before.amount,
			date: before.date,
			description: before.note
		});
	});
}

export async function removeExpense(month: MonthData, expenseId: string): Promise<Result> {
	const before = month.expenses.find((e) => e.id === expenseId);
	if (!before) return fail('Dépense introuvable');
	const { error } = await deleteExpense(expenseId);
	if (error) return fail(error);
	return ok(async () => {
		await createExpense({
			category_id: before.categoryId,
			account_id: month.defaultAccountId,
			amount: before.amount,
			description: before.note,
			date: before.date
		});
	});
}

// ---------- Monthly amounts ----------

export async function setIncome(month: MonthData, income: number): Promise<Result> {
	const { error } = await supabase
		.from('monthly_budgets')
		.update({ income: round2(income) })
		.eq('id', month.budget.id);
	return error ? fail(error) : ok();
}

/** Savings live in `monthly_savings_allocations`, which needs an account: create one if needed. */
export async function setSavings(month: MonthData, amount: number): Promise<Result> {
	let accountId = month.savingsAccountId;
	if (!accountId) {
		const { data, error } = await createAccount({
			name: 'Épargne',
			balance: 0,
			account_type: 'savings'
		});
		if (error || !data) return fail(error);
		accountId = data.id;
	}
	const { error } = await upsertAccountAllocation(month.budget.month, accountId, round2(amount));
	return error ? fail(error) : ok();
}

export async function setCategoryBudget(
	month: MonthData,
	categoryId: string,
	amount: number
): Promise<Result> {
	const { error } = await saveCategoryBudget(categoryId, month.budget.month, round2(amount));
	return error ? fail(error) : ok();
}

/** Tick a fixed cost: record its expense for the period (or remove it when unticked). */
export async function setFixedPaid(
	month: MonthData,
	categoryId: string,
	paid: boolean
): Promise<Result> {
	const fixed = month.fixed.find((f) => f.id === categoryId);
	if (!fixed) return fail('Coût fixe introuvable');
	if (paid) {
		if (fixed.amount <= 0) return fail('Indique d’abord le montant de ce coût fixe');
		const { error } = await createExpense({
			category_id: categoryId,
			account_id: month.defaultAccountId,
			amount: fixed.amount,
			description: 'Prélèvement',
			date: today()
		});
		return error ? fail(error) : ok();
	}
	const { data: rows, error } = await supabase
		.from('expenses')
		.select('id')
		.eq('category_id', categoryId)
		.gte('date', month.period.startDate)
		.lte('date', month.period.endDate);
	if (error) return fail(error);
	for (const r of rows ?? []) {
		const { error: e } = await deleteExpense(r.id);
		if (e) return fail(e);
	}
	return ok();
}

// ---------- Categories ----------

export async function addCategory(
	month: MonthData,
	type: 'fixed' | 'variable',
	name: string,
	amount: number,
	icon: string | null = null
): Promise<Result> {
	const { data, error } = await createCategory(name.trim(), '#8B857C', type, icon);
	if (error || !data) return fail(error);
	if (amount > 0) {
		const { error: e } = await saveCategoryBudget(data.id, month.budget.month, round2(amount));
		if (e) return fail(e);
	}
	return ok();
}

export async function updateCategoryLook(
	categoryId: string,
	changes: { name?: string; icon?: string | null }
): Promise<Result> {
	const { error } = await updateCategory(categoryId, {
		...(changes.name !== undefined ? { name: changes.name.trim() } : {}),
		...(changes.icon !== undefined ? { icon: changes.icon } : {})
	});
	return error ? fail(error) : ok();
}

export async function removeCategory(categoryId: string): Promise<Result> {
	const { error } = await deleteCategory(categoryId);
	return error ? fail(error) : ok();
}

// ---------- Period ----------

/**
 * Close the period: archive it and open the next one today. Fixed costs carry over (to be ticked again);
 * salary, envelopes and savings start from zero. Closing an already-closed period fails instead of skipping a month.
 */
export async function closeMonth(month: MonthData): Promise<Result> {
	const { data, error } = await archiveBudgetAndStartNew(today(), month.budget.id);
	if (error || !data) return fail(error);
	const fixed = month.fixed
		.filter((f) => f.amount > 0)
		.map((f) => ({ categoryId: f.id, amount: f.amount }));
	if (fixed.length) {
		const { error: e } = await saveAllCategoryBudgets(fixed, data.month);
		if (e) return fail(e);
	}
	return ok();
}

function today(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

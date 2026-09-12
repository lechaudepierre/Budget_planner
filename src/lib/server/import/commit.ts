import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	BankTransactionInsert,
	CategoryRuleInsert,
	Database,
	ExpenseInsert,
	IncomeEntryInsert
} from '$lib/types/database';
import type { CommitRequest, CommitResponse, ReviewRow } from '$lib/import/review';

type Supabase = SupabaseClient<Database>;

/**
 * Persist a reviewed statement: ledger rows, budget rows (expenses / incomes),
 * learned rules and account balances.
 */
export async function commitStatement(
	supabase: Supabase,
	userId: string,
	req: CommitRequest
): Promise<CommitResponse> {
	const errors: string[] = [];
	const inserted = { expenses: 0, incomes: 0, transfers: 0, ignored: 0 };
	let confirmed = 0;

	const fresh = req.rows.filter((r) => !r.isDuplicate);

	const { data: importRow, error: importError } = await supabase
		.from('imports')
		.insert({
			user_id: userId,
			account_id: req.accountId,
			source: req.source,
			filename: req.filename,
			row_count: req.rows.length,
			new_count: fresh.length,
			duplicate_count: req.rows.length - fresh.length,
			balance_after: req.balanceAfter
		})
		.select('id')
		.single();
	if (importError || !importRow) {
		throw new Error(importError?.message ?? "Impossible de créer l'import");
	}

	const monthFor = await monthResolver(supabase, userId);
	const learned = new Map<string, CategoryRuleInsert>();

	// Build every row up front with client-generated ids so the three inserts can be batched
	const expenseRows: ExpenseInsert[] = [];
	const incomeRows: IncomeEntryInsert[] = [];
	const ledgerRows: BankTransactionInsert[] = [];

	for (const row of fresh) {
		let expenseId: string | null = null;
		let incomeEntryId: string | null = null;

		if (row.kind === 'expense') {
			const bankAmount = round2(Math.abs(row.amount));
			const divisor = row.shareDivisor && row.shareDivisor > 1 ? row.shareDivisor : 1;
			expenseId = crypto.randomUUID();
			expenseRows.push({
				id: expenseId,
				user_id: userId,
				category_id: row.categoryId,
				account_id: req.accountId,
				amount: round2(bankAmount / divisor),
				bank_amount: bankAmount,
				source: row.source,
				merchant: row.merchant,
				description: displayLabel(row),
				date: row.date,
				is_pending: row.status === 'pending'
			});
			inserted.expenses++;
		} else if (row.kind === 'income') {
			incomeEntryId = crypto.randomUUID();
			incomeRows.push({
				id: incomeEntryId,
				user_id: userId,
				month: monthFor(row.date),
				type: 'autre',
				label: displayLabel(row),
				amount: round2(Math.abs(row.amount))
			});
			inserted.incomes++;
		} else if (row.kind === 'transfer') {
			inserted.transfers++;
		} else {
			inserted.ignored++;
		}

		ledgerRows.push({
			user_id: userId,
			import_id: importRow.id,
			account_id: req.accountId,
			source: row.source,
			external_id: row.externalId,
			date: row.date,
			amount: row.amount,
			description: row.rawDescription,
			merchant: row.merchant,
			counterparty_iban: row.counterpartyIban ?? null,
			counterparty_name: row.counterpartyName ?? null,
			kind: row.kind,
			status: row.status,
			expense_id: expenseId,
			income_entry_id: incomeEntryId
		});

		const rule = ruleFor(userId, row);
		if (rule) learned.set(`${rule.match_type}|${rule.pattern}`, rule);
	}

	try {
		await insertChunked(supabase, 'expenses', expenseRows);
		await insertChunked(supabase, 'income_entries', incomeRows);
		await insertChunked(supabase, 'bank_transactions', ledgerRows);
	} catch (e) {
		// No transactions over PostgREST: undo what this import created so a retry starts clean
		await supabase.from('bank_transactions').delete().eq('import_id', importRow.id);
		if (expenseRows.length) {
			await supabase
				.from('expenses')
				.delete()
				.in(
					'id',
					expenseRows.map((r) => r.id!)
				);
		}
		if (incomeRows.length) {
			await supabase
				.from('income_entries')
				.delete()
				.in(
					'id',
					incomeRows.map((r) => r.id!)
				);
		}
		await supabase.from('imports').delete().eq('id', importRow.id);
		throw new Error(`Import annulé : ${e instanceof Error ? e.message : String(e)}`);
	}

	// Lines previously imported as pending and now confirmed by the bank
	for (const row of req.rows.filter((r) => r.isDuplicate && r.confirmsPending)) {
		const { data } = await supabase
			.from('bank_transactions')
			.update({ status: 'confirmed' })
			.eq('user_id', userId)
			.eq('source', row.source)
			.eq('external_id', row.externalId)
			.select('expense_id')
			.single();
		if (data?.expense_id) {
			await supabase.from('expenses').update({ is_pending: false }).eq('id', data.expense_id);
		}
		confirmed++;
	}

	// Learn rules from the user's decisions
	let rulesLearned = 0;
	if (learned.size > 0) {
		const { error } = await supabase
			.from('category_rules')
			.upsert([...learned.values()], { onConflict: 'user_id,match_type,pattern' });
		if (error) errors.push(`Règles : ${error.message}`);
		else rulesLearned = learned.size;
	}

	await updateBalances(supabase, userId, req, fresh);

	return { importId: importRow.id, inserted, confirmed, rulesLearned, errors };
}

function ruleFor(userId: string, row: ReviewRow): CategoryRuleInsert | null {
	if (!row.learnRule) return null;
	if (row.kind === 'expense' && !row.categoryId) return null;

	// Transfers / reimbursements / incomes from a known IBAN are best keyed on the IBAN
	const useIban = row.counterpartyIban && row.kind !== 'expense';
	return {
		user_id: userId,
		match_type: useIban ? 'iban' : 'merchant',
		pattern: useIban ? row.counterpartyIban! : row.merchant,
		kind: row.kind,
		category_id: row.kind === 'expense' ? row.categoryId : null,
		share_divisor: row.kind === 'expense' ? row.shareDivisor : null,
		last_used_at: new Date().toISOString()
	};
}

async function updateBalances(
	supabase: Supabase,
	userId: string,
	req: CommitRequest,
	fresh: ReviewRow[]
) {
	const now = new Date().toISOString();

	if (req.accountIban) {
		await supabase
			.from('accounts')
			.update({ iban: req.accountIban })
			.eq('id', req.accountId)
			.eq('user_id', userId)
			.is('iban', null);
	}

	if (req.balanceAfter !== null) {
		await supabase
			.from('accounts')
			.update({ balance: req.balanceAfter, balance_source: 'import', last_import_at: now })
			.eq('id', req.accountId)
			.eq('user_id', userId);
	} else {
		// No running balance in the file: apply the net movement of confirmed lines
		const delta = fresh
			.filter((r) => r.status === 'confirmed')
			.reduce((sum, r) => sum + r.amount, 0);
		const { data: account } = await supabase
			.from('accounts')
			.select('balance')
			.eq('id', req.accountId)
			.eq('user_id', userId)
			.single();
		if (account) {
			await supabase
				.from('accounts')
				.update({ balance: round2(Number(account.balance) + delta), last_import_at: now })
				.eq('id', req.accountId)
				.eq('user_id', userId);
		}
	}

	if (req.pocketAccountId && req.pocketBalance !== null) {
		await supabase
			.from('accounts')
			.update({ balance: req.pocketBalance, balance_source: 'import', last_import_at: now })
			.eq('id', req.pocketAccountId)
			.eq('user_id', userId);
	}
}

/** Map a transaction date to the budget "month" key (active period first, then calendar month). */
async function monthResolver(
	supabase: Supabase,
	userId: string
): Promise<(date: string) => string> {
	const { data: active } = await supabase
		.from('monthly_budgets')
		.select('month, start_date, end_date')
		.eq('user_id', userId)
		.eq('is_archived', false)
		.maybeSingle();
	return (date: string) => {
		if (active && date >= active.start_date && (!active.end_date || date <= active.end_date)) {
			return active.month;
		}
		return date.slice(0, 7);
	};
}

const CHUNK = 200;

async function insertChunked<T extends 'expenses' | 'income_entries' | 'bank_transactions'>(
	supabase: Supabase,
	table: T,
	rows: Database['public']['Tables'][T]['Insert'][]
): Promise<void> {
	for (let i = 0; i < rows.length; i += CHUNK) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error } = await supabase.from(table).insert(rows.slice(i, i + CHUNK) as any);
		if (error) throw new Error(`${table}: ${error.message}`);
	}
}

function displayLabel(row: ReviewRow): string {
	if (row.communication) return row.communication;
	return titleCase(row.merchant);
}

function titleCase(s: string): string {
	return s
		.toLowerCase()
		.split(' ')
		.map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
		.join(' ');
}

function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

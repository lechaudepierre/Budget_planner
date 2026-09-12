import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, TransactionKind } from '$lib/types/database';
import { parseStatement, normalizeIban, type ParsedTransaction } from '$lib/import';
import { needsReview, type AnalyzeResponse, type ReviewRow } from '$lib/import/review';
import { loadRules, matchRule, touchRules } from './rules';
import { detectTransfer, loadCounterpartLines } from './transfers';
import {
	categorizeWithAi,
	describeAiError,
	isAiConfigured,
	type CategoryContext
} from '$lib/server/ai/categorize';

type Supabase = SupabaseClient<Database>;

/**
 * Turn an uploaded statement into review rows: parse, dedup, detect transfers,
 * apply learned rules, then ask Claude about whatever is left.
 */
export async function analyzeStatement(
	supabase: Supabase,
	userId: string,
	input: { bytes: ArrayBuffer; filename: string; accountId: string }
): Promise<AnalyzeResponse> {
	const parsed = parseStatement(input.bytes);
	const txs = parsed.transactions;

	const [{ data: accounts }, rules, existing, counterparts] = await Promise.all([
		supabase.from('accounts').select('id, iban').eq('user_id', userId),
		loadRules(supabase, userId),
		loadExisting(
			supabase,
			userId,
			parsed.source,
			txs.map((t) => t.externalId)
		),
		loadCounterpartLines(
			supabase,
			userId,
			input.accountId,
			txs.map((t) => t.date)
		)
	]);

	const myIbans = new Set(
		(accounts ?? []).map((a) => normalizeIban(a.iban)).filter((x): x is string => Boolean(x))
	);
	const suggestedAccount =
		parsed.accountIban && parsed.accountIban !== ibanOf(accounts, input.accountId)
			? (accounts ?? []).find((a) => normalizeIban(a.iban) === parsed.accountIban)
			: undefined;

	const matchedRules = [] as Awaited<ReturnType<typeof loadRules>>;
	const rows: ReviewRow[] = txs.map((tx) => {
		const prior = existing.get(tx.externalId);
		const base: ReviewRow = {
			...tx,
			isDuplicate: Boolean(prior),
			confirmsPending: Boolean(prior && prior.status === 'pending' && tx.status === 'confirmed'),
			kind: tx.amount < 0 ? 'expense' : 'income',
			categoryId: null,
			shareDivisor: null,
			confidence: 'none',
			reason: null,
			learnRule: true
		};
		if (prior)
			return {
				...base,
				kind: prior.kind,
				confidence: 'system',
				reason: 'Déjà importée',
				learnRule: false
			};

		const transfer = detectTransfer(tx, myIbans, counterparts);
		if (transfer) {
			return {
				...base,
				kind: 'transfer',
				confidence: 'system',
				reason: transfer.reason,
				learnRule: false
			};
		}

		const match = matchRule(tx, rules);
		if (match) {
			matchedRules.push(match.rule);
			return {
				...base,
				kind: match.rule.kind,
				categoryId: match.rule.category_id,
				shareDivisor: match.rule.share_divisor,
				confidence: 'rule',
				reason: match.reason,
				learnRule: false
			};
		}

		return base;
	});

	// Ask Claude about expenses that no rule covered
	const ai: AnalyzeResponse['ai'] = { used: false, error: null };
	const unknownIdx = rows
		.map((r, i) => (r.kind === 'expense' && r.confidence === 'none' && !r.isDuplicate ? i : -1))
		.filter((i) => i >= 0);

	if (unknownIdx.length > 0) {
		if (!isAiConfigured()) {
			ai.error = 'Clé API Anthropic non configurée — catégorisation manuelle';
		} else {
			try {
				const categories = await loadCategoryContext(supabase, userId);
				const suggestions = await categorizeWithAi(
					categories,
					unknownIdx.map((i) => ({
						index: i,
						merchant: rows[i].merchant,
						rawDescription: rows[i].rawDescription,
						amount: rows[i].amount,
						date: rows[i].date,
						communication: rows[i].communication
					}))
				);
				for (const s of suggestions) {
					const row = rows[s.index];
					if (!row || !s.categoryId) continue;
					row.categoryId = s.categoryId;
					row.confidence = s.confidence === 'high' ? 'ai-high' : 'ai-low';
					row.reason = 'Suggestion IA';
				}
				ai.used = true;
			} catch (e) {
				console.error('AI categorisation failed', e);
				ai.error = describeAiError(e);
			}
		}
	}

	void touchRules(supabase, matchedRules);

	const fresh = rows.filter((r) => !r.isDuplicate);
	return {
		source: parsed.source,
		filename: input.filename,
		accountId: input.accountId,
		accountIban: parsed.accountIban ?? null,
		suggestedAccountId: suggestedAccount?.id ?? null,
		balanceAfter: parsed.balanceAfter ?? null,
		pocketBalance: parsed.pocketBalance ?? null,
		rows,
		summary: {
			total: rows.length,
			new: fresh.length,
			duplicates: rows.length - fresh.length,
			toReview: fresh.filter((r) => needsReview(r)).length,
			transfers: fresh.filter((r) => r.kind === 'transfer').length
		},
		ai
	};
}

async function loadExisting(
	supabase: Supabase,
	userId: string,
	source: ParsedTransaction['source'],
	externalIds: string[]
): Promise<Map<string, { status: string; kind: TransactionKind }>> {
	const map = new Map<string, { status: string; kind: TransactionKind }>();
	for (let i = 0; i < externalIds.length; i += 200) {
		const chunk = externalIds.slice(i, i + 200);
		const { data } = await supabase
			.from('bank_transactions')
			.select('external_id, status, kind')
			.eq('user_id', userId)
			.eq('source', source)
			.in('external_id', chunk);
		for (const d of data ?? []) map.set(d.external_id, { status: d.status, kind: d.kind });
	}
	return map;
}

async function loadCategoryContext(supabase: Supabase, userId: string): Promise<CategoryContext[]> {
	const [{ data: categories }, { data: expenses }] = await Promise.all([
		supabase
			.from('budget_categories')
			.select('id, name, type')
			.eq('user_id', userId)
			.order('sort_order'),
		supabase
			.from('expenses')
			.select('category_id, merchant, description')
			.eq('user_id', userId)
			.order('date', { ascending: false })
			.limit(400)
	]);

	const examples = new Map<string, Map<string, number>>();
	for (const e of expenses ?? []) {
		if (!e.category_id) continue;
		const label = (e.merchant ?? e.description ?? '').trim();
		if (!label) continue;
		const bucket = examples.get(e.category_id) ?? new Map<string, number>();
		bucket.set(label, (bucket.get(label) ?? 0) + 1);
		examples.set(e.category_id, bucket);
	}

	return (categories ?? []).map((c) => ({
		id: c.id,
		name: c.name,
		type: c.type,
		examples: [...(examples.get(c.id)?.entries() ?? [])]
			.sort((a, b) => b[1] - a[1])
			.slice(0, 4)
			.map(([label]) => label)
	}));
}

function ibanOf(
	accounts: { id: string; iban: string | null }[] | null,
	id: string
): string | undefined {
	return normalizeIban(accounts?.find((a) => a.id === id)?.iban);
}

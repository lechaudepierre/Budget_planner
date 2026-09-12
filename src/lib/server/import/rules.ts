import type { SupabaseClient } from '@supabase/supabase-js';
import type { CategoryRule, Database } from '$lib/types/database';
import type { ParsedTransaction } from '$lib/import/types';

export type RuleMatch = { rule: CategoryRule; reason: string };

export async function loadRules(
	supabase: SupabaseClient<Database>,
	userId: string
): Promise<CategoryRule[]> {
	const { data } = await supabase.from('category_rules').select('*').eq('user_id', userId);
	return data ?? [];
}

/**
 * Find the best rule for a line. Priority: counterparty IBAN, exact merchant, substring.
 */
export function matchRule(tx: ParsedTransaction, rules: CategoryRule[]): RuleMatch | null {
	if (tx.counterpartyIban) {
		const r = rules.find((r) => r.match_type === 'iban' && r.pattern === tx.counterpartyIban);
		if (r) return { rule: r, reason: `Règle · ${tx.counterpartyName ?? tx.counterpartyIban}` };
	}

	const merchant = tx.merchant;
	const exact = rules.find((r) => r.match_type === 'merchant' && r.pattern === merchant);
	if (exact) return { rule: exact, reason: `Règle · ${merchant}` };

	const haystack = `${merchant} ${tx.rawDescription.toUpperCase()}`;
	const contains = rules
		.filter((r) => r.match_type === 'contains' && haystack.includes(r.pattern.toUpperCase()))
		.sort((a, b) => b.pattern.length - a.pattern.length)[0];
	if (contains) return { rule: contains, reason: `Règle · contient « ${contains.pattern} »` };

	return null;
}

/** Bump usage counters for matched rules (best effort). */
export async function touchRules(
	supabase: SupabaseClient<Database>,
	matched: CategoryRule[]
): Promise<void> {
	const now = new Date().toISOString();
	const byId = new Map<string, number>();
	for (const r of matched) byId.set(r.id, (byId.get(r.id) ?? 0) + 1);
	await Promise.all(
		[...byId.entries()].map(([id, n]) => {
			const rule = matched.find((r) => r.id === id)!;
			return supabase
				.from('category_rules')
				.update({ hits: rule.hits + n, last_used_at: now })
				.eq('id', id);
		})
	);
}

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { ParsedTransaction } from '$lib/import/types';

export type TransferMatch = { reason: string } | null;

const WINDOW_DAYS = 3;

/**
 * Existing statement lines on the user's other accounts, used to pair the two
 * sides of a transfer (e.g. BNP "REVOLUT" -800 € ↔ Revolut "Ajout de fonds" +800 €).
 */
export async function loadCounterpartLines(
	supabase: SupabaseClient<Database>,
	userId: string,
	accountId: string,
	dates: string[]
): Promise<{ date: string; amount: number }[]> {
	if (dates.length === 0) return [];
	const sorted = [...dates].sort();
	const from = shiftDate(sorted[0], -WINDOW_DAYS);
	const to = shiftDate(sorted[sorted.length - 1], WINDOW_DAYS);
	const { data } = await supabase
		.from('bank_transactions')
		.select('date, amount')
		.eq('user_id', userId)
		.neq('account_id', accountId)
		.gte('date', from)
		.lte('date', to);
	return (data ?? []).map((d) => ({ date: d.date, amount: Number(d.amount) }));
}

/**
 * Decide whether a line is an internal movement between the user's own accounts.
 */
export function detectTransfer(
	tx: ParsedTransaction,
	myIbans: Set<string>,
	counterparts: { date: string; amount: number }[]
): TransferMatch {
	if (tx.internalHint === 'pocket') return { reason: 'Arrondi Pocket Revolut' };
	if (tx.internalHint === 'revolut-topup') return { reason: 'Recharge Revolut' };
	if (tx.internalHint === 'topup') return { reason: 'Retrait espèces' };

	if (tx.counterpartyIban && myIbans.has(tx.counterpartyIban)) {
		return { reason: 'Virement entre mes comptes' };
	}

	const opposite = counterparts.find(
		(c) => Math.abs(c.amount + tx.amount) < 0.005 && daysBetween(c.date, tx.date) <= WINDOW_DAYS
	);
	if (opposite) return { reason: 'Mouvement miroir sur un autre compte' };

	return null;
}

function shiftDate(iso: string, days: number): string {
	const d = new Date(iso + 'T00:00:00Z');
	d.setUTCDate(d.getUTCDate() + days);
	return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
	return Math.abs(Date.parse(a + 'T00:00:00Z') - Date.parse(b + 'T00:00:00Z')) / 86_400_000;
}

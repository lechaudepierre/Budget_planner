import type { ImportSource, TransactionStatus } from '$lib/types/database';

/**
 * A single statement line, normalised across bank formats.
 * `amount` is signed exactly as the bank reports it (negative = money out).
 */
export interface ParsedTransaction {
	source: ImportSource;
	/** Stable identifier used for deduplication across imports */
	externalId: string;
	/** YYYY-MM-DD */
	date: string;
	amount: number;
	/** Raw description as it appears in the statement */
	rawDescription: string;
	/** Normalised merchant / counterparty name (uppercase, no city/noise) */
	merchant: string;
	counterpartyIban?: string;
	counterpartyName?: string;
	/** Free-text communication of a transfer, when present */
	communication?: string;
	status: TransactionStatus;
	/** Hint from the statement itself that this is an internal movement (e.g. Revolut pocket round-ups) */
	internalHint?: 'pocket' | 'topup' | 'revolut-topup';
}

export interface ParseResult {
	source: ImportSource;
	transactions: ParsedTransaction[];
	/** IBAN of the account the statement belongs to (BNP only) */
	accountIban?: string;
	/** Balance of the main account after the last confirmed line (Revolut only) */
	balanceAfter?: number;
	/** Balance of the Revolut savings pocket after the last line (Revolut only) */
	pocketBalance?: number;
	/** Lines that were dropped (refused, reverted, unparsable) */
	skipped: number;
}

export class ParseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ParseError';
	}
}

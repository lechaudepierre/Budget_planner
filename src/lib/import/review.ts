import type { ImportSource, TransactionKind, TransactionStatus } from '$lib/types/database';
import type { ParsedTransaction } from './types';

/** Where a proposal came from — drives the visual grouping of the review table */
export type Confidence = 'system' | 'rule' | 'ai-high' | 'ai-low' | 'none';

/** One statement line with the proposed treatment. Sent to the client and back. */
export interface ReviewRow extends ParsedTransaction {
	isDuplicate: boolean;
	/** The line already exists as pending and is now confirmed by the bank */
	confirmsPending: boolean;
	kind: TransactionKind;
	categoryId: string | null;
	shareDivisor: number | null;
	confidence: Confidence;
	/** Short human explanation of the proposal ("Règle · PROXIMUS", "Recharge Revolut"…) */
	reason: string | null;
	/** Remember the user's decision as a rule for next time */
	learnRule: boolean;
}

export interface AnalyzeResponse {
	source: ImportSource;
	filename: string;
	accountId: string;
	/** IBAN found in the file (BNP) — the UI warns if it doesn't match the chosen account */
	accountIban: string | null;
	/** Account whose IBAN matches the file, when different from the chosen one */
	suggestedAccountId: string | null;
	balanceAfter: number | null;
	pocketBalance: number | null;
	rows: ReviewRow[];
	summary: {
		total: number;
		new: number;
		duplicates: number;
		toReview: number;
		transfers: number;
	};
	ai: { used: boolean; error: string | null };
}

export interface CommitRequest {
	source: ImportSource;
	filename: string;
	accountId: string;
	/** IBAN read from the file — stored on the account if it has none yet */
	accountIban: string | null;
	balanceAfter: number | null;
	pocketBalance: number | null;
	/** Savings account that mirrors the Revolut pocket, if the user has one */
	pocketAccountId: string | null;
	rows: ReviewRow[];
}

export interface CommitResponse {
	importId: string;
	inserted: { expenses: number; incomes: number; transfers: number; ignored: number };
	confirmed: number;
	rulesLearned: number;
	errors: string[];
}

export const KIND_LABELS: Record<TransactionKind, string> = {
	expense: 'Dépense',
	income: 'Revenu',
	transfer: 'Virement interne',
	reimbursement: 'Remboursement',
	ignored: 'Ignorer'
};

/** Rows the user should look at before validating */
export function needsReview(r: ReviewRow): boolean {
	if (r.isDuplicate) return false;
	if (r.kind === 'transfer' && r.confidence === 'system') return false;
	if (r.kind === 'expense')
		return r.confidence === 'none' || r.confidence === 'ai-low' || !r.categoryId;
	// incomes without a rule must be confirmed (income vs reimbursement)
	return r.confidence === 'none';
}

export type { TransactionKind, TransactionStatus };

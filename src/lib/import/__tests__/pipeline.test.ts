import { describe, it, expect } from 'vitest';
import { matchRule } from '$lib/server/import/rules';
import { detectTransfer } from '$lib/server/import/transfers';
import type { CategoryRule } from '$lib/types/database';
import type { ParsedTransaction } from '../types';

const tx = (over: Partial<ParsedTransaction>): ParsedTransaction => ({
	source: 'bnp',
	externalId: 'x',
	date: '2026-09-11',
	amount: -36,
	rawDescription: 'PAIEMENT PROXIMUS 1030 BRUSSEL',
	merchant: 'PROXIMUS',
	status: 'confirmed',
	...over
});

const rule = (over: Partial<CategoryRule>): CategoryRule => ({
	id: 'r',
	user_id: 'u',
	match_type: 'merchant',
	pattern: 'PROXIMUS',
	kind: 'expense',
	category_id: 'cat-wifi',
	share_divisor: 4,
	hits: 0,
	last_used_at: null,
	created_at: '',
	updated_at: '',
	...over
});

describe('matchRule', () => {
	it('prefers IBAN rules for transfers', () => {
		const rules = [
			rule({
				id: 'a',
				match_type: 'iban',
				pattern: 'BE99000000000099',
				kind: 'reimbursement',
				category_id: null
			}),
			rule({
				id: 'b',
				match_type: 'merchant',
				pattern: 'JANE DOE',
				kind: 'income',
				category_id: null
			})
		];
		const m = matchRule(
			tx({ merchant: 'JANE DOE', counterpartyIban: 'BE99000000000099', amount: 14 }),
			rules
		);
		expect(m?.rule.id).toBe('a');
		expect(m?.rule.kind).toBe('reimbursement');
	});

	it('matches exact merchant, then longest substring', () => {
		const rules = [
			rule({ id: 'short', match_type: 'contains', pattern: 'PRIME' }),
			rule({ id: 'long', match_type: 'contains', pattern: 'PRIME VIDEO' })
		];
		expect(matchRule(tx({ merchant: 'PRIME VIDEO RENT BUY' }), rules)?.rule.id).toBe('long');
		expect(matchRule(tx({ merchant: 'PROXIMUS' }), [rule({})])?.rule.category_id).toBe('cat-wifi');
		expect(matchRule(tx({ merchant: 'UNKNOWN' }), [rule({})])).toBeNull();
	});
});

describe('detectTransfer', () => {
	const myIbans = new Set(['BE00000000000001', 'BE00000000000002']);

	it('uses statement hints', () => {
		expect(detectTransfer(tx({ internalHint: 'pocket' }), myIbans, [])?.reason).toMatch(/Pocket/);
		expect(detectTransfer(tx({ internalHint: 'revolut-topup' }), myIbans, [])?.reason).toMatch(
			/Revolut/
		);
	});

	it('recognises my own IBANs', () => {
		expect(
			detectTransfer(tx({ counterpartyIban: 'BE00000000000002' }), myIbans, [])
		).not.toBeNull();
		expect(detectTransfer(tx({ counterpartyIban: 'BE99000000000099' }), myIbans, [])).toBeNull();
	});

	it('pairs mirror lines on another account within 3 days', () => {
		const counterparts = [{ date: '2026-09-03', amount: 800 }];
		expect(
			detectTransfer(tx({ amount: -800, date: '2026-09-02' }), myIbans, counterparts)
		).not.toBeNull();
		expect(
			detectTransfer(tx({ amount: -800, date: '2026-09-10' }), myIbans, counterparts)
		).toBeNull();
		expect(
			detectTransfer(tx({ amount: -799, date: '2026-09-02' }), myIbans, counterparts)
		).toBeNull();
	});
});

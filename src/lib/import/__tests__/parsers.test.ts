import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
	detectSource,
	parseStatement,
	parseStatementText,
	normalizeMerchant,
	normalizeIban
} from '../index';
import { parseCsv, parseAmount } from '../csv';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string) => readFileSync(join(here, 'fixtures', name));

describe('csv utilities', () => {
	it('parses quoted fields and CRLF', () => {
		expect(parseCsv('a;"b;c";"d ""q"""\r\n1;2;3\n', ';')).toEqual([
			['a', 'b;c', 'd "q"'],
			['1', '2', '3']
		]);
	});

	it('parses Belgian and English amounts', () => {
		expect(parseAmount('-30,00')).toBe(-30);
		expect(parseAmount('1.234,56')).toBe(1234.56);
		expect(parseAmount('-55.23')).toBe(-55.23);
	});
});

describe('merchant normalisation', () => {
	it('strips postal code, city, dates and card scheme noise', () => {
		expect(normalizeMerchant('POPPY 1050 BRUXELLES 11/09/2026 21:30')).toBe('POPPY');
		expect(normalizeMerchant('PROXIMUS 1030 BRUSSEL')).toBe('PROXIMUS');
		expect(normalizeMerchant('SUMUP *TEST SHOP BRUXELLES')).toBe('SUMUP TEST SHOP');
		expect(normalizeMerchant("ANTHROPIC* CLAUDE SUB ETATS-UNIS D'AMERIQUE")).toBe(
			'ANTHROPIC CLAUDE SUB'
		);
		expect(normalizeMerchant('REVOLUT**1398* IRLANDE (REPUB.)')).toBe('REVOLUT');
		expect(normalizeMerchant('IKEA ANDERLECHT-FOOD ANDERLECHT')).toBe('IKEA ANDERLECHT-FOOD');
		expect(normalizeMerchant('Caleo Café')).toBe('CALEO CAFE');
		expect(normalizeMerchant('Fondation de France', { stripLocation: false })).toBe(
			'FONDATION DE FRANCE'
		);
	});

	it('compacts IBANs', () => {
		expect(normalizeIban('BE99 0000 0000 0099')).toBe('BE99000000000099');
		expect(normalizeIban('')).toBeUndefined();
		expect(normalizeIban('not an iban')).toBeUndefined();
	});
});

describe('format detection', () => {
	it('detects BNP and Revolut by header', () => {
		expect(detectSource(fixture('bnp.csv').toString('utf8'))).toBe('bnp');
		expect(detectSource(fixture('revolut.csv').toString('utf8'))).toBe('revolut');
		expect(detectSource('foo,bar\n1,2')).toBeNull();
	});

	it('throws a ParseError on unknown formats', () => {
		expect(() => parseStatementText('foo,bar\n1,2')).toThrow(/non reconnu/);
	});
});

describe('BNP Fortis parser', () => {
	const result = parseStatement(fixture('bnp.csv'));

	it('reads the account IBAN and skips refused lines', () => {
		expect(result.accountIban).toBe('BE00000000000001');
		expect(result.skipped).toBe(1);
		expect(result.transactions).toHaveLength(9);
	});

	it('uses the bank reference as external id', () => {
		expect(result.transactions.map((t) => t.externalId)).toContain('ref:2609110000000002');
		expect(new Set(result.transactions.map((t) => t.externalId)).size).toBe(9);
	});

	it('extracts merchants from card payment details', () => {
		const byRef = Object.fromEntries(result.transactions.map((t) => [t.externalId, t]));
		expect(byRef['ref:2609110000000002'].merchant).toBe('POPPY');
		expect(byRef['ref:2609110000000003'].merchant).toBe('PROXIMUS');
		expect(byRef['ref:2609120000000001'].merchant).toBe('SUMUP TEST SHOP');
		expect(byRef['ref:2609090000000005'].merchant).toBe('ANTHROPIC CLAUDE SUB');
		expect(byRef['ref:2609070000000006'].merchant).toBe('KIWI.COM');
		expect(byRef['ref:2609070000000006'].amount).toBe(89.09);
	});

	it('uses counterparty name, IBAN and communication for transfers', () => {
		const rent = result.transactions.find((t) => t.externalId === 'ref:2609020000000008')!;
		expect(rent.merchant).toBe('JOHN LANDLORD');
		expect(rent.counterpartyIban).toBe('BE88000000000088');
		expect(rent.communication).toBe('Loyer septembre');
		expect(rent.amount).toBe(-500);
		expect(rent.date).toBe('2026-09-02');
	});

	it('flags Revolut top-ups as internal', () => {
		const topup = result.transactions.find((t) => t.externalId === 'ref:2609030000000007')!;
		expect(topup.internalHint).toBe('revolut-topup');
		expect(topup.amount).toBe(-800);
	});

	it('marks unnumbered lines as pending', () => {
		expect(result.transactions.find((t) => t.externalId === 'ref:2609120000000001')!.status).toBe(
			'pending'
		);
		expect(result.transactions.find((t) => t.externalId === 'ref:2609110000000002')!.status).toBe(
			'confirmed'
		);
	});

	it('converts value dates to ISO', () => {
		expect(result.transactions.find((t) => t.externalId === 'ref:2609090000000005')!.date).toBe(
			'2026-09-08'
		);
	});
});

describe('Revolut parser', () => {
	const result = parseStatement(fixture('revolut.csv'));

	it('only keeps the main account and drops reverted lines', () => {
		expect(result.transactions).toHaveLength(10);
		expect(result.skipped).toBe(1);
		expect(result.transactions.every((t) => t.source === 'revolut')).toBe(true);
	});

	it('reads main and pocket balances from the last lines', () => {
		expect(result.balanceAfter).toBe(744.03);
		expect(result.pocketBalance).toBe(0.4);
	});

	it('flags pocket round-ups and top-ups as internal', () => {
		const hints = result.transactions.filter((t) => t.internalHint).map((t) => t.internalHint);
		expect(hints.filter((h) => h === 'pocket')).toHaveLength(3);
		expect(hints.filter((h) => h === 'revolut-topup')).toHaveLength(1);
	});

	it('disambiguates identical lines and keeps ids stable', () => {
		const klm = result.transactions.filter((t) => t.merchant === 'KLM ROYAL DUTCH AIRLINES');
		expect(klm).toHaveLength(2);
		expect(klm[0].externalId).not.toBe(klm[1].externalId);
		expect(klm[0].externalId.endsWith('|1')).toBe(true);
		expect(klm[1].externalId.endsWith('|2')).toBe(true);
	});

	it('marks pending lines and uses the start date', () => {
		const pending = result.transactions.find((t) => t.rawDescription === 'Caleo Café')!;
		expect(pending.status).toBe('pending');
		expect(pending.date).toBe('2026-09-12');
		expect(pending.amount).toBe(-40.6);
	});

	it('accepts English headers', () => {
		const en = [
			'Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance',
			'Card Payment,Current,2026-09-10 09:43:17,2026-09-11 10:35:33,Delhaize,-2.70,0.00,EUR,COMPLETED,10.00'
		].join('\n');
		const r = parseStatementText(en);
		expect(r.transactions).toHaveLength(1);
		expect(r.transactions[0].merchant).toBe('DELHAIZE');
		expect(r.balanceAfter).toBe(10);
	});
});

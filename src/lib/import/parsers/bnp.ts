import { parseCsv, parseAmount } from '../csv';
import { normalizeMerchant, normalizeIban } from '../merchant';
import { ParseError, type ParsedTransaction, type ParseResult } from '../types';

/**
 * BNP Paribas Fortis (Belgium) CSV export.
 *
 * Header (fr):
 *   Nº de séquence;Date d'exécution;Date valeur;Montant;Devise du compte;Numéro de compte;
 *   Type de transaction;Contrepartie;Nom de la contrepartie;Communication;Détails;Statut;Motif du refus
 */

const COL = {
	sequence: 0,
	executionDate: 1,
	valueDate: 2,
	amount: 3,
	currency: 4,
	accountIban: 5,
	type: 6,
	counterpartyIban: 7,
	counterpartyName: 8,
	communication: 9,
	details: 10,
	status: 11
} as const;

export function isBnpStatement(headerLine: string): boolean {
	const h = headerLine.toLowerCase();
	return h.includes('de séquence') && h.includes("date d'exécution") && h.includes('détails');
}

export function parseBnp(text: string): ParseResult {
	const rows = parseCsv(text, ';');
	if (rows.length === 0 || !isBnpStatement(rows[0].join(';'))) {
		throw new ParseError('Format BNP non reconnu');
	}

	const transactions: ParsedTransaction[] = [];
	let skipped = 0;
	let accountIban: string | undefined;

	for (const row of rows.slice(1)) {
		if (row.length < 12) {
			skipped++;
			continue;
		}

		const status = row[COL.status].trim();
		if (status && status !== 'Accepté') {
			skipped++;
			continue;
		}

		const amount = parseAmount(row[COL.amount]);
		const date = parseBnpDate(row[COL.valueDate]) ?? parseBnpDate(row[COL.executionDate]);
		if (Number.isNaN(amount) || !date) {
			skipped++;
			continue;
		}

		accountIban ??= normalizeIban(row[COL.accountIban]);

		const details = row[COL.details].trim();
		const type = row[COL.type].trim();
		const counterpartyIban = normalizeIban(row[COL.counterpartyIban]);
		const counterpartyName = row[COL.counterpartyName].trim() || undefined;
		const communication = row[COL.communication].trim() || undefined;

		const externalId =
			extractBankReference(details) ?? `${date}|${amount.toFixed(2)}|${details.slice(0, 80)}`;

		const { merchant, internalHint } = extractBnpMerchant(type, details, counterpartyName);

		transactions.push({
			source: 'bnp',
			externalId,
			date,
			amount,
			rawDescription: details || type,
			merchant,
			counterpartyIban,
			counterpartyName,
			communication,
			// Lines not yet numbered ("2026-") are still being processed by the bank
			status: /\d{4}-\d+/.test(row[COL.sequence]) ? 'confirmed' : 'pending',
			internalHint
		});
	}

	return { source: 'bnp', transactions, accountIban, skipped };
}

/** "11/09/2026" → "2026-09-11" */
function parseBnpDate(raw: string): string | undefined {
	const m = raw.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined;
}

function extractBankReference(details: string): string | undefined {
	const m = details.match(/REFERENCE BANQUE\s*:\s*(\d{10,20})/i);
	return m ? `ref:${m[1]}` : undefined;
}

const CARD_PAYMENT_RE =
	/CARTE DE (?:DEBIT|CREDIT) NUMERO \d{4} \d{2}XX XXXX \d{4}\s+(.+?)\s+\d{2}\/\d{2}\/\d{4}/i;
const REFUND_RE = /VERSEMENT DE\s+(.+?)\s+SUR LE COMPTE/i;
const DIRECT_DEBIT_RE = /CREDITEUR\s*:\s*(.+?)\s+(?:REFERENCE|COMMUNICATION|MANDAT|NUMERO)/i;

function extractBnpMerchant(
	type: string,
	details: string,
	counterpartyName?: string
): { merchant: string; internalHint?: ParsedTransaction['internalHint'] } {
	const t = type.toLowerCase();

	if (t.includes('carte')) {
		// Refunds mention the card number too, so test them first
		const m = details.match(REFUND_RE) ?? details.match(CARD_PAYMENT_RE);
		const merchant = normalizeMerchant(m ? m[1] : details);
		if (merchant.startsWith('REVOLUT')) return { merchant, internalHint: 'revolut-topup' };
		return { merchant };
	}

	if (t.includes('retrait')) {
		return { merchant: 'RETRAIT ESPECES', internalHint: 'topup' };
	}

	if (t.includes('domiciliation')) {
		const m = details.match(DIRECT_DEBIT_RE);
		return { merchant: normalizeMerchant(m ? m[1] : (counterpartyName ?? details)) };
	}

	// Transfers (instantané, ordre permanent, virement en euros…)
	if (counterpartyName) {
		return { merchant: normalizeMerchant(counterpartyName) };
	}

	return { merchant: normalizeMerchant(details.slice(0, 60) || type) };
}

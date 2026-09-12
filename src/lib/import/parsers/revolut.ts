import { parseCsv } from '../csv';
import { normalizeMerchant } from '../merchant';
import { ParseError, type ParsedTransaction, type ParseResult } from '../types';

/**
 * Revolut account statement CSV export (fr or en headers).
 *
 * fr: Type,Produit,Date de début,Date de fin,Description,Montant,Frais,Devise,État,Solde
 * en: Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
 *
 * Only the main account ("Valeur actuelle" / "Current") produces transactions.
 * Savings pocket lines are only used to read the pocket balance; the round-up
 * transfers that mirror them on the main account are flagged as internal.
 */

const HEADER_ALIASES: Record<string, string> = {
	type: 'type',
	produit: 'product',
	product: 'product',
	'date de début': 'started',
	'started date': 'started',
	'date de fin': 'completed',
	'completed date': 'completed',
	description: 'description',
	montant: 'amount',
	amount: 'amount',
	frais: 'fee',
	fee: 'fee',
	devise: 'currency',
	currency: 'currency',
	état: 'state',
	etat: 'state',
	state: 'state',
	solde: 'balance',
	balance: 'balance'
};

const MAIN_PRODUCTS = ['valeur actuelle', 'current'];
const POCKET_DESCRIPTION_RE =
	/^(sur la pocket|retrait depuis une pocket|to pocket|from pocket|to .* pocket|from .* pocket)/i;
const COMPLETED_STATES = ['terminé', 'termine', 'completed'];
const PENDING_STATES = ['en attente', 'pending'];

export function isRevolutStatement(headerLine: string): boolean {
	const h = headerLine.toLowerCase();
	return (
		h.startsWith('type,') &&
		(h.includes('produit') || h.includes('product')) &&
		(h.includes('solde') || h.includes('balance'))
	);
}

export function parseRevolut(text: string): ParseResult {
	const rows = parseCsv(text, ',');
	if (rows.length === 0 || !isRevolutStatement(rows[0].join(','))) {
		throw new ParseError('Format Revolut non reconnu');
	}

	const idx = mapHeader(rows[0]);
	const transactions: ParsedTransaction[] = [];
	const seen = new Map<string, number>();
	let skipped = 0;
	let balanceAfter: number | undefined;
	let pocketBalance: number | undefined;

	for (const row of rows.slice(1)) {
		const get = (key: string) => (idx[key] !== undefined ? (row[idx[key]] ?? '').trim() : '');

		const product = get('product').toLowerCase();
		const state = get('state').toLowerCase();
		const amount = Number(get('amount'));
		const balanceRaw = get('balance');
		const balance = balanceRaw === '' ? undefined : Number(balanceRaw);

		if (Number.isNaN(amount)) {
			skipped++;
			continue;
		}

		const isMain = MAIN_PRODUCTS.includes(product);

		// Savings pocket: only track its balance
		if (!isMain) {
			if (balance !== undefined && !Number.isNaN(balance)) pocketBalance = balance;
			continue;
		}

		if (!COMPLETED_STATES.includes(state) && !PENDING_STATES.includes(state)) {
			skipped++; // reverted / declined / failed
			continue;
		}

		const started = get('started');
		const date = started.slice(0, 10);
		if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			skipped++;
			continue;
		}

		const description = get('description');
		const type = get('type').toLowerCase();

		// Several identical lines can share the same start timestamp (e.g. two plane tickets)
		const baseKey = `${started}|${amount.toFixed(2)}|${description}`;
		const occurrence = (seen.get(baseKey) ?? 0) + 1;
		seen.set(baseKey, occurrence);

		let internalHint: ParsedTransaction['internalHint'];
		if (POCKET_DESCRIPTION_RE.test(description)) internalHint = 'pocket';
		else if (type.includes('ajout de fonds') || type.includes('top-up') || type.includes('topup'))
			internalHint = 'revolut-topup';

		transactions.push({
			source: 'revolut',
			externalId: `${baseKey}|${occurrence}`,
			date,
			amount,
			rawDescription: description,
			merchant: normalizeMerchant(description, { stripLocation: false }),
			status: COMPLETED_STATES.includes(state) ? 'confirmed' : 'pending',
			internalHint
		});

		if (balance !== undefined && !Number.isNaN(balance)) balanceAfter = balance;
	}

	return { source: 'revolut', transactions, balanceAfter, pocketBalance, skipped };
}

function mapHeader(header: string[]): Record<string, number> {
	const idx: Record<string, number> = {};
	header.forEach((raw, i) => {
		const key = HEADER_ALIASES[raw.trim().toLowerCase()];
		if (key) idx[key] = i;
	});
	for (const required of ['product', 'started', 'description', 'amount', 'state']) {
		if (idx[required] === undefined)
			throw new ParseError(`Colonne Revolut manquante : ${required}`);
	}
	return idx;
}

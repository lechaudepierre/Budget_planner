import { decodeStatement } from './csv';
import { isBnpStatement, parseBnp } from './parsers/bnp';
import { isRevolutStatement, parseRevolut } from './parsers/revolut';
import { ParseError, type ParseResult } from './types';
import type { ImportSource } from '$lib/types/database';

export * from './types';
export { normalizeMerchant, normalizeIban } from './merchant';

/** Detect the bank format from the header line. */
export function detectSource(text: string): ImportSource | null {
	const header = text.split(/\r?\n/, 1)[0] ?? '';
	if (isBnpStatement(header)) return 'bnp';
	if (isRevolutStatement(header)) return 'revolut';
	return null;
}

/** Parse a statement file (raw bytes) into normalised transactions. */
export function parseStatement(bytes: ArrayBuffer | Uint8Array): ParseResult {
	const text = decodeStatement(bytes);
	return parseStatementText(text);
}

export function parseStatementText(text: string): ParseResult {
	const source = detectSource(text);
	if (source === 'bnp') return parseBnp(text);
	if (source === 'revolut') return parseRevolut(text);
	throw new ParseError('Format de relevé non reconnu (BNP Fortis ou Revolut attendu)');
}

/**
 * Merchant name normalisation. The goal is a stable key for rule matching
 * ("POPPY 1050 BRUXELLES 11/09/2026 21:30" and "POPPY 1050 BRUXELLES 09/09/2026 11:01"
 * must both become "POPPY"), not a pretty display name.
 */

const COUNTRIES = [
	'BELGIQUE',
	'BELGIE',
	'BELGIUM',
	'FRANCE',
	'PAYS-BAS',
	'NEDERLAND',
	'NETHERLANDS',
	'LUXEMBOURG',
	'ALLEMAGNE',
	'DEUTSCHLAND',
	'GERMANY',
	'ESPAGNE',
	'SPAIN',
	'ITALIE',
	'ITALY',
	'PORTUGAL',
	'SUISSE',
	'AUTRICHE',
	'ROYAUME UNI',
	'ROYAUME-UNI',
	'UNITED KINGDOM',
	'IRLANDE (REPUB.)',
	'IRLANDE',
	'IRELAND',
	"ETATS-UNIS D'AMERIQUE",
	'ETATS-UNIS',
	'USA',
	'REPUBLIQUE TCHEQUE',
	'POLOGNE',
	'COLOMBIE',
	'CANADA',
	'MAROC',
	'GRECE',
	'DANEMARK',
	'SUEDE',
	'NORVEGE'
];

// Common Belgian cities that BNP appends after the merchant name (with or without postal code)
const CITIES = [
	'BRUXELLES',
	'BRUSSEL',
	'BRUSSELS',
	'ANDERLECHT',
	'IXELLES',
	'ELSENE',
	'ETTERBEEK',
	'SCHAERBEEK',
	'SCHAARBEEK',
	'UCCLE',
	'UKKEL',
	'FOREST',
	'VORST',
	'SAINT-GILLES',
	'SINT-GILLIS',
	'MOLENBEEK',
	'JETTE',
	'EVERE',
	'WOLUWE',
	'AUDERGHEM',
	'WATERMAEL',
	'LIEGE',
	'NAMUR',
	'LOUVAIN-LA-NEUVE',
	'LOUVAIN',
	'LEUVEN',
	'GAND',
	'GENT',
	'ANVERS',
	'ANTWERPEN',
	'CHARLEROI',
	'MONS',
	'WAVRE',
	'OTTIGNIES',
	'BRUGES',
	'BRUGGE',
	'ZAVENTEM',
	'PARIS',
	'LILLE',
	'AMSTERDAM'
];

const NOISE_PATTERNS: RegExp[] = [
	/\bVISA DEBIT\b.*$/,
	/\bBANCONTACT\b.*$/,
	/\bMAESTRO\b.*$/,
	/\bAPPLE PAY\b/,
	/\bGOOGLE PAY\b/,
	/\bECOMMERCE\b/i,
	/\bFRAIS DE TRAITEMENT\b.*$/,
	/\bEXECUTE LE\b.*$/,
	/\bREFERENCE BANQUE\b.*$/,
	/\bDATE VALEUR\b.*$/,
	/\b\d{2}\/\d{2}\/\d{4}\b(\s+\d{2}:\d{2})?/g, // dates + optional time
	/\b\d{2}:\d{2}\b/g
];

/**
 * Normalise a merchant string extracted from a bank statement.
 */
export function normalizeMerchant(
	input: string,
	options: { stripLocation?: boolean } = {}
): string {
	// BNP appends "<postal code> <city>" or a country to card payments; Revolut never does,
	// so only strip trailing locations when asked (otherwise "FONDATION DE FRANCE" → "FONDATION DE").
	const stripLocation = options.stripLocation ?? true;
	let s = input.toUpperCase();

	// Strip accents so "CINÉMA" and "CINEMA" match
	s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');

	for (const re of NOISE_PATTERNS) s = s.replace(re, ' ');

	// Card-scheme markers such as "SUMUP *MORGAN" or "REVOLUT**1398*"
	s = s.replace(/\*+\d*\*?/g, ' ');

	s = collapse(s);

	if (stripLocation) {
		// Trailing country
		for (const country of COUNTRIES) {
			if (s.endsWith(' ' + country)) {
				s = s.slice(0, -country.length - 1);
				break;
			}
		}

		// Trailing "<postal code> <city>" or "<city>"
		s = s.replace(/\s+\d{4}\s+[A-Z' -]+$/, '');
		for (const city of CITIES) {
			if (s.endsWith(' ' + city)) {
				s = s.slice(0, -city.length - 1);
				break;
			}
		}
		// A lone trailing 4-digit postal code
		s = s.replace(/\s+\d{4}$/, '');
	}

	s = collapse(s);
	return s.length > 0 ? s : collapse(input.toUpperCase());
}

function collapse(s: string): string {
	return s.replace(/\s+/g, ' ').trim();
}

/** Compact an IBAN for comparison: "BE05 6511 6693 4275" → "BE05651166934275" */
export function normalizeIban(iban: string | undefined | null): string | undefined {
	if (!iban) return undefined;
	const s = iban.replace(/\s+/g, '').toUpperCase();
	return /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s) ? s : undefined;
}

/**
 * Minimal RFC-4180-ish CSV parser: handles quoted fields, escaped quotes,
 * CRLF line endings and a configurable delimiter. No streaming — statements
 * are a few hundred lines at most.
 */
export function parseCsv(text: string, delimiter: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let inQuotes = false;

	for (let i = 0; i < text.length; i++) {
		const ch = text[i];

		if (inQuotes) {
			if (ch === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i++;
				} else {
					inQuotes = false;
				}
			} else {
				field += ch;
			}
			continue;
		}

		if (ch === '"') {
			inQuotes = true;
		} else if (ch === delimiter) {
			row.push(field);
			field = '';
		} else if (ch === '\n' || ch === '\r') {
			if (ch === '\r' && text[i + 1] === '\n') i++;
			row.push(field);
			rows.push(row);
			row = [];
			field = '';
		} else {
			field += ch;
		}
	}

	// Last line without trailing newline
	if (field.length > 0 || row.length > 0) {
		row.push(field);
		rows.push(row);
	}

	// Drop completely empty rows (trailing newline artefacts)
	return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

/**
 * Decode an uploaded file as text. Bank exports are either UTF-8 (with or
 * without BOM) or Windows-1252 (older BNP exports). We try UTF-8 first and
 * fall back if the decoder reports invalid sequences.
 */
export function decodeStatement(bytes: ArrayBuffer | Uint8Array): string {
	const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	try {
		return stripBom(new TextDecoder('utf-8', { fatal: true }).decode(buf));
	} catch {
		return stripBom(new TextDecoder('windows-1252').decode(buf));
	}
}

function stripBom(s: string): string {
	return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

/** "-30,00" | "1.234,56" | "-55.23" → number */
export function parseAmount(raw: string): number {
	const s = raw.trim();
	if (!s) return NaN;
	// Belgian format: thousands "." and decimal ","
	if (s.includes(',')) {
		return Number(s.replace(/\./g, '').replace(',', '.'));
	}
	return Number(s);
}

import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { env } from '$env/dynamic/private';

export interface CategoryContext {
	id: string;
	name: string;
	type: 'fixed' | 'variable';
	/** A few merchant names already filed under this category */
	examples: string[];
}

export interface LineToCategorize {
	index: number;
	merchant: string;
	rawDescription: string;
	amount: number;
	date: string;
	communication?: string;
}

export interface AiSuggestion {
	index: number;
	categoryId: string | null;
	confidence: 'high' | 'low';
}

// Merchant classification is a small, well-bounded task: Sonnet is plenty and ~2.5× cheaper than Opus.
// Override with ANTHROPIC_MODEL (e.g. claude-haiku-4-5) without touching the code.
const DEFAULT_MODEL = 'claude-sonnet-5';
const model = () => env.ANTHROPIC_MODEL || DEFAULT_MODEL;

const suggestionSchema = z.object({
	items: z.array(
		z.object({
			index: z.number().int(),
			category_id: z.string().nullable(),
			confidence: z.enum(['high', 'low'])
		})
	)
});

export function isAiConfigured(): boolean {
	return Boolean(env.ANTHROPIC_API_KEY);
}

/**
 * Ask Claude to file unknown statement lines into the user's own categories.
 * Returns one suggestion per input line; `categoryId` is null when nothing fits.
 * Throws on API errors — callers decide whether the import can continue without AI.
 */
export async function categorizeWithAi(
	categories: CategoryContext[],
	lines: LineToCategorize[]
): Promise<AiSuggestion[]> {
	if (lines.length === 0) return [];
	if (!isAiConfigured()) throw new Error('ANTHROPIC_API_KEY manquante');

	// Organisation-level keys must name the workspace to bill; workspace-scoped keys don't.
	const client = new Anthropic({
		apiKey: env.ANTHROPIC_API_KEY,
		defaultHeaders: env.ANTHROPIC_WORKSPACE_ID
			? { 'anthropic-workspace-id': env.ANTHROPIC_WORKSPACE_ID }
			: undefined
	});

	const system = [
		"Tu classes des lignes de relevé bancaire belge dans les catégories de budget personnelles de l'utilisateur.",
		'Réponds uniquement avec le JSON demandé. Pour chaque ligne, choisis la catégorie la plus plausible parmi la liste,',
		'ou null si aucune ne convient vraiment. Mets confidence="high" seulement si le commerçant est sans ambiguïté',
		'(supermarché → courses, opérateur télécom → internet, etc.). Les montants sont négatifs pour les dépenses.',
		'',
		"Catégories de l'utilisateur (id → nom, type, exemples déjà classés) :",
		...categories.map(
			(c) =>
				`- ${c.id} → « ${c.name} » (${c.type === 'fixed' ? 'coût fixe' : 'variable'})` +
				(c.examples.length ? ` — ex : ${c.examples.join(', ')}` : '')
		)
	].join('\n');

	const user = [
		'Lignes à classer :',
		...lines.map(
			(l) =>
				`${l.index}. ${l.date} | ${l.amount.toFixed(2)} € | ${l.merchant}` +
				(l.communication ? ` | communication : ${l.communication}` : '') +
				(l.rawDescription && l.rawDescription !== l.merchant
					? ` | brut : ${l.rawDescription.slice(0, 120)}`
					: '')
		)
	].join('\n');

	const response = await client.messages.parse({
		model: model(),
		max_tokens: 4096,
		system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
		output_config: { effort: 'low', format: zodOutputFormat(suggestionSchema) },
		messages: [{ role: 'user', content: user }]
	});

	if (response.stop_reason === 'refusal') {
		throw new Error('Claude a refusé la requête');
	}

	const parsed = response.parsed_output;
	if (!parsed) throw new Error('Réponse Claude invalide');

	const validIds = new Set(categories.map((c) => c.id));
	return parsed.items.map((item) => ({
		index: item.index,
		categoryId: item.category_id && validIds.has(item.category_id) ? item.category_id : null,
		confidence: item.confidence
	}));
}

/** Human-readable message for an AI failure (API errors carry a JSON body in their message). */
export function describeAiError(e: unknown): string {
	if (e instanceof Anthropic.AuthenticationError) return 'Clé API Anthropic invalide';
	if (e instanceof Anthropic.RateLimitError)
		return 'Quota Anthropic atteint, réessaie dans un instant';
	if (e instanceof Anthropic.APIError) {
		const body = e.error as { error?: { message?: string } } | undefined;
		const detail = body?.error?.message ?? e.message;
		if (/workspace/i.test(detail)) {
			return 'Clé API sans workspace : ajoute ANTHROPIC_WORKSPACE_ID ou crée une clé dans un workspace';
		}
		if (/credit/i.test(detail)) return 'Crédit Anthropic insuffisant';
		return `Erreur Anthropic ${e.status ?? ''} : ${detail}`.trim();
	}
	return e instanceof Error ? e.message : 'Erreur IA';
}

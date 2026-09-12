import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { commitStatement } from '$lib/server/import/commit';
import type { CommitRequest } from '$lib/import/review';

export const POST: RequestHandler = async ({ request, locals }) => {
	const userId = locals.session?.user.id;
	if (!userId) throw error(401, 'Non authentifié');

	let body: CommitRequest;
	try {
		body = (await request.json()) as CommitRequest;
	} catch {
		throw error(400, 'Corps de requête invalide');
	}
	if (!body?.accountId || !Array.isArray(body.rows) || !body.source) {
		throw error(400, 'Requête incomplète');
	}

	try {
		const result = await commitStatement(locals.supabase, userId, body);
		return json(result);
	} catch (e) {
		console.error('Import commit failed', e);
		throw error(500, e instanceof Error ? e.message : "Erreur lors de l'import");
	}
};

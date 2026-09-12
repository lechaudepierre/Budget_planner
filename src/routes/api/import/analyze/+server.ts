import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { analyzeStatement } from '$lib/server/import/analyze';
import { ParseError } from '$lib/import';

const MAX_BYTES = 5 * 1024 * 1024;

export const POST: RequestHandler = async ({ request, locals }) => {
	const userId = locals.session?.user.id;
	if (!userId) throw error(401, 'Non authentifié');

	const form = await request.formData();
	const file = form.get('file');
	const accountId = form.get('account_id');

	if (!(file instanceof File)) throw error(400, 'Fichier manquant');
	if (typeof accountId !== 'string' || !accountId) throw error(400, 'Compte manquant');
	if (file.size > MAX_BYTES) throw error(413, 'Fichier trop volumineux');

	try {
		const result = await analyzeStatement(locals.supabase, userId, {
			bytes: await file.arrayBuffer(),
			filename: file.name,
			accountId
		});
		return json(result);
	} catch (e) {
		if (e instanceof ParseError) throw error(422, e.message);
		console.error('Import analyze failed', e);
		throw error(500, "Erreur lors de l'analyse du relevé");
	}
};

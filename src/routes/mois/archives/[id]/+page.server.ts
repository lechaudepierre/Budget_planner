import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { loadArchives } from '$lib/server/archive';

export const load: PageServerLoad = async ({ locals, params, depends }) => {
	depends('app:month');
	const userId = locals.session?.user.id;
	const [archive] = userId ? await loadArchives(locals.supabase, userId, params.id) : [];
	if (!archive) error(404, 'Mois introuvable');
	return { archive };
};

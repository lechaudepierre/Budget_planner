import type { PageServerLoad } from './$types';
import { loadArchives } from '$lib/server/archive';

export const load: PageServerLoad = async ({ locals, depends }) => {
	depends('app:month');
	const userId = locals.session?.user.id;
	return { archives: userId ? await loadArchives(locals.supabase, userId) : [] };
};

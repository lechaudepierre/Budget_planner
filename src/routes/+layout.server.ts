import type { LayoutServerLoad } from './$types';
import { loadMonth } from '$lib/server/month';

/** One load feeds the three screens; `dashboardRefresh.trigger()` invalidates it after a mutation. */
export const load: LayoutServerLoad = async ({ locals, depends }) => {
	depends('app:month');
	const userId = locals.session?.user.id;
	if (!userId) return { month: null };
	return { month: await loadMonth(locals.supabase, userId) };
};

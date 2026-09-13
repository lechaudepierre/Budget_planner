import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { loadDashboard } from '$lib/server/dashboard';

export const load: PageServerLoad = async ({ locals, depends }) => {
	depends('app:dashboard');
	const userId = locals.session?.user.id;
	if (!userId) throw redirect(303, '/auth');

	const dashboard = await loadDashboard(locals.supabase, userId);
	return {
		dashboard,
		header: {
			title: 'Ce mois',
			subtitle: dashboard.period
				? dashboard.period.overdueDays > 0
					? `${dashboard.period.label} · à clôturer`
					: `${dashboard.period.label} · ${dashboard.period.daysLeft} jour${dashboard.period.daysLeft > 1 ? 's' : ''} restants`
				: 'Aucune période active'
		}
	};
};

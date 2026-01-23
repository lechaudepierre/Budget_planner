import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');
	const error = url.searchParams.get('error');

	// Handle OAuth errors (e.g., user cancelled)
	if (error) {
		const errorDescription = url.searchParams.get('error_description') || 'access_denied';
		throw redirect(303, `/auth?error=${encodeURIComponent(errorDescription)}`);
	}

	if (code) {
		const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

		if (!exchangeError) {
			// Profile is auto-created by database trigger, but upsert to be safe
			const {
				data: { user }
			} = await supabase.auth.getUser();
			if (user) {
				await supabase.from('profiles').upsert({ id: user.id }, { onConflict: 'id' });
			}
			throw redirect(303, '/');
		}

		console.error('Session exchange error:', exchangeError);
	}

	throw redirect(303, '/auth?error=auth_failed');
};

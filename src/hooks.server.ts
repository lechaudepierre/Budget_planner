import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { redirect, type Handle } from '@sveltejs/kit';
import type { Database } from '$lib/types/database';

export const handle: Handle = async ({ event, resolve }) => {
	// Create Supabase server client
	event.locals.supabase = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll() {
					return event.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, { ...options, path: '/' });
					});
				}
			}
		}
	);

	// Validate the user with the Auth server (the cookie session alone is not authenticated),
	// then keep the session object for the access token.
	const {
		data: { user },
		error
	} = await event.locals.supabase.auth.getUser();
	const {
		data: { session: cookieSession }
	} = await event.locals.supabase.auth.getSession();
	const session = user && cookieSession ? { ...cookieSession, user } : null;

	event.locals.session = session;

	// Public routes that don't require authentication
	const publicRoutes = ['/auth', '/auth/callback', '/auth/logout'];
	const isPublicRoute = publicRoutes.some((route) => event.url.pathname.startsWith(route));

	// Handle expired sessions
	if (error?.message?.includes('expired') || error?.message?.includes('invalid')) {
		if (!isPublicRoute) {
			throw redirect(303, '/auth?error=session_expired');
		}
	}

	// Redirect unauthenticated users to login
	if (!session && !isPublicRoute) {
		throw redirect(303, '/auth');
	}

	// Redirect authenticated users away from auth pages (except logout)
	if (session && event.url.pathname.startsWith('/auth') && !event.url.pathname.includes('logout')) {
		throw redirect(303, '/');
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

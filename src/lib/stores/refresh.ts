import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { invalidate } from '$app/navigation';

/**
 * Signals that budget data changed: reloads the month (server layout load).
 * Resolves once the fresh data is in place.
 */
function createRefreshStore() {
	const { subscribe, set } = writable<number>(0);

	return {
		subscribe,
		trigger: async () => {
			set(Date.now());
			if (browser) await invalidate('app:month');
		}
	};
}

export const dashboardRefresh = createRefreshStore();

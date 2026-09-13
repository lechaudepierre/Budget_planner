import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { invalidate } from '$app/navigation';

/**
 * Signals that budget data changed. Client pages subscribe to the store;
 * the home page (server-loaded) is refreshed through `invalidate`.
 */
function createRefreshStore() {
	const { subscribe, set } = writable<number>(0);

	return {
		subscribe,
		trigger: () => {
			set(Date.now());
			if (browser) void invalidate('app:dashboard');
		}
	};
}

export const dashboardRefresh = createRefreshStore();

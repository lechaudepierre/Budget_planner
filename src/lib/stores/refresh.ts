import { writable } from 'svelte/store';

// Store to trigger dashboard refresh when data changes
function createRefreshStore() {
	const { subscribe, set } = writable<number>(0);

	return {
		subscribe,
		// Trigger a refresh by incrementing the counter
		trigger: () => {
			set(Date.now());
		}
	};
}

export const dashboardRefresh = createRefreshStore();

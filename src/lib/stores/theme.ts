import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'auto' | 'light' | 'dark';
const KEY = 'budget:theme';

function read(): Theme {
	if (!browser) return 'auto';
	try {
		const t = localStorage.getItem(KEY);
		return t === 'light' || t === 'dark' ? t : 'auto';
	} catch {
		return 'auto';
	}
}

function apply(t: Theme) {
	if (!browser) return;
	if (t === 'auto') delete document.documentElement.dataset.theme;
	else document.documentElement.dataset.theme = t;
	try {
		if (t === 'auto') localStorage.removeItem(KEY);
		else localStorage.setItem(KEY, t);
	} catch {
		/* private mode: the choice just won't persist */
	}
}

/** Appearance: follows the system by default, remembered per device. */
function createThemeStore() {
	const { subscribe, set } = writable<Theme>(read());
	return {
		subscribe,
		set: (t: Theme) => {
			apply(t);
			set(t);
		}
	};
}

export const theme = createThemeStore();

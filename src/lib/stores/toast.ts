import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	message: string;
	/** Optional "Annuler" action shown on the right */
	undo?: () => void | Promise<void>;
	error?: boolean;
}

/** One toast at a time, bottom of the screen, 3.5 s. */
function createToastStore() {
	const { subscribe, set } = writable<Toast | null>(null);
	let timer: ReturnType<typeof setTimeout> | null = null;

	const show = (message: string, opts: { undo?: Toast['undo']; error?: boolean } = {}) => {
		if (timer) clearTimeout(timer);
		set({ id: crypto.randomUUID(), message, ...opts });
		timer = setTimeout(() => set(null), 3500);
	};

	return {
		subscribe,
		show,
		success: (message: string) => show(message),
		error: (message: string) => show(message, { error: true }),
		dismiss: () => {
			if (timer) clearTimeout(timer);
			set(null);
		}
	};
}

export const toast = createToastStore();

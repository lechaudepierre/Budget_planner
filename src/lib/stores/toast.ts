import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	return {
		subscribe,
		show: (message: string, type: ToastType = 'info') => {
			const id = crypto.randomUUID();
			update((toasts) => [...toasts, { id, type, message }]);
			setTimeout(() => {
				update((toasts) => toasts.filter((t) => t.id !== id));
			}, 3000);
		},
		success: (message: string) => {
			const id = crypto.randomUUID();
			update((toasts) => [...toasts, { id, type: 'success', message }]);
			setTimeout(() => {
				update((toasts) => toasts.filter((t) => t.id !== id));
			}, 3000);
		},
		error: (message: string) => {
			const id = crypto.randomUUID();
			update((toasts) => [...toasts, { id, type: 'error', message }]);
			setTimeout(() => {
				update((toasts) => toasts.filter((t) => t.id !== id));
			}, 3000);
		},
		dismiss: (id: string) => {
			update((toasts) => toasts.filter((t) => t.id !== id));
		}
	};
}

export const toast = createToastStore();

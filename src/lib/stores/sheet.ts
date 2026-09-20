import { writable } from 'svelte/store';
import type { IconName } from '$lib/components/ui/Icon.svelte';

/**
 * The single bottom sheet of the app. Every amount is typed there.
 * - `add`   : new expense in an envelope (or "corriger le total")
 * - `edit`  : change / delete an existing expense
 * - `value` : set a monthly amount (salary, savings, fixed cost, envelope budget)
 * - `create`: new envelope or fixed cost (name + amount)
 */
export type SheetRequest =
	| { mode: 'add'; envelopeId: string }
	| { mode: 'edit'; expenseId: string }
	| { mode: 'value'; kind: 'income' | 'savings' | 'fixed' | 'envelope'; id?: string }
	| { mode: 'create'; type: 'fixed' | 'variable' };

export interface SheetMeta {
	icon: IconName;
	title: string;
	sub: string;
}

function createSheetStore() {
	const { subscribe, set } = writable<SheetRequest | null>(null);
	return {
		subscribe,
		open: (req: SheetRequest) => set(req),
		close: () => set(null)
	};
}

export const sheet = createSheetStore();

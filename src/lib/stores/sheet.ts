import { writable } from 'svelte/store';
import type { IconName } from '$lib/components/ui/Icon.svelte';
import type { CategoryType } from '$lib/types/database';

/**
 * The single bottom sheet of the app. Every amount is typed there.
 * - `add`   : new expense in an envelope (or "corriger le total")
 * - `edit`  : change / delete an existing expense
 * - `value` : set a monthly amount (salary, savings, fixed cost, exceptional payment, envelope budget)
 * - `create`: new envelope, fixed cost or exceptional payment (name + amount)
 */
export type SheetRequest =
	| { mode: 'add'; envelopeId: string }
	| { mode: 'edit'; expenseId: string }
	| {
			mode: 'value';
			kind: 'income' | 'savings' | 'fixed' | 'exceptional' | 'envelope';
			id?: string;
	  }
	| { mode: 'create'; type: CategoryType };

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

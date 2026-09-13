import type { IconName } from '$lib/components/ui/Icon.svelte';

export interface NavItem {
	href: string;
	label: string;
	icon: IconName;
	/** Page title shown in the header */
	title: string;
}

/** Single source of truth for navigation entries and page titles */
export const NAV_ITEMS: NavItem[] = [
	{ href: '/', label: 'Accueil', icon: 'home', title: 'Ce mois' },
	{ href: '/expenses', label: 'Transactions', icon: 'list', title: 'Transactions' },
	{ href: '/budgets', label: 'Budget', icon: 'wallet', title: 'Budget' },
	{ href: '/epargne', label: 'Épargne', icon: 'piggy', title: 'Épargne' },
	{ href: '/patrimoine', label: 'Patrimoine', icon: 'chart', title: 'Patrimoine' },
	{ href: '/bilan', label: 'Bilan', icon: 'clipboard', title: 'Bilan' }
];

export const SECONDARY_ITEMS: NavItem[] = [
	{ href: '/import', label: 'Importer', icon: 'upload', title: 'Importer un relevé' },
	{ href: '/parametres', label: 'Paramètres', icon: 'settings', title: 'Paramètres' },
	{ href: '/tutoriel', label: 'Tutoriel', icon: 'book', title: 'Tutoriel' }
];

/** Items shown in the mobile bottom bar (the middle slot is the import action) */
export const BOTTOM_ITEMS: NavItem[] = [NAV_ITEMS[0], NAV_ITEMS[1], NAV_ITEMS[2]];

export function isActive(href: string, pathname: string): boolean {
	if (href === '/') return pathname === '/';
	return pathname.startsWith(href);
}

export function pageTitle(pathname: string): string {
	const all = [...NAV_ITEMS, ...SECONDARY_ITEMS];
	return all.find((i) => isActive(i.href, pathname))?.title ?? 'Budget Planner';
}

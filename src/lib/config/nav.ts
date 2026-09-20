import type { IconName } from '$lib/components/ui/Icon.svelte';

export interface NavItem {
	href: '/' | '/historique' | '/mois';
	label: string;
	icon: IconName;
}

/** The three tabs of the app — single source of truth for navigation */
export const NAV_ITEMS: NavItem[] = [
	{ href: '/', label: 'Accueil', icon: 'home' },
	{ href: '/historique', label: 'Historique', icon: 'list' },
	{ href: '/mois', label: 'Mois', icon: 'calendar' }
];

export function isActive(href: string, pathname: string): boolean {
	if (href === '/') return pathname === '/';
	return pathname.startsWith(href);
}

import { ICON_NAMES, type IconName } from '$lib/components/ui/Icon.svelte';

/** Icons the user can pick for a category, in display order */
export const PICKABLE_ICONS: IconName[] = [
	'cart',
	'fork',
	'coffee',
	'glass',
	'ticket',
	'music',
	'bag',
	'gift',
	'heart',
	'dumbbell',
	'plane',
	'bus',
	'car',
	'home',
	'bolt',
	'wifi',
	'phone',
	'tv',
	'shield',
	'wrench',
	'book',
	'paw',
	'piggy',
	'wallet',
	'dots'
];

/** The icon stored on a category if valid, otherwise one inferred from its name */
export function categoryIcon(stored: string | null | undefined, name: string): IconName {
	if (stored && (ICON_NAMES as string[]).includes(stored)) return stored as IconName;
	return iconFor(name);
}

/**
 * Categories have no icon column: the icon is inferred from the name.
 * First matching keyword wins; `dots` is the fallback.
 */
const RULES: [RegExp, IconName][] = [
	[/course|aliment|supermarch|épicerie|epicerie|nourriture|food|bouffe|manger/i, 'cart'],
	[/resto|restau|banquet|repas|snack|livraison|uber|deliveroo/i, 'fork'],
	[/teuf|fête|fete|soirée|soiree|party|apéro|apero|\bbar\b|bière|biere|alcool/i, 'glass'],
	[/café|cafe|coffee/i, 'coffee'],
	[/musique|music|spotify|concert/i, 'music'],
	[/loisir|kiff|plaisir|ciné|cine|jeu|hobby|spectacle|sortie|fun/i, 'ticket'],
	[/bricol|outil|répar|repar|travaux/i, 'wrench'],
	[/shopping|vêt|vet|habit|mode|achat|amazon/i, 'bag'],
	[/santé|sante|pharma|médec|medec|doc|soin|mutuelle/i, 'heart'],
	[/loyer|logement|appart|maison|hypoth|immo/i, 'home'],
	[/élec|elec|énergie|energie|gaz|eau|chauff|engie|luminus/i, 'bolt'],
	[/internet|wifi|box|proximus|telenet|voo|fibre/i, 'wifi'],
	[/assur|ethias|axa/i, 'shield'],
	[/transport|train|bus|tram|stib|sncb|tec|de lijn|mobilité|mobilite/i, 'bus'],
	[/voiture|auto|essence|carbur|parking|péage|peage/i, 'car'],
	[/télé|tele|phone|gsm|mobile|orange|base|forfait/i, 'phone'],
	[/épargne|epargne|éparg|investis|placement/i, 'piggy'],
	[/netflix|spotify|abonnement|abo|stream|disney|tv/i, 'tv'],
	[/cadeau|gift|anniv|noël|noel/i, 'gift'],
	[/voyage|vacance|avion|travel|trip|hôtel|hotel/i, 'plane'],
	[/salle|fitness|gym|muscu|basic/i, 'dumbbell'],
	[/livre|étude|etude|cours|école|ecole|formation/i, 'book'],
	[/chat|chien|animal|véto|veto/i, 'paw'],
	[/salaire|revenu|paie/i, 'wallet']
];

export function iconFor(name: string): IconName {
	for (const [re, icon] of RULES) if (re.test(name)) return icon;
	return 'dots';
}

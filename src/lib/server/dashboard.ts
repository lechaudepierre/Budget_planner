import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { IconName } from '$lib/components/ui/Icon.svelte';

type Supabase = SupabaseClient<Database>;

export interface DashboardCategory {
	id: string;
	name: string;
	color: string;
	type: 'fixed' | 'variable';
	allocated: number;
	spent: number;
}

export interface DashboardTodo {
	id: string;
	icon: IconName;
	text: string;
	detail?: string;
	ctaLabel: string;
	href: string;
	tone: 'sage' | 'amber' | 'terracotta';
}

export interface DashboardData {
	period: {
		month: string;
		startDate: string;
		/** Last day counted for expenses (open periods run until today) */
		endDate: string;
		daysLeft: number;
		daysTotal: number;
		/** Days past the expected end of an open period (0 when on time) */
		overdueDays: number;
		label: string;
	} | null;
	income: number;
	variable: {
		categories: DashboardCategory[];
		allocated: number;
		spent: number;
		remaining: number;
	};
	fixed: { categories: DashboardCategory[]; allocated: number; spent: number };
	savings: {
		allocatedThisMonth: number;
		goals: { id: string; name: string; current: number; target: number }[];
		totalSaved: number;
		totalTarget: number;
	};
	accounts: {
		id: string;
		name: string;
		balance: number;
		accountType: string | null;
		balanceSource: string;
		lastImportAt: string | null;
	}[];
	netWorth: number;
	recent: {
		id: string;
		date: string;
		description: string | null;
		merchant: string | null;
		amount: number;
		bankAmount: number | null;
		isPending: boolean;
		source: string;
		category: { name: string; color: string } | null;
	}[];
	todos: DashboardTodo[];
}

const DAY = 86_400_000;

/**
 * Everything the home page needs, fetched in parallel with the server client.
 */
export async function loadDashboard(supabase: Supabase, userId: string): Promise<DashboardData> {
	const { data: activeBudget } = await supabase
		.from('monthly_budgets')
		.select('id, month, income, start_date, end_date')
		.eq('user_id', userId)
		.eq('is_archived', false)
		.maybeSingle();

	const today = new Date().toISOString().slice(0, 10);
	const period = activeBudget
		? describePeriod(activeBudget.start_date, activeBudget.end_date, today)
		: null;

	const [
		categoriesRes,
		allocationsRes,
		expensesRes,
		savingsRes,
		goalsRes,
		accountsRes,
		recentRes,
		uncategorisedRes,
		pendingRes
	] = await Promise.all([
		supabase
			.from('budget_categories')
			.select('id, name, color, type, sort_order')
			.eq('user_id', userId)
			.order('sort_order'),
		activeBudget
			? supabase
					.from('category_budgets')
					.select('category_id, amount')
					.eq('month', activeBudget.month)
			: Promise.resolve({ data: [] as { category_id: string; amount: number }[] }),
		period
			? supabase
					.from('expenses')
					.select('category_id, amount')
					.eq('user_id', userId)
					.gte('date', period.startDate)
					.lte('date', period.endDate)
			: Promise.resolve({ data: [] as { category_id: string | null; amount: number }[] }),
		activeBudget
			? supabase
					.from('monthly_savings_allocations')
					.select('allocated_amount')
					.eq('user_id', userId)
					.eq('month', activeBudget.month)
			: Promise.resolve({ data: [] as { allocated_amount: number }[] }),
		supabase
			.from('savings_goals')
			.select('id, name, current_amount, target_amount')
			.eq('user_id', userId)
			.order('created_at'),
		supabase
			.from('accounts')
			.select('id, name, balance, account_type, balance_source, last_import_at')
			.eq('user_id', userId)
			.order('created_at'),
		supabase
			.from('expenses')
			.select(
				'id, date, description, merchant, amount, bank_amount, is_pending, source, category:budget_categories(name, color)'
			)
			.eq('user_id', userId)
			.order('date', { ascending: false })
			.order('created_at', { ascending: false })
			.limit(6),
		period
			? supabase
					.from('expenses')
					.select('id', { count: 'exact', head: true })
					.eq('user_id', userId)
					.is('category_id', null)
					.gte('date', period.startDate)
					.lte('date', period.endDate)
			: Promise.resolve({ count: 0 }),
		supabase
			.from('expenses')
			.select('id', { count: 'exact', head: true })
			.eq('user_id', userId)
			.eq('is_pending', true)
			.lte('date', new Date(Date.now() - 7 * DAY).toISOString().slice(0, 10))
	]);

	const allocated = new Map(
		(allocationsRes.data ?? []).map((a) => [a.category_id, Number(a.amount)])
	);
	const spent = new Map<string, number>();
	for (const e of expensesRes.data ?? []) {
		if (!e.category_id) continue;
		spent.set(e.category_id, (spent.get(e.category_id) ?? 0) + Number(e.amount));
	}

	const categories: DashboardCategory[] = (categoriesRes.data ?? []).map((c) => ({
		id: c.id,
		name: c.name,
		color: c.color,
		type: c.type,
		allocated: allocated.get(c.id) ?? 0,
		spent: spent.get(c.id) ?? 0
	}));

	const variableCats = categories.filter((c) => c.type === 'variable');
	const fixedCats = categories.filter((c) => c.type === 'fixed');
	const sum = (list: DashboardCategory[], key: 'allocated' | 'spent') =>
		list.reduce((s, c) => s + c[key], 0);

	const variable = {
		categories: variableCats.sort((a, b) => ratio(b) - ratio(a)),
		allocated: sum(variableCats, 'allocated'),
		spent: sum(variableCats, 'spent'),
		remaining: sum(variableCats, 'allocated') - sum(variableCats, 'spent')
	};
	const fixed = {
		categories: fixedCats,
		allocated: sum(fixedCats, 'allocated'),
		spent: sum(fixedCats, 'spent')
	};

	const goals = (goalsRes.data ?? []).map((g) => ({
		id: g.id,
		name: g.name,
		current: Number(g.current_amount),
		target: Number(g.target_amount)
	}));
	const savings = {
		allocatedThisMonth: (savingsRes.data ?? []).reduce((s, a) => s + Number(a.allocated_amount), 0),
		goals,
		totalSaved: goals.reduce((s, g) => s + g.current, 0),
		totalTarget: goals.reduce((s, g) => s + g.target, 0)
	};

	const accounts = (accountsRes.data ?? []).map((a) => ({
		id: a.id,
		name: a.name,
		balance: Number(a.balance),
		accountType: a.account_type,
		balanceSource: a.balance_source,
		lastImportAt: a.last_import_at
	}));

	const recent = (recentRes.data ?? []).map((e) => ({
		id: e.id,
		date: e.date,
		description: e.description,
		merchant: e.merchant,
		amount: Number(e.amount),
		bankAmount: e.bank_amount === null ? null : Number(e.bank_amount),
		isPending: e.is_pending,
		source: e.source,
		category: Array.isArray(e.category) ? (e.category[0] ?? null) : e.category
	}));

	const todos = buildTodos({
		overdueDays: period?.overdueDays ?? 0,
		hasBudget: Boolean(activeBudget),
		hasAllocations: allocated.size > 0,
		hasCategories: categories.length > 0,
		lastImportAt: accounts.reduce<string | null>(
			(m, a) => (a.lastImportAt && (!m || a.lastImportAt > m) ? a.lastImportAt : m),
			null
		),
		uncategorised: uncategorisedRes.count ?? 0,
		pendingOld: pendingRes.count ?? 0
	});

	return {
		period,
		income: Number(activeBudget?.income ?? 0),
		variable,
		fixed,
		savings,
		accounts,
		netWorth: accounts.reduce((s, a) => s + a.balance, 0),
		recent,
		todos
	};
}

function ratio(c: DashboardCategory): number {
	return c.allocated > 0 ? c.spent / c.allocated : c.spent > 0 ? 2 : 0;
}

function describePeriod(
	startDate: string,
	endDate: string | null,
	today: string
): NonNullable<DashboardData['period']> {
	const start = new Date(startDate + 'T00:00:00Z');
	let end: Date;
	if (endDate) {
		end = new Date(endDate + 'T00:00:00Z');
	} else {
		end = new Date(start);
		end.setUTCMonth(end.getUTCMonth() + 1);
		end.setUTCDate(end.getUTCDate() - 1);
	}
	const todayDate = new Date(today + 'T00:00:00Z');
	const daysTotal = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY) + 1);
	const daysLeft = Math.max(0, Math.round((end.getTime() - todayDate.getTime()) / DAY) + 1);
	const overdueDays =
		!endDate && todayDate > end ? Math.round((todayDate.getTime() - end.getTime()) / DAY) : 0;
	// An open period that ran past its expected end keeps counting expenses until today
	const queryEnd = overdueDays > 0 ? todayDate : end;
	const fmt = (d: Date) =>
		d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
	return {
		month: startDate.slice(0, 7),
		startDate,
		endDate: queryEnd.toISOString().slice(0, 10),
		daysLeft: Math.min(daysLeft, daysTotal),
		daysTotal,
		overdueDays,
		label: `${fmt(start)} → ${fmt(end)}`
	};
}

function buildTodos(input: {
	overdueDays: number;
	hasBudget: boolean;
	hasAllocations: boolean;
	hasCategories: boolean;
	lastImportAt: string | null;
	uncategorised: number;
	pendingOld: number;
}): DashboardTodo[] {
	const todos: DashboardTodo[] = [];

	if (input.overdueDays > 0) {
		todos.push({
			id: 'overdue',
			icon: 'calendar',
			text: `Période dépassée de ${input.overdueDays} jour${input.overdueDays > 1 ? 's' : ''}`,
			detail: 'Clôture-la pour figer le bilan et démarrer la suivante avec tes budgets recopiés.',
			ctaLabel: 'Clôturer',
			href: '/bilan',
			tone: 'amber'
		});
	}

	if (!input.hasCategories) {
		todos.push({
			id: 'categories',
			icon: 'tag',
			text: 'Crée tes catégories de budget',
			detail: 'Courses, loyer, sorties… elles servent à classer chaque dépense.',
			ctaLabel: 'Créer',
			href: '/budgets',
			tone: 'sage'
		});
	} else if (!input.hasBudget || !input.hasAllocations) {
		todos.push({
			id: 'allocations',
			icon: 'wallet',
			text: 'Aucun budget défini pour cette période',
			detail: 'Fixe un montant par enveloppe, ou reprends ceux du mois dernier.',
			ctaLabel: 'Définir',
			href: '/budgets',
			tone: 'amber'
		});
	}

	if (!input.lastImportAt) {
		todos.push({
			id: 'first-import',
			icon: 'upload',
			text: 'Importe ton premier relevé bancaire',
			detail: 'BNP ou Revolut, en CSV — le tri se fait tout seul.',
			ctaLabel: 'Importer',
			href: '/import',
			tone: 'sage'
		});
	} else {
		const days = Math.floor((Date.now() - Date.parse(input.lastImportAt)) / DAY);
		if (days >= 10) {
			todos.push({
				id: 'stale-import',
				icon: 'upload',
				text: `Dernier relevé importé il y a ${days} jours`,
				detail: 'Tes enveloppes ne reflètent plus tes dépenses récentes.',
				ctaLabel: 'Importer',
				href: '/import',
				tone: 'amber'
			});
		}
	}

	if (input.uncategorised > 0) {
		todos.push({
			id: 'uncategorised',
			icon: 'tag',
			text: `${input.uncategorised} dépense${input.uncategorised > 1 ? 's' : ''} sans catégorie`,
			detail: "Elles n'entrent dans aucune enveloppe tant qu'elles ne sont pas classées.",
			ctaLabel: 'Classer',
			href: '/expenses',
			tone: 'terracotta'
		});
	}

	if (input.pendingOld > 0) {
		todos.push({
			id: 'pending',
			icon: 'clock',
			text: `${input.pendingOld} ligne${input.pendingOld > 1 ? 's' : ''} en attente depuis plus de 7 jours`,
			detail: 'Réimporte un relevé récent pour les confirmer ou les retirer.',
			ctaLabel: 'Importer',
			href: '/import',
			tone: 'sage'
		});
	}

	return todos;
}

import { supabase } from '$lib/supabase';
import type { CategoryRule } from '$lib/types/database';

export interface CategoryRuleWithCategory extends CategoryRule {
	category: { id: string; name: string; color: string } | null;
}

/** Learned import rules, most used first */
export async function getRules(): Promise<{
	data: CategoryRuleWithCategory[];
	error: Error | null;
}> {
	const {
		data: { user }
	} = await supabase.auth.getUser();
	if (!user) return { data: [], error: new Error('Non authentifié') };

	const { data, error } = await supabase
		.from('category_rules')
		.select('*, category:budget_categories(id, name, color)')
		.eq('user_id', user.id)
		.order('hits', { ascending: false })
		.order('created_at', { ascending: false });

	return { data: (data as CategoryRuleWithCategory[] | null) ?? [], error };
}

export async function deleteRule(id: string): Promise<{ error: Error | null }> {
	const { error } = await supabase.from('category_rules').delete().eq('id', id);
	return { error };
}

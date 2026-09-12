import type { PageServerLoad } from './$types';
import { isAiConfigured } from '$lib/server/ai/categorize';

// Only tells the UI whether a key exists — the key itself never leaves the server
export const load: PageServerLoad = async () => {
	return { aiConfigured: isAiConfigured() };
};

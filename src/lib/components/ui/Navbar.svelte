<script lang="ts">
	import { page } from '$app/stores';

	const mainNavItems = [
		{ href: '/', label: 'Dashboard', icon: 'dashboard' },
		{ href: '/expenses', label: 'Transactions', icon: 'dollar' },
		{ href: '/budgets', label: 'Budgets', icon: 'budget' },
		{ href: '/patrimoine', label: 'Patrimoine', icon: 'chart' }
	];

	const goalItems = [
		{ href: '/epargne', label: 'Épargne', icon: 'savings' },
		{ href: '/bilan', label: 'Bilan', icon: 'bilan' }
	];

	function isActive(href: string, pathname: string): boolean {
		if (href === '/') return pathname === '/';
		return pathname.startsWith(href);
	}
</script>

<nav class="fixed w-60 h-full bg-cotton border-r border-sand flex flex-col z-10">
	<!-- Logo -->
	<div class="flex items-center gap-3 px-4 py-6 mb-4">
		<div class="w-8 h-8 bg-sage rounded-lg flex items-center justify-center">
			<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10" />
				<path d="M12 6v6l4 2" />
			</svg>
		</div>
		<span class="text-base font-semibold text-coffee-900">Budget_planner</span>
	</div>

	<!-- Main Nav items -->
	<ul class="space-y-1 px-4 flex-1">
		{#each mainNavItems as item}
			<li>
				<a
					href={item.href}
					class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-sm font-medium
						{isActive(item.href, $page.url.pathname)
						? 'bg-sage text-white'
						: 'text-stone-500 hover:bg-oat hover:text-coffee-900'}"
				>
					{#if item.icon === 'dashboard'}
						<svg class="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="3" y="3" width="7" height="7" rx="1" />
							<rect x="14" y="3" width="7" height="7" rx="1" />
							<rect x="3" y="14" width="7" height="7" rx="1" />
							<rect x="14" y="14" width="7" height="7" rx="1" />
						</svg>
					{:else if item.icon === 'dollar'}
						<svg class="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
						</svg>
					{:else if item.icon === 'budget'}
						<svg class="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="10" />
							<path d="M12 16v-4M12 8h.01" />
						</svg>
					{:else if item.icon === 'chart'}
						<svg class="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
						</svg>
					{/if}
					{item.label}
				</a>
			</li>
		{/each}

		<!-- Objectifs Section -->
		<li class="pt-6 mt-4 border-t border-sand">
			<span class="px-4 text-xs uppercase tracking-wider text-stone-500 font-medium">Objectifs</span>
			<ul class="mt-2 space-y-1">
				{#each goalItems as item}
					<li>
						<a
							href={item.href}
							class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-sm font-medium
								{isActive(item.href, $page.url.pathname)
								? 'bg-sage text-white'
								: 'text-stone-500 hover:bg-oat hover:text-coffee-900'}"
						>
							{#if item.icon === 'savings'}
								<svg class="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" />
									<path d="M2 9v1c0 1.1.9 2 2 2h1" />
								</svg>
							{:else if item.icon === 'bilan'}
								<svg class="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
									<rect x="9" y="3" width="6" height="4" rx="1" />
									<path d="M9 12h6" />
									<path d="M9 16h6" />
								</svg>
							{/if}
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</li>
	</ul>

	<!-- Bottom Section -->
	<div class="border-t border-sand mx-4"></div>
	<ul class="px-4 py-4 space-y-1">
		<li>
			<a
				href="/tutoriel"
				class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-sm font-medium
					{isActive('/tutoriel', $page.url.pathname)
					? 'bg-sage text-white'
					: 'text-stone-500 hover:bg-oat hover:text-coffee-900'}"
			>
				<svg class="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
					<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
				</svg>
				Tutoriel
			</a>
		</li>
		<li>
			<a
				href="/parametres"
				class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-sm font-medium
					{isActive('/parametres', $page.url.pathname)
					? 'bg-sage text-white'
					: 'text-stone-500 hover:bg-oat hover:text-coffee-900'}"
			>
				<svg class="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="3" />
					<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
				</svg>
				Paramètres
			</a>
		</li>
		<li>
			<form method="POST" action="/auth/logout">
				<button
					type="submit"
					class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-500 hover:bg-oat hover:text-coffee-900 transition-all duration-150"
				>
					<svg class="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
						<polyline points="16 17 21 12 16 7" />
						<line x1="21" y1="12" x2="9" y2="12" />
					</svg>
					Déconnexion
				</button>
			</form>
		</li>
	</ul>
</nav>

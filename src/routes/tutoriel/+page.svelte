<script lang="ts">
	let expandedStep = $state<string | null>(null);

	function toggle(id: string) {
		expandedStep = expandedStep === id ? null : id;
	}

	const steps = [
		{
			id: 'patrimoine',
			title: 'Patrimoine',
			subtitle: 'Commencez par recenser vos comptes',
			link: '/patrimoine',
			points: [
				'Ajoutez tous vos comptes bancaires, livrets, assurances-vie et investissements.',
				'Pour chaque compte, renseignez son type (courant, épargne, investissement, assurance, autre) et son solde actuel.',
				'Le total de vos comptes forme votre patrimoine net — visible ici et sur le Dashboard.'
			]
		},
		{
			id: 'budgets',
			title: 'Budgets',
			subtitle: 'Définissez vos revenus et enveloppes',
			link: '/budgets',
			points: [
				'Commencez par renseigner vos sources de revenus mensuels (salaire, freelance, etc.).',
				'Créez vos catégories de dépenses : charges fixes (loyer, assurance, abonnements) et variables (courses, sorties, shopping).',
				'Attribuez un montant à chaque catégorie. Ce qui n\'est pas alloué devient votre épargne disponible.',
				'Astuce : activez les "indices du mois précédent" pour voir combien vous avez réellement dépensé le mois d\'avant.'
			]
		},
		{
			id: 'transactions',
			title: 'Transactions',
			subtitle: 'Enregistrez vos dépenses au quotidien',
			link: '/expenses',
			points: [
				'Ajoutez vos dépenses directement dans la ligne en haut de la liste : date, montant, catégorie, compte et description.',
				'Cliquez sur une transaction pour la modifier en ligne, ou supprimez-la.',
				'Filtrez par catégorie ou par période (ce mois, le mois dernier, 3 derniers mois, ou dates personnalisées).',
				'C\'est la page à utiliser au quotidien — plus vous êtes régulier, plus votre budget sera précis.'
			]
		},
		{
			id: 'dashboard',
			title: 'Dashboard',
			subtitle: 'Votre vue d\'ensemble financière',
			link: '/',
			points: [
				'Le Dashboard se met à jour automatiquement et vous montre l\'essentiel en un coup d\'œil.',
				'Patrimoine total, budget restant du mois, répartition par catégorie, et état de votre épargne.',
				'Cliquez sur n\'importe quelle catégorie pour voir le détail des transactions associées.',
				'Les couleurs vous alertent : vert si tout va bien, orange si vous approchez de la limite, rouge si vous avez dépassé.'
			]
		},
		{
			id: 'epargne',
			title: 'Épargne',
			subtitle: 'Donnez un but à chaque euro épargné',
			link: '/epargne',
			points: [
				'L\'argent non alloué dans vos budgets devient votre "épargne disponible" du mois.',
				'Créez des objectifs d\'épargne (vacances, fonds d\'urgence, projet immobilier…) avec un montant cible.',
				'Chaque mois, répartissez votre épargne disponible entre vos objectifs et vos comptes patrimoine.',
				'Quand vous êtes prêt, transférez les allocations pour les comptabiliser définitivement.',
				'Les jauges de progression vous montrent où vous en êtes pour chaque objectif.'
			]
		},
		{
			id: 'bilan',
			title: 'Bilan',
			subtitle: 'Clôturez et analysez chaque mois',
			link: '/bilan',
			points: [
				'En fin de mois, consultez votre bilan : revenus, dépenses totales, épargne réalisée.',
				'Comparez catégorie par catégorie ce que vous aviez budgété vs ce que vous avez dépensé.',
				'Archivez le mois pour démarrer une nouvelle période budgétaire.',
				'L\'archivage finalise vos allocations d\'épargne et crée un nouveau budget pour le mois suivant.',
				'Naviguez dans l\'historique pour revoir vos bilans passés.'
			]
		}
	];
</script>

<div class="space-y-6">
	<!-- Hero Card -->
	<div class="card bg-gradient-to-br from-sage to-accent text-white p-6 rounded-2xl shadow-lg">
		<div class="flex justify-between items-start">
			<div>
				<p class="text-white/80 text-sm font-medium mb-1">Guide de démarrage</p>
				<p class="text-3xl font-bold">Budget Planner</p>
				<p class="text-white/70 text-sm mt-3">
					6 étapes pour prendre en main votre budget. Suivez-les dans l'ordre pour bien démarrer.
				</p>
			</div>
			<div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
				<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
					<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
				</svg>
			</div>
		</div>
		<div class="flex items-center mt-6">
			{#each steps as step, i}
				{#if i > 0}
					<svg class="w-4 h-4 text-white/40 flex-shrink-0 mx-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<path d="M9 18l6-6-6-6" />
					</svg>
				{/if}
				<span class="flex-1 text-center px-2 py-1.5 bg-white/15 rounded-full text-sm font-medium text-white/90">{step.title}</span>
			{/each}
		</div>
	</div>

	<!-- Étapes détaillées -->
	<div>
		<h2 class="text-lg font-semibold text-coffee-900 mb-3">Détail des étapes</h2>
		<div class="space-y-3">
			{#each steps as step, i}
				<div class="bg-white rounded-xl shadow-sm overflow-hidden">
					<button
						onclick={() => toggle(step.id)}
						class="w-full flex items-center gap-4 p-5 text-left hover:bg-oat/30 transition-colors"
					>
						<div class="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center flex-shrink-0">
							<span class="text-sage font-bold text-sm">{i + 1}</span>
						</div>
						<div class="flex-1 min-w-0">
							<p class="font-medium text-coffee-900">{step.title}</p>
							<p class="text-sm text-stone-500">{step.subtitle}</p>
						</div>
						<svg
							class="w-5 h-5 text-stone-400 flex-shrink-0 transition-transform duration-200 {expandedStep === step.id ? 'rotate-180' : ''}"
							viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
						>
							<path d="M6 9l6 6 6-6" />
						</svg>
					</button>

					{#if expandedStep === step.id}
						<div class="px-5 pb-5 border-t border-sand">
							<ul class="mt-4 space-y-3">
								{#each step.points as point}
									<li class="flex items-start gap-3 text-sm text-stone-600">
										<svg class="w-4 h-4 text-sage flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
											<path d="M20 6L9 17l-5-5" />
										</svg>
										<span>{point}</span>
									</li>
								{/each}
							</ul>
							<a
								href={step.link}
								class="inline-flex items-center gap-2 mt-5 text-sm font-medium text-sage hover:text-sage-dark transition-colors"
							>
								Aller à {step.title}
								<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M5 12h14M12 5l7 7-7 7" />
								</svg>
							</a>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Conseils -->
	<div class="bg-white rounded-xl p-6 shadow-sm">
		<h2 class="text-lg font-semibold text-coffee-900 mb-4">Conseils pour bien démarrer</h2>
		<div class="space-y-3">
			<div class="flex items-start gap-3">
				<div class="w-8 h-8 bg-sage/10 rounded-lg flex items-center justify-center flex-shrink-0">
					<svg class="w-4 h-4 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
					</svg>
				</div>
				<div>
					<p class="text-sm font-medium text-coffee-900">Soyez régulier</p>
					<p class="text-sm text-stone-500">Notez vos dépenses chaque jour ou tous les 2-3 jours pour ne rien oublier.</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<div class="w-8 h-8 bg-sage/10 rounded-lg flex items-center justify-center flex-shrink-0">
					<svg class="w-4 h-4 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 20V10M18 20V4M6 20v-4" />
					</svg>
				</div>
				<div>
					<p class="text-sm font-medium text-coffee-900">Ajustez au fur et à mesure</p>
					<p class="text-sm text-stone-500">Pas besoin d'être parfait au début — vos enveloppes budgétaires s'affineront avec le temps.</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<div class="w-8 h-8 bg-sage/10 rounded-lg flex items-center justify-center flex-shrink-0">
					<svg class="w-4 h-4 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
						<rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 14l2 2 4-4" />
					</svg>
				</div>
				<div>
					<p class="text-sm font-medium text-coffee-900">Archivez chaque mois</p>
					<p class="text-sm text-stone-500">Clôturez votre période dès que vous êtes prêt pour repartir sur une base propre.</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<div class="w-8 h-8 bg-sage/10 rounded-lg flex items-center justify-center flex-shrink-0">
					<svg class="w-4 h-4 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
						<rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
					</svg>
				</div>
				<div>
					<p class="text-sm font-medium text-coffee-900">Consultez le Dashboard</p>
					<p class="text-sm text-stone-500">Un coup d'œil suffit pour savoir où vous en êtes — c'est votre meilleur allié au quotidien.</p>
				</div>
			</div>
		</div>
	</div>
</div>

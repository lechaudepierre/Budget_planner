<script lang="ts">
	interface Props {
		value: string; // YYYY-MM format
		id?: string;
		placeholder?: string;
		class?: string;
		disabled?: boolean;
		onchange?: (value: string) => void;
	}

	let {
		value = $bindable(''),
		id = '',
		placeholder = 'Sélectionner un mois',
		class: className = '',
		disabled = false,
		onchange
	}: Props = $props();

	let showPicker = $state(false);
	let pickerRef = $state<HTMLDivElement | null>(null);
	let inputRef = $state<HTMLDivElement | null>(null);

	// Parse current value or use current date
	let selectedYear = $state(value ? parseInt(value.split('-')[0]) : new Date().getFullYear());
	let selectedMonth = $state(value ? parseInt(value.split('-')[1]) - 1 : new Date().getMonth());

	// Update internal state when value prop changes
	$effect(() => {
		if (value) {
			const [year, month] = value.split('-');
			selectedYear = parseInt(year);
			selectedMonth = parseInt(month) - 1;
		}
	});

	const months = [
		'Janvier', 'Février', 'Mars', 'Avril',
		'Mai', 'Juin', 'Juillet', 'Août',
		'Septembre', 'Octobre', 'Novembre', 'Décembre'
	];

	const shortMonths = [
		'Jan', 'Fév', 'Mar', 'Avr',
		'Mai', 'Juin', 'Juil', 'Août',
		'Sept', 'Oct', 'Nov', 'Déc'
	];

	// Format display value
	let displayValue = $derived(() => {
		if (!value) return '';
		const [year, month] = value.split('-');
		return `${months[parseInt(month) - 1]} ${year}`;
	});

	function selectMonth(monthIndex: number) {
		selectedMonth = monthIndex;
		const newValue = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
		value = newValue;
		onchange?.(newValue);
		showPicker = false;
	}

	function previousYear() {
		selectedYear--;
	}

	function nextYear() {
		selectedYear++;
	}

	function handleClickOutside(event: MouseEvent) {
		if (
			pickerRef &&
			inputRef &&
			!pickerRef.contains(event.target as Node) &&
			!inputRef.contains(event.target as Node)
		) {
			showPicker = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			showPicker = false;
		}
	}

	function togglePicker() {
		if (!disabled) {
			showPicker = !showPicker;
		}
	}

	$effect(() => {
		if (showPicker) {
			document.addEventListener('click', handleClickOutside);
			document.addEventListener('keydown', handleKeydown);
		}
		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	// Check if a month is the currently selected one
	function isSelected(monthIndex: number): boolean {
		if (!value) return false;
		const [year, month] = value.split('-');
		return parseInt(year) === selectedYear && parseInt(month) - 1 === monthIndex;
	}

	// Check if a month is the current month
	function isCurrent(monthIndex: number): boolean {
		const now = new Date();
		return now.getFullYear() === selectedYear && now.getMonth() === monthIndex;
	}
</script>

<div class="relative">
	<!-- Input Display -->
	<div
		bind:this={inputRef}
		role="button"
		tabindex={disabled ? -1 : 0}
		{id}
		class="w-full px-4 py-3 border rounded-xl bg-cotton text-coffee-900 cursor-pointer select-none flex items-center justify-between transition-all {className} {showPicker ? 'border-sage ring-2 ring-sage/50' : 'border-sand'} {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
		onclick={togglePicker}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				togglePicker();
			}
		}}
	>
		<span class:text-stone-400={!value}>
			{displayValue() || placeholder}
		</span>
		<svg
			class="w-5 h-5 text-stone-400 transition-transform"
			class:rotate-180={showPicker}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</div>

	<!-- Dropdown Picker -->
	{#if showPicker}
		<div
			bind:this={pickerRef}
			class="absolute top-full left-0 right-0 mt-2 bg-white border border-sand rounded-xl shadow-lg z-50 overflow-hidden animate-dropdown"
		>
			<!-- Year Navigation -->
			<div class="flex items-center justify-between px-4 py-3 bg-oat border-b border-sand">
				<button
					type="button"
					class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sand transition-colors text-stone-600"
					onclick={previousYear}
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<span class="font-semibold text-coffee-900 text-lg">{selectedYear}</span>
				<button
					type="button"
					class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sand transition-colors text-stone-600"
					onclick={nextYear}
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</button>
			</div>

			<!-- Month Grid -->
			<div class="grid grid-cols-3 gap-2 p-3">
				{#each shortMonths as month, index}
					<button
						type="button"
						class="px-3 py-2.5 rounded-lg text-sm font-medium transition-all {isSelected(index) ? 'bg-sage text-white' : 'hover:bg-oat text-coffee-900'} {isCurrent(index) && !isSelected(index) ? 'ring-2 ring-sage/30' : ''}"
						onclick={() => selectMonth(index)}
					>
						{month}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	@keyframes dropdown {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-dropdown {
		animation: dropdown 0.15s ease-out;
	}
</style>

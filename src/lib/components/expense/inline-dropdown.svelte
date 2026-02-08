<script lang="ts">
	import { onMount } from 'svelte';

	interface DropdownItem {
		id: string;
		name: string;
		color?: string;
	}

	let {
		items,
		selected = null,
		placeholder = 'Sélectionner...',
		onSelect,
		error = false,
		disabled = false,
		onEnterClosed
	}: {
		items: DropdownItem[];
		selected: string | null;
		placeholder?: string;
		onSelect: (item: DropdownItem) => void;
		error?: boolean;
		disabled?: boolean;
		onEnterClosed?: () => void;
	} = $props();

	let isOpen = $state(false);
	let highlightedIndex = $state(-1);
	let triggerEl: HTMLButtonElement;
	let menuEl: HTMLDivElement;
	let dropUp = $state(false);
	let menuStyle = $state('');
	let typeAheadBuffer = $state('');
	let typeAheadTimer: ReturnType<typeof setTimeout> | null = null;

	const selectedItem = $derived(items.find((item) => item.id === selected) ?? null);

	function open() {
		if (disabled) return;
		const rect = triggerEl.getBoundingClientRect();
		const spaceBelow = window.innerHeight - rect.bottom;
		dropUp = spaceBelow < 200;

		// Position the fixed menu relative to the trigger
		if (dropUp) {
			menuStyle = `bottom: ${window.innerHeight - rect.top}px; left: ${rect.left}px; width: ${rect.width}px;`;
		} else {
			menuStyle = `top: ${rect.bottom}px; left: ${rect.left}px; width: ${rect.width}px;`;
		}

		isOpen = true;
		highlightedIndex = selected ? items.findIndex((item) => item.id === selected) : 0;
	}

	function close() {
		isOpen = false;
		highlightedIndex = -1;
		typeAheadBuffer = '';
	}

	function toggle() {
		if (isOpen) {
			close();
		} else {
			open();
		}
	}

	function selectItem(item: DropdownItem) {
		onSelect(item);
		close();
		triggerEl.focus();
	}

	function handleTriggerKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'Enter':
				if (isOpen && highlightedIndex >= 0 && highlightedIndex < items.length) {
					e.preventDefault();
					e.stopPropagation();
					selectItem(items[highlightedIndex]);
				} else if (!isOpen && onEnterClosed) {
					e.preventDefault();
					onEnterClosed();
				} else {
					e.preventDefault();
					toggle();
				}
				break;
			case ' ':
				e.preventDefault();
				toggle();
				break;
			case 'ArrowDown':
				e.preventDefault();
				if (!isOpen) open();
				else moveHighlight(1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				if (!isOpen) open();
				else moveHighlight(-1);
				break;
			case 'Escape':
				if (isOpen) {
					e.preventDefault();
					e.stopPropagation();
					close();
				}
				break;
			default:
				// Type-ahead
				if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
					e.preventDefault();
					handleTypeAhead(e.key);
				}
		}
	}

	function handleMenuKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				moveHighlight(1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				moveHighlight(-1);
				break;
			case 'Enter':
				e.preventDefault();
				if (highlightedIndex >= 0 && highlightedIndex < items.length) {
					selectItem(items[highlightedIndex]);
				}
				break;
			case 'Escape':
				e.preventDefault();
				close();
				triggerEl.focus();
				break;
			default:
				if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
					e.preventDefault();
					handleTypeAhead(e.key);
				}
		}
	}

	function moveHighlight(direction: number) {
		const newIndex = highlightedIndex + direction;
		if (newIndex >= 0 && newIndex < items.length) {
			highlightedIndex = newIndex;
		}
	}

	function handleTypeAhead(char: string) {
		if (typeAheadTimer) clearTimeout(typeAheadTimer);

		typeAheadBuffer += char.toLowerCase();

		typeAheadTimer = setTimeout(() => {
			typeAheadBuffer = '';
		}, 500);

		const matchIndex = items.findIndex((item) =>
			item.name.toLowerCase().startsWith(typeAheadBuffer)
		);

		if (matchIndex >= 0) {
			highlightedIndex = matchIndex;
			if (!isOpen) open();
		}
	}

	function handleClickOutside(e: MouseEvent) {
		if (
			isOpen &&
			triggerEl &&
			menuEl &&
			!triggerEl.contains(e.target as Node) &&
			!menuEl.contains(e.target as Node)
		) {
			close();
		}
	}

	function handleScroll() {
		if (isOpen) close();
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		// Close on scroll since menu is fixed-positioned
		const scrollParent = triggerEl.closest('.overflow-y-auto');
		scrollParent?.addEventListener('scroll', handleScroll);
		return () => {
			document.removeEventListener('click', handleClickOutside);
			scrollParent?.removeEventListener('scroll', handleScroll);
			if (typeAheadTimer) clearTimeout(typeAheadTimer);
		};
	});
</script>

<div class="relative">
	<!-- Trigger -->
	<button
		bind:this={triggerEl}
		type="button"
		class="w-full flex items-center justify-between gap-1 px-2 py-1 text-sm rounded-lg border transition-all duration-150 outline-none
			{error ? 'border-terracotta' : 'border-transparent hover:border-sand'}
			{isOpen ? 'ring-2 ring-[#639A88]/30' : ''}
			focus:ring-2 focus:ring-[#639A88]/30"
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		aria-label={placeholder}
		{disabled}
		onclick={toggle}
		onkeydown={handleTriggerKeydown}
	>
		<span class="flex items-center gap-2 min-w-0 truncate">
			{#if selectedItem}
				{#if selectedItem.color}
					<span
						class="w-2.5 h-2.5 rounded-full shrink-0"
						style="background-color: {selectedItem.color}"
					></span>
				{/if}
				<span class="text-coffee-900 truncate">{selectedItem.name}</span>
			{:else}
				<span class="text-stone-500">{placeholder}</span>
			{/if}
		</span>
		<svg
			class="w-4 h-4 text-stone-400 shrink-0 transition-transform duration-150 {isOpen ? 'rotate-180' : ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div
			bind:this={menuEl}
			role="listbox"
			aria-activedescendant={highlightedIndex >= 0 ? `dropdown-item-${items[highlightedIndex]?.id}` : undefined}
			class="fixed z-[100] bg-white rounded-lg border border-sand max-h-48 overflow-y-auto animate-dropdown-in"
			style="{menuStyle} box-shadow: 0 4px 12px rgba(45,37,32, 0.08);"
			onkeydown={handleMenuKeydown}
		>
			{#each items as item, index (item.id)}
				<div
					id="dropdown-item-{item.id}"
					role="option"
					aria-selected={item.id === selected}
					class="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors duration-100
						{index === highlightedIndex ? 'bg-oat' : ''}
						{item.id === selected ? 'text-sage font-medium' : 'text-coffee-900'}
						hover:bg-oat"
					onclick={() => selectItem(item)}
					onmouseenter={() => (highlightedIndex = index)}
				>
					{#if item.color}
						<span
							class="w-2.5 h-2.5 rounded-full shrink-0"
							style="background-color: {item.color}"
						></span>
					{/if}
					<span class="truncate">{item.name}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	@keyframes dropdown-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.animate-dropdown-in {
		animation: dropdown-in 100ms ease;
	}
</style>

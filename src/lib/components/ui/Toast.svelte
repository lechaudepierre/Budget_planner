<script lang="ts">
	import { toast, type Toast } from '$lib/stores/toast';
	import { fade, fly } from 'svelte/transition';

	function getToastClasses(type: Toast['type']): string {
		switch (type) {
			case 'success':
				return 'bg-eucalyptus text-white';
			case 'error':
				return 'bg-terracotta text-white';
			case 'warning':
				return 'bg-amber text-white';
			case 'info':
			default:
				return 'bg-sage text-white';
		}
	}

	function getIcon(type: Toast['type']): string {
		switch (type) {
			case 'success':
				return 'M5 13l4 4L19 7';
			case 'error':
				return 'M6 18L18 6M6 6l12 12';
			case 'warning':
				return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
			case 'info':
			default:
				return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
		}
	}
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
	{#each $toast as t (t.id)}
		<div
			in:fly={{ x: 100, duration: 200 }}
			out:fade={{ duration: 150 }}
			class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[280px] max-w-[400px] {getToastClasses(
				t.type
			)}"
		>
			<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getIcon(t.type)} />
			</svg>
			<p class="flex-1 text-sm">{t.message}</p>
			<button
				onclick={() => toast.dismiss(t.id)}
				class="p-1 hover:bg-white/20 rounded transition-colors"
				aria-label="Dismiss"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	{/each}
</div>

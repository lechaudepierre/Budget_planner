<script lang="ts">
	import { toast } from '$lib/stores/toast';

	let busy = $state(false);

	async function undo() {
		const t = $toast;
		if (!t?.undo || busy) return;
		busy = true;
		try {
			await t.undo();
		} finally {
			busy = false;
			toast.dismiss();
		}
	}
</script>

<div class="toast" class:in={$toast} class:error={$toast?.error} role="status" aria-live="polite">
	{#if $toast}
		<span>{$toast.message}</span>
		{#if $toast.undo}
			<button type="button" onclick={undo} disabled={busy}>Annuler</button>
		{/if}
	{/if}
</div>

<style>
	.toast {
		position: absolute;
		left: 16px;
		right: 16px;
		bottom: calc(86px + env(safe-area-inset-bottom, 0px));
		z-index: 9;
		background: var(--toast-bg);
		color: var(--toast-ink);
		border-radius: 16px;
		padding: 12px 14px 12px 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		font-size: 14px;
		transform: translateY(20px);
		opacity: 0;
		transition:
			transform 0.25s,
			opacity 0.25s;
		pointer-events: none;
	}
	.toast.in {
		transform: none;
		opacity: 1;
		pointer-events: auto;
	}
	.toast.error {
		background: var(--over);
		color: #fff;
	}
	.toast button {
		font-weight: 600;
		color: inherit;
		padding: 4px 6px;
		white-space: nowrap;
	}
</style>

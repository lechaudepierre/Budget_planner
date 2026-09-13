<script lang="ts">
	import ActionCard from '$lib/components/ui/ActionCard.svelte';
	import type { DashboardTodo } from '$lib/server/dashboard';

	let { todos }: { todos: DashboardTodo[] } = $props();
</script>

{#if todos.length > 0}
	<section aria-label="À faire" class="space-y-2">
		<h2 class="card-title px-1">À faire</h2>
		<div class="grid gap-3 md:grid-cols-2">
			{#each todos as todo (todo.id)}
				<ActionCard
					icon={todo.icon}
					text={todo.text}
					detail={todo.detail}
					ctaLabel={todo.ctaLabel}
					href={todo.href}
					tone={todo.tone}
				/>
			{/each}
		</div>
	</section>
{/if}

<script lang="ts">
	// Two equal-weight buttons: refusing is exactly as easy as accepting. Neither is pre-selected.
	interface Props {
		onchoose: (analytics: boolean) => void;
	}
	let { onchoose }: Props = $props();
</script>

<div class="flex flex-wrap gap-3">
	<button type="button" class="choice" onclick={() => onchoose(false)}>Nej tak</button>
	<button type="button" class="choice" onclick={() => onchoose(true)}>Det er fint</button>
</div>

<style>
	.choice {
		flex: 1 1 8rem;
		min-height: 2.75rem;
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		font-weight: 600;
		font-size: 0.9375rem;
		cursor: pointer;
		color: var(--color-surface-950-50, inherit);
		background: var(--color-surface-50-950);
		border: 1.5px solid var(--color-primary-700-300, currentColor);
		transition: background-color 200ms, transform 200ms;
	}
	.choice:hover {
		background: color-mix(in oklab, var(--color-primary-500) 22%, var(--color-surface-50-950));
	}
	.choice:active {
		transform: scale(0.97);
	}
	.choice:focus-visible {
		outline: 3px solid var(--color-primary-500);
		outline-offset: 2px;
	}
</style>

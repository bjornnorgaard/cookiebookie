<script lang="ts">
	// Two equal-weight buttons: refusing is exactly as easy as accepting. Neither is pre-selected.
	// The friendly nudge lives on the YES side (a small wink); the NO side is never guilt-tripped.
	interface Props {
		onchoose: (analytics: boolean) => void;
	}
	let { onchoose }: Props = $props();
</script>

<div class="flex flex-wrap gap-3">
	<button type="button" class="choice" onclick={() => onchoose(false)}>Nej tak, helt i orden</button>
	<button type="button" class="choice" onclick={() => onchoose(true)}>
		Det er fint, kig med <span class="wink" aria-hidden="true">😋</span>
	</button>
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
	.wink {
		display: inline-block;
		animation: wink 3.2s ease-in-out 1.5s infinite;
	}
	@keyframes wink {
		0%, 88%, 100% { transform: none; }
		92% { transform: rotate(-14deg) scale(1.25); }
		96% { transform: rotate(10deg) scale(1.15); }
	}
	@media (prefers-reduced-motion: reduce) {
		.wink { animation: none; }
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

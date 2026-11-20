<script lang="ts">
	// Two equal-weight buttons: refusing is exactly as easy as accepting. Neither is pre-selected.
	// A gentle visual nudge towards YES (filled primary vs. quiet outline), but both are same-size, fully legible,
	// real buttons, and NO is never guilt-tripped (owner's call: a small crying face; the button itself stays plain and legible).
	interface Props {
		onchoose: (analytics: boolean) => void;
	}
	let { onchoose }: Props = $props();
</script>

<div class="flex gap-3">
	<button type="button" class="choice no" onclick={() => onchoose(false)}>
		Nej tak <span class="emoji" aria-hidden="true">😢</span>
	</button>
	<button type="button" class="choice yes" onclick={() => onchoose(true)}>
		Det er fint <span class="emoji wink" aria-hidden="true">👍</span>
	</button>
</div>

<style>
	.choice {
		flex: 1 1 0;
		min-height: 2.75rem;
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		font-weight: 600;
		font-size: 0.9375rem;
		white-space: nowrap;
		cursor: pointer;
		border: 1.5px solid transparent;
		transition: background-color 200ms, transform 200ms, box-shadow 200ms;
	}
	.yes {
		background: var(--color-primary-500);
		color: var(--color-primary-contrast-500);
		border-color: var(--color-primary-500);
		box-shadow: 0 6px 16px -8px color-mix(in oklab, var(--color-primary-500) 90%, transparent);
	}
	.yes:hover {
		background: var(--color-primary-400);
		box-shadow: 0 10px 22px -8px color-mix(in oklab, var(--color-primary-500) 95%, transparent);
	}
	.no {
		background: transparent;
		color: inherit;
		border-color: color-mix(in oklab, currentColor 40%, transparent);
	}
	.no:hover {
		background: color-mix(in oklab, currentColor 10%, transparent);
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
	.choice:active {
		transform: scale(0.97);
	}
	.choice:focus-visible {
		outline: 3px solid var(--color-primary-500);
		outline-offset: 2px;
	}
</style>

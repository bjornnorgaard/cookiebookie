<script lang="ts">
	import { theme, toggleTheme } from '#lib/stores/theme.svelte.ts';

	const dark = $derived(theme.mode === 'dark');

	function onclick(event: MouseEvent) {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		toggleTheme(rect.left + rect.width / 2, rect.top + rect.height / 2);
	}
</script>

<button
	type="button"
	class="theme-toggle"
	{onclick}
	aria-label={dark ? 'Skift til lys tilstand' : 'Skift til mørk tilstand'}
	data-testid="theme-toggle"
>
	<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
		<!-- A mask bites the crescent out of the sun disc; the rays rotate and fade away. -->
		<mask id="theme-moon-mask">
			<rect x="0" y="0" width="24" height="24" fill="white" />
			<circle class="bite" class:moon={dark} cx="17" cy="8" r="5" fill="black" stroke="none" />
		</mask>
		<circle class="disc" class:moon={dark} cx="12" cy="12" r="5" fill="currentColor" stroke="none" mask="url(#theme-moon-mask)" />
		<g class="rays" class:hidden={dark}>
			<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
		</g>
	</svg>
</button>

<style>
	.theme-toggle {
		display: inline-grid;
		place-items: center;
		/* 44px touch target; the negative margin keeps the header height unchanged */
		width: 2.75rem;
		height: 2.75rem;
		margin: -0.25rem;
		border-radius: 9999px;
		cursor: pointer;
		color: inherit;
		background: transparent;
		transition: background-color 200ms, transform 200ms;
	}
	.theme-toggle:hover {
		background: var(--color-surface-200-800);
	}
	.theme-toggle:active {
		transform: scale(0.92);
	}
	.rays {
		transform-origin: 12px 12px;
		transition: transform 500ms var(--ease-out-expo), opacity 300ms;
	}
	.rays.hidden {
		transform: rotate(90deg) scale(0.5);
		opacity: 0;
	}
	.disc {
		transform-origin: 12px 12px;
		transition: transform 500ms var(--ease-out-expo);
	}
	.disc.moon {
		transform: scale(1.3);
	}
	.bite {
		transform: translate(6px, -6px);
		transition: transform 500ms var(--ease-out-expo);
	}
	.bite.moon {
		transform: translate(0, 0);
	}
</style>

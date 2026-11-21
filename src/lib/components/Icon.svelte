<script lang="ts" module>
	export type IconName = 'play' | 'pause' | 'close' | 'reset' | 'timer' | 'check' | 'sun' | 'moon' | 'basket';
</script>

<script lang="ts">
	interface Props {
		name: IconName;
		/** Any CSS length; defaults to the surrounding font size. */
		size?: string;
		class?: string;
	}

	let { name, size = '1em', class: className = '' }: Props = $props();

	// Solid shapes read better than outlines for transport controls.
	const solid = $derived(name === 'play' || name === 'pause');
</script>

<!--
	Decorative icon (24x24 grid, Lucide-style strokes, ISC licence). Always aria-hidden:
	the parent button must carry the accessible name.
-->
<svg
	class="icon {className}"
	viewBox="0 0 24 24"
	width={size}
	height={size}
	fill={solid ? 'currentColor' : 'none'}
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	focusable="false"
>
	{#if name === 'play'}
		<polygon points="6 3 20 12 6 21 6 3" />
	{:else if name === 'pause'}
		<rect x="14" y="3" width="5" height="18" rx="1" />
		<rect x="5" y="3" width="5" height="18" rx="1" />
	{:else if name === 'close'}
		<path d="M18 6 6 18M6 6l12 12" />
	{:else if name === 'reset'}
		<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
		<path d="M3 3v5h5" />
	{:else if name === 'timer'}
		<path d="M10 2h4M12 14l3-3" />
		<circle cx="12" cy="14" r="8" />
	{:else if name === 'check'}
		<path d="M20 6 9 17l-5-5" />
	{:else if name === 'sun'}
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
	{:else if name === 'moon'}
		<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
	{:else if name === 'basket'}
		<path d="m15 11-1 9M19 11l-4-7M2 11h20M3.5 11l1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4M4.5 15.5h15M5 11l4-7M9 11l1 9" />
	{/if}
</svg>

<style>
	.icon {
		display: inline-block;
		flex: none;
		vertical-align: -0.125em;
	}
</style>

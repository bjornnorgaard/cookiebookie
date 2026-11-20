<script lang="ts">
	import { FORMATS, fallback, getPhoto, srcset } from '#lib/images.ts';

	interface Props {
		slug: string;
		alt: string;
		/** card: 3:2 crop. hero: full frame on tablet+, 3:2 crop on phones. */
		kind?: 'card' | 'hero';
		/** The `sizes` attribute: how wide the image really renders, so the browser picks the smallest file. */
		sizes: string;
		priority?: boolean;
		class?: string;
		/** Shared-element transition name (card -> recipe page). */
		transitionName?: string;
	}

	let { slug, alt, kind = 'card', sizes, priority = false, class: klass = '', transitionName }: Props = $props();

	const photo = $derived(getPhoto(slug));
	const base = $derived(kind === 'hero' ? photo.wide : photo.card);
	const lead = $derived(fallback(base.jpg));

	let img = $state<HTMLImageElement>();
	let loaded = $state(false);

	// The image may finish loading before hydration, so onload alone is not enough.
	$effect(() => {
		if (img?.complete && img.naturalWidth > 0) loaded = true;
	});
</script>

<div
	class="recipe-image {klass}"
	class:is-hero={kind === 'hero'}
	style:background-color={photo.color}
	style:view-transition-name={transitionName}
	data-placeholder={photo.isPlaceholder || undefined}
>
	{#if photo.isPlaceholder}
		<div class="wire" role="img" aria-label="{alt} (foto kommer snart)">
			<svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
				<rect x="24" y="24" width="552" height="352" rx="18" class="frame" />
				<g class="art">
					<circle cx="300" cy="190" r="78" />
					<circle cx="300" cy="190" r="48" class="soft" />
					<path d="M188 128v50a14 14 0 0 0 14 14M202 128v124M216 128v50a14 14 0 0 1-14 14" />
					<path d="M412 128c-22 14-22 70 0 84v40M412 128v124" />
				</g>
				<text x="300" y="322" text-anchor="middle" class="label">FOTO KOMMER SNART</text>
			</svg>
		</div>
	{:else}
	<div class="blur" style:background-image="url({photo.blur})" aria-hidden="true"></div>

	<picture>
		{#if kind === 'hero'}
			{#each FORMATS as f}
				<source type={f.type} media="(max-width: 639px)" srcset={srcset(photo.card[f.ext])} sizes="100vw" />
			{/each}
		{/if}
		{#each FORMATS.slice(0, 2) as f}
			<source type={f.type} srcset={srcset(base[f.ext])} {sizes} />
		{/each}
		<img
			bind:this={img}
			src={lead.src}
			srcset={srcset(base.jpg)}
			{sizes}
			width={lead.w}
			height={lead.h}
			{alt}
			decoding={priority ? 'sync' : 'async'}
			loading={priority ? 'eager' : 'lazy'}
			fetchpriority={priority ? 'high' : 'auto'}
			class:loaded
			onload={() => (loaded = true)}
		/>
	</picture>
	{/if}
</div>

<style>
	.recipe-image {
		position: relative;
		overflow: hidden;
		aspect-ratio: 3 / 2;
	}
	.recipe-image.is-hero {
		aspect-ratio: 3 / 2;
	}
	@media (min-width: 640px) {
		.recipe-image.is-hero {
			aspect-ratio: 7 / 3;
		}
	}
	.wire {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(color-mix(in oklab, var(--color-primary-500) 6%, transparent) 1px, transparent 1px) 0 0 / 24px 24px,
			linear-gradient(90deg, color-mix(in oklab, var(--color-primary-500) 6%, transparent) 1px, transparent 1px) 0 0 / 24px 24px,
			linear-gradient(135deg, var(--color-surface-100-900), var(--color-surface-200-800));
		color: var(--color-primary-600-400);
	}
	.wire svg {
		width: 100%;
		height: 100%;
		display: block;
	}
	.frame {
		fill: none;
		stroke: currentColor;
		stroke-opacity: 0.4;
		stroke-width: 2;
		stroke-dasharray: 10 8;
	}
	.art {
		fill: none;
		stroke: currentColor;
		stroke-width: 5;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.8;
		transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
		transform-origin: 300px 190px;
	}
	:global(.group:hover) .art {
		transform: rotate(-4deg) scale(1.05);
	}
	.art .soft {
		stroke-opacity: 0.55;
	}
	.label {
		fill: currentColor;
		opacity: 0.7;
		font: 600 14px var(--font-sans);
		letter-spacing: 0.25em;
	}
	.blur {
		position: absolute;
		inset: -10%;
		background-size: cover;
		background-position: center;
		filter: blur(18px) saturate(1.2);
	}
	picture,
	img {
		position: absolute;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
	}
	img {
		object-fit: cover;
		opacity: 0;
		transform: scale(1.04);
		transition:
			opacity 700ms ease,
			transform 1200ms cubic-bezier(0.2, 0.7, 0.2, 1);
	}
	img.loaded {
		opacity: 1;
		transform: none;
	}
	:global(.group:hover) img.loaded {
		transform: scale(1.06);
	}
	@media (prefers-reduced-motion: reduce) {
		img,
		:global(.group:hover) img.loaded {
			transition: none;
			transform: none;
		}
	}
</style>

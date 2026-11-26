<script lang="ts">
	import type { Recipe } from '#lib/types/recipe.ts';
	import { siteName, siteUrl } from '#lib/constants/site.ts';
	import { qrCodes } from '#lib/data/qr.generated.ts';
	import { formatDuration } from '#lib/format.ts';
	import { getPhoto } from '#lib/images.ts';
	import { formatAmount, renderStepText } from '#lib/scale.ts';
	import { getPortions } from '#lib/stores/portions.svelte.ts';
	import { loadPrintPhotos } from '#lib/print.ts';

	let { recipe }: { recipe: Recipe } = $props();

	// Same formatter and portion count as the screen, so the paper shows exactly what the screen shows.
	const portions = getPortions();
	const photo = $derived(getPhoto(recipe.slug));
	const photoSrc = $derived(photo.isPlaceholder ? undefined : photo.card.jpg[Math.min(1, photo.card.jpg.length - 1)]);
	const qr = $derived(qrCodes[recipe.slug]);
	const url = $derived(`${siteUrl}/${recipe.slug}`);
	const shortUrl = $derived(url.replace(/^https?:\/\//, ''));
	const noun = $derived(portions.count === 1 ? 'portion' : 'portioner');
</script>

<!-- Ctrl/Cmd+P: start the lazy print photo (see #lib/print.ts). -->
<svelte:window onbeforeprint={loadPrintPhotos} />

<!-- Print-only. Hidden on screen (see src/print.css); the screen layout is hidden when printing. -->
<section class="print-sheet" aria-label="Udskrift" data-nosnippet>
	<div class="ps-top">
		<span class="ps-brand">{siteName}</span>
		<span>{shortUrl}</span>
	</div>

	<p class="ps-title">{recipe.title}</p>
	<p class="ps-lead">{recipe.shortDesc}</p>
	<p class="ps-meta" data-print-meta>
		Forb. {formatDuration(recipe.prepTime)} · Tilb. {formatDuration(recipe.cookTime)} · I alt {formatDuration(recipe.totalTime)} ·
		<strong data-print-portions>{portions.count} {noun}</strong>
	</p>

	<div class="ps-columns">
		<div class="ps-col-ingredients">
			{#if photoSrc}
				<img class="ps-photo" src={photoSrc.src} width={photoSrc.w} height={photoSrc.h} alt="" loading="lazy" decoding="async" />
			{/if}
			<h2>Indkøb</h2>
			<ul class="ps-ingredients">
				{#each recipe.ingredients as ingredient}
					{@const amount = formatAmount(ingredient, portions.scaling)}
					<li>
						<span class="ps-box" aria-hidden="true"></span>
						<span><strong>{ingredient.name}</strong>{#if amount}, {amount}{/if}</span>
					</li>
				{/each}
			</ul>
		</div>

		<div class="ps-col-steps">
			<h2>Planen</h2>
			<ol class="ps-steps">
				{#each recipe.steps as step, i}
					<li>
						<span class="ps-box" aria-hidden="true"></span>
						<div>
							<h3><span class="ps-num">{i + 1}.</span> {step.title}</h3>
							<p>{renderStepText(step.desc, recipe.ingredients, portions.scaling)}</p>
						</div>
					</li>
				{/each}
			</ol>
		</div>
	</div>

	<div class="ps-foot">
		{#if qr}
			<svg class="ps-qr" viewBox="-2 -2 {qr.size + 4} {qr.size + 4}" role="img" aria-label="QR-kode til {shortUrl}" shape-rendering="crispEdges">
				<rect x="-2" y="-2" width={qr.size + 4} height={qr.size + 4} fill="#fff" />
				<path d={qr.d} fill="#000" />
			</svg>
		{/if}
		<p>
			Opskriften findes også online:<br />
			<strong>{shortUrl}</strong>
		</p>
	</div>
</section>

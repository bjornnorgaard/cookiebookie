<script lang="ts">
	import { seoImgHeight, seoImgWidth } from '$lib/constants/seo';
	import { siteAuthor, siteLocale, siteName, siteUrl } from '$lib/constants/site';
	import type { Recipe } from '$lib/types/recipe';
	import { picsumHost } from '$lib/constants/picsum';
	import { buildRecipeHead, buildWebsiteHead } from '$lib/seo/builder';

	interface Props {
		recipe?: Recipe | undefined;
		noindex?: boolean;
		titleOverride?: string;
		descriptionOverride?: string;
	}

	let { recipe = undefined, noindex = false, titleOverride, descriptionOverride }: Props = $props();

	const homepageTitle = `${siteName} - Bedre opskriter, mindre pis og ingen reklamer`;
	const homepageDescription =
		'Simple opskrifter og gode råd om madlavning. ' +
		'Skrevet i et uformelt og, forhåbentligt, morsomt sprog, som er let at følge. ' +
		'Ingen lange oprindelseshistorier - og naturligvis uden irriterende reklamer.';

	let title = $derived(
		titleOverride ??
			(recipe ? `${recipe.title} | ${recipe.shortDesc}` : homepageTitle)
	);
	let description = $derived(
		descriptionOverride ??
			(recipe
				? `Opskriften på ${recipe.title.toLowerCase()} - ${recipe.shortDesc} ${recipe.longDesc}`
				: homepageDescription)
	);
	let type = $derived(recipe ? 'article' : 'website');
	let url = $derived(recipe ? `${siteUrl}/${recipe.slug}` : siteUrl);

	const width = seoImgWidth;
	const height = seoImgHeight;
	let image = $derived(
		recipe ? `${recipe.image}/${width}/${height}` : `${picsumHost}/id/292/${width}/${height}`
	);

	let structuredData = $derived(
		recipe ? buildRecipeHead(recipe, siteUrl) : buildWebsiteHead()
	);
</script>

<svelte:head>
	<title>{title}</title>
	<link rel="canonical" href={url} />

	<meta name="description" content={description} />
	<meta name="author" content={siteAuthor} />
	{#if noindex}
		<meta name="robots" content="noindex, follow" />
	{/if}
	{#if recipe}
		<meta property="article:publisher" content={siteUrl} />
	{/if}

	<meta property="og:site_name" content={siteName} />
	<meta property="og:locale" content={siteLocale} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />

	<meta property="og:image" content={image} />
	<meta property="og:image:width" content={width.toString()} />
	<meta property="og:image:height" content={height.toString()} />
	<meta property="og:image:alt" content={title} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />

	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
</svelte:head>

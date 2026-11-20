<script lang="ts">
	import { getPhoto } from '#lib/images.ts';
	import { siteAuthor, siteLocale, siteName, siteUrl } from '#lib/constants/site.ts';
	import type { Recipe } from '#lib/types/recipe.ts';
	import { isoDate } from '#lib/format.ts';
	import { buildBreadcrumbs, buildRecipeHead, buildWebsiteHead } from '#lib/seo/builder.ts';

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

	let og = $derived(recipe ? getPhoto(recipe.slug).social.og : getPhoto('placeholder').social.og);
	let image = $derived(`${siteUrl}${og.src}`);
	let width = $derived(og.w);
	let height = $derived(og.h);

	let structuredData = $derived(
		recipe ? [buildRecipeHead(recipe, siteUrl), buildBreadcrumbs(recipe, siteUrl)] : [buildWebsiteHead()]
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
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:alt" content={recipe ? recipe.title : siteName} />
	{#if recipe}
		<meta property="article:published_time" content={isoDate(recipe.datePublished)} />
		<meta property="article:author" content={recipe.author} />
		<meta property="article:section" content={recipe.categories[0]} />
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
	<meta name="twitter:image:alt" content={recipe ? recipe.title : siteName} />

	{#each structuredData as data}
		{@html `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`}
	{/each}
</svelte:head>

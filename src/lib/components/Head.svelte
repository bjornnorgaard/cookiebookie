<script lang="ts">
    import { seoImgHeight, seoImgWidth } from "$lib/constants/seo";
    import type { Recipe } from "$lib/types/recipe";
    import { picsumHost } from "$lib/constants/picsum";
    import { buildRecipeHead } from "$lib/seo/builder";

    interface Props {
        recipe?: Recipe | undefined;
    }

    let { recipe = undefined }: Props = $props();

    const name = "Cookie Bookie";
    const rootUrl = "https://cookiebookie.dk"
    const author = "Bjørn Nørgaard";

    let title = $state(`${name} - Bedre opskriter, mindre pis og ingen reklamer`);
    let description = $state("Simple opskrifter og gode råd om madlavning. " +
        "Skrevet i et uformelt og, forhåbentligt, morsomt sprog, som er let at følge. " +
        "Ingen lange oprindelseshistorier - og naturligvis uden irriterende reklamer.");
    let type = $state("website");
    let url = $state(rootUrl);

    const width = seoImgWidth;
    const height = seoImgHeight;
    let image = $state(`${picsumHost}/id/292/${width}/${height}`);

    if (recipe) {
        const r = recipe as Recipe;
        title = `${recipe.title} | ${r.shortDesc}`;
        description = `Opskriften på ${recipe.title.toLowerCase()} - ${recipe.shortDesc} ${r.longDesc}`;
        type = "article";
        url = `${rootUrl}/${r.slug}`;
        image = `${r.image}/${width}/${height}`;
    }
</script>

<svelte:head>
    <title>{title}</title>
    <link rel="canonical" href={url}>

    <meta name="description" content={description}>
    <meta name="author" content={author}>
    <meta property="article:publisher" content={rootUrl}>

    <meta property="og:site_name" content={name}>
    <meta property="og:locale" content="da_DK">
    <meta property="og:type" content={type}>
    <meta property="og:url" content={url}>
    <meta property="og:title" content={title}>
    <meta property="og:description" content={description}>
    <meta property="og:url" content={url}>

    <meta property="og:image" content={image}>
    <meta property="og:image:width" content={width.toString()}>
    <meta property="og:image:height" content={height.toString()}>
    <meta property="og:image:type" content="image/jpeg">

    <meta property="twitter:domain" content={rootUrl}>
    <meta property="twitter:url" content={url}>
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content={title}>
    <meta name="twitter:description" content={description}>
    <meta name="twitter:image" content={image}>

    {#if recipe}
        {@html `<script type="application/ld+json">${JSON.stringify(buildRecipeHead(recipe, rootUrl), null, 2)}</script>`}
    {/if}
</svelte:head>

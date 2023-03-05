<script lang="ts">
    import type { Recipe } from "../types/recipe";
    import StructuredDataRecipe from "$lib/components/StructuredDataRecipe.svelte";
    import { seoImgHeight, seoImgWidth } from "../constants/seo";
    import { picsumHost } from "../constants/picsum";

    const name = "Cookie Bookie";
    const domain = "cookiebookie.dk"
    const host = `https://www.${domain}`;
    const author = "Bjørn Nørgaard";

    let title = `${name} - Bedre opskriter, mindre pis og ingen reklamer`;
    let description = "Simple opskrifter og gode råd om madlavning. " +
        "Skrevet i et uformelt og, forhåbentligt, morsomt sprog, som er let at følge. " +
        "Ingen lange oprindelseshistorier - og naturligvis uden irriterende reklamer.";
    let type = "website";
    let url = host;

    const width = seoImgWidth;
    const height = seoImgHeight;
    let image = `${picsumHost}/id/292/${width}/${height}`;

    export let recipe: Recipe | undefined;

    if (recipe) {
        title = recipe.shortDesc;
        description = recipe.longDesc;
        type = "article";
        url = `${url}/${recipe.slug}`;
        image = `${recipe.image}/${width}/${height}`;
    }
</script>

<svelte:head>
    <title>{title}</title>
    <link rel="canonical" href={url}>

    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="description" content={description}>
    <meta name="author" content={author}>
    <meta property="article:publisher" content={host}>

    <meta property="og:site_name" content={name}>
    <meta property="og:locale" content="da_DK">
    <meta property="og:type" content={type}>
    <meta property="og:url" content={url}>
    <meta property="og:title" content={title}>
    <meta property="og:description" content={description}>
    <meta property="og:url" content={url}>

    <meta property="og:image" content={image}>
    <meta property="og:image:width" content={width}>
    <meta property="og:image:height" content={height}>
    <meta property="og:image:type" content="image/jpeg">

    <meta property="twitter:domain" content={domain}>
    <meta property="twitter:url" content={url}>
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content={title}>
    <meta name="twitter:description" content={description}>
    <meta name="twitter:image" content={image}>

    {#if recipe}
        <StructuredDataRecipe recipe={recipe}/>
    {/if}
</svelte:head>

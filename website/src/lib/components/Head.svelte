<script lang="ts">
    import type {Recipe} from "../types/recipe";
    import StructuredDataRecipe from "$lib/components/StructuredDataRecipe.svelte";
    import {seoImgHeight, seoImgWidth} from "../constants/seo";
    import {picsumHost} from "../constants/picsum";

    const name = "Cookie Bookie";
    const rootUrl = "https://cookiebookie.dk"
    const author = "Bjørn Nørgaard";

    let title = `${name} - Bedre opskriter, mindre pis og ingen reklamer`;
    let description = "Simple opskrifter og gode råd om madlavning. " +
        "Skrevet i et uformelt og, forhåbentligt, morsomt sprog, som er let at følge. " +
        "Ingen lange oprindelseshistorier - og naturligvis uden irriterende reklamer.";
    let type = "website";
    let url = rootUrl;

    const width = seoImgWidth;
    const height = seoImgHeight;
    let image = `${picsumHost}/id/292/${width}/${height}`;

    export let recipe: Recipe | undefined = undefined;

    if (recipe) {
        const r = recipe as Recipe;
        title = r.shortDesc;
        description = r.longDesc;
        type = "article";
        url = `${url}/${r.slug}`;
        image = `${r.image}/${width}/${height}`;
    }
</script>

<svelte:head>
    <title>{title}</title>
    <link href={url} rel="canonical">

    <meta content={description} name="description">
    <meta content={author} name="author">
    <meta content={rootUrl} property="article:publisher">

    <meta content={name} property="og:site_name">
    <meta content="da_DK" property="og:locale">
    <meta content={type} property="og:type">
    <meta content={url} property="og:url">
    <meta content={title} property="og:title">
    <meta content={description} property="og:description">
    <meta content={url} property="og:url">

    <meta content={image} property="og:image">
    <meta content={width.toString()} property="og:image:width">
    <meta content={height.toString()} property="og:image:height">
    <meta content="image/jpeg" property="og:image:type">

    <meta content={rootUrl} property="twitter:domain">
    <meta content={url} property="twitter:url">
    <meta content="summary_large_image" name="twitter:card">
    <meta content={title} name="twitter:title">
    <meta content={description} name="twitter:description">
    <meta content={image} name="twitter:image">

    {#if recipe}
        <StructuredDataRecipe recipe={recipe}/>
    {/if}
</svelte:head>

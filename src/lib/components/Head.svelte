<script lang="ts">
    import type { Recipe } from "../types/recipe";
    import { onMount } from "svelte";

    const name = "Cookie Bookie";
    const host = "https://www.cookiebookie.dk";
    const author = "Bjørn Nørgaard";

    let title = `${name} | Bedre opskriter, mindre pis`;
    let description = "Hjemmelavede opskrifter af kraftigt varierende kvalitet";
    let type = "website";
    let url = host;

    const size = 512;
    let image = `https://picsum.photos/id/292/${size}/${size}`;

    export let recipe: Recipe | undefined = undefined;

    onMount(() => {
        if (recipe) {
            title = recipe.title;
            description = recipe.shortDesc;
            type = "article";
            url = `${url}/${recipe.slug}`;
            image = recipe.image;
            return;
        }
    });
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

    {#if image}
        <meta property="og:image" content={image}>
        <meta property="og:image:width" content={size}>
        <meta property="og:image:height" content={size}>
        <meta property="og:image:type" content="image/jpeg">
    {/if}
</svelte:head>

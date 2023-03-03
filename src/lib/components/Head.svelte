<script lang="ts">
    import type { Recipe } from "../types/recipe";
    import messy_pots from "$lib/images/messy_pots.jpg";
    import { onMount } from "svelte";

    const name = "Cookie Bookie";
    const host = "https://www.cookiebookie.dk";
    const author = "Bjørn Nørgaard";

    let title = `${name} | Bedre opskriter, mindre pis`;
    let description = "Hjemmelavede opskrifter af kraftigt varierende kvalitet";
    let type = "website";
    let url = host;

    let image = messy_pots;
    const attribution = "Photo by Scott Umstattd on Unsplash"
    let height = 427;
    let width = 640;

    export let recipe: Recipe | undefined = undefined;

    onMount(() => {
        if (recipe) {
            title = recipe.title;
            description = recipe.shortDesc;
            type = "article";
            url = `${url}/${recipe.slug}`;
            image = recipe.image;
            height = 300;
            width = 700;
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

    <!-- Photo by Scott Umstattd on Unsplash -->
    <meta property="og:image" content={image}>
    <meta property="og:image:photographer" content={attribution}>
    <meta property="og:image:width" content={width}>
    <meta property="og:image:height" content={height}>
    <meta property="og:image:type" content="image/jpeg">

    <!-- Ignored for now -->
    <!-- <meta property="article:published_time" content=""> -->
    <!-- <meta property="article:modified_time" content=""> -->
    <!-- <meta name="twitter:label1" content=""> -->
    <!-- <meta name="twitter:data1" content=""> -->
    <!-- <meta name="twitter:label2" content=""> -->
    <!-- <meta name="twitter:data2" content=""> -->
</svelte:head>

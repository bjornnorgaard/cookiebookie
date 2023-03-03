<script lang="ts">
    import type { Recipe } from "../types/recipe";
    import { onMount } from "svelte";

    const name = "Cookie Bookie";
    const domain = "cookiebookie.dk"
    const host = `https://www.${domain}`;
    const author = "Bjørn Nørgaard";

    let title = `${name} - bedre opskriter, mindre pis`;
    let description = "Hjemmelavede opskrifter af kraftigt varierende kvalitet";
    let type = "website";
    let url = host;

    const width = 1200;
    const height = 630;
    let image = `https://picsum.photos/id/292/${width}/${height}`;

    export let recipe: Recipe | undefined = undefined;

    onMount(() => {
        if (recipe) {
            title = recipe.title;
            description = recipe.shortDesc;
            type = "article";
            url = `${url}/${recipe.slug}`;
            image = `${recipe.image}/${width}/${height}`;
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

    <!-- Google tag (gtag.js) -->
    <script nonce="%svelktekit.nonce%" async src="https://www.googletagmanager.com/gtag/js?id=G-ZT1Z6X8C7F"></script>
    <script nonce="%svelktekit.nonce%">
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag('js', new Date());

        gtag('config', 'G-ZT1Z6X8C7F');
    </script>
</svelte:head>

<script lang="ts">
    import "../app.css";
    import NavigationTop from "$lib/components/NavigationTop.svelte";
    import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
    <title>Cookie Bookie | Bedre opskriter, mindre pis</title>
    <meta name="description" content="Hjemmelavede opskrifter af kraftigt varierende kvalitet">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://www.cookiebookie.dk/">
    <meta property="og:title" content="Cookie Bookie | Bedre opskriter, mindre pis">
    <meta property="og:description" content="Hjemmelavede opskrifter af kraftigt varierende kvalitet">
</svelte:head>

<NavigationTop homeLabel="Cookie Bookie" homeRoute="/">
    <slot/>
</NavigationTop>

<Footer/>
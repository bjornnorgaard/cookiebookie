<script lang="ts">
    import "../app.css";
    import NavigationTop from "$lib/components/NavigationTop.svelte";
    import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
    <title>Cookie Boogie</title>
</svelte:head>

<NavigationTop homeLabel="Cookie Boogie" homeRoute="/">
    <slot/>
</NavigationTop>

<Footer/>
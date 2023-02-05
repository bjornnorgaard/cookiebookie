<script lang="ts">
    import "../app.css";
    import NavigationTop from "$lib/components/NavigationTop.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import Head from "$lib/components/Head.svelte";
</script>

<Head/>

<NavigationTop homeLabel="Cookie Bookie" homeRoute="/">
    <slot/>
</NavigationTop>

<Footer/>
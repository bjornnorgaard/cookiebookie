<script lang="ts">
    import "../app.css";
    import NavigationTop from "$lib/components/NavigationTop.svelte";
    import Footer from "$lib/components/Footer.svelte";
</script>

<NavigationTop homeLabel="Cookie Boogie" homeRoute="/">
    <slot/>
</NavigationTop>

<Footer/>
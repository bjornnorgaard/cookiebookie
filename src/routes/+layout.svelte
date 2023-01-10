<script>
    import "../app.css"
    import NavigationTop from "$lib/components/NavigationTop.svelte";
</script>

<NavigationTop homeLabel="Cookbook" homeRoute="/">
    <slot/>
</NavigationTop>

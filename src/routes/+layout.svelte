<script lang="ts">
    import "../app.css"
    import NavigationTop from "$lib/components/NavigationTop.svelte";
</script>

<div data-theme="retro">
    <NavigationTop homeLabel="Cookbook" homeRoute="/">
        <slot/>
    </NavigationTop>
</div>

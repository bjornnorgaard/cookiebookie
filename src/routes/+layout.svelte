<script lang="ts">
    import "../app.css"
    import NavigationTop from "$lib/components/NavigationTop.svelte";
</script>

<div>
    <NavigationTop homeLabel="Cookie Boogie" homeRoute="/">
        <slot/>
    </NavigationTop>
</div>

<script lang="ts">
    import "../app.css"
    import NavigationTop from "$lib/components/NavigationTop.svelte";
    import type {NavLink} from "$lib/types/navigation";

    const routes: NavLink[] = [
        {route: "/", label: "Home"}
    ]
</script>

<div data-theme="retro">
    <NavigationTop homeLabel="Cookbook" homeRoute="/" {routes}>
        <slot/>
    </NavigationTop>
</div>

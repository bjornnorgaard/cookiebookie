<script lang="ts">
    import { page } from "$app/stores";
    import ContentNarrow from "$lib/components/ContentNarrow.svelte";
    import { recipes } from "$lib/stores/recipes";
    import ShoppingList from "$lib/components/ShoppingList.svelte";

    const slug = $page.params.slug;
    const r = $recipes.get(slug);
</script>

<svelte:head>
    <title>Cookie Boogie - {r.title}</title>
    <meta content={r.shortDesc} name="description">
</svelte:head>

<ContentNarrow title={r.title}>
    <img alt="placeholder" class="rounded-lg drop-shadow-lg" height="300" src={r.image} width="700">
    <p class="m-0">{r.longDesc}</p>

    <ShoppingList recipe={r}/>

    <h2>Planen</h2>
    <div class="flex flex-col gap-4 rounded-lg p-4 drop-shadow-lg bg-secondary text-secondary-content">
        {#each r.steps as s}
            <div class="flex gap-4">
                <input type="checkbox" class="mt-1 checkbox bg-neutral-content text-neutral-content">
                <div class="flex flex-col">
                    <h4 class="m-0">{s.title}</h4>
                    <p class="m-0">{s.desc}</p>
                </div>
            </div>
        {/each}
    </div>
</ContentNarrow>

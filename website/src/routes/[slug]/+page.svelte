<script lang="ts">
    import ContentNarrow from "$lib/components/ContentNarrow.svelte";
    import Head from "$lib/components/Head.svelte";
    import ShoppingList from "./ShoppingList.svelte";
    import type {PageData} from "./$types";

    export let data: PageData
    const planCheckmarks: boolean[] = [];
</script>

<Head recipe={data.recipe}/>

<ContentNarrow title={data.recipe.title}>
    <img alt={data.recipe.title}
         class="rounded-lg drop-shadow-lg" height="300"
         loading="eager" src={`${data.recipe.image}/1260/540`}
         title={data.recipe.title} width="700">
    <p class="m-0">{data.recipe.longDesc}</p>

    <ShoppingList recipe={data.recipe}/>

    <h2>Planen</h2>
    <div class="flex flex-col gap-4 rounded-lg p-4 drop-shadow-lg bg-secondary text-secondary-content">
        {#each data.recipe.steps as s,id}
            <div class="flex gap-4">
                <input id={s.title} type="checkbox" bind:checked={planCheckmarks[id]}
                       class="mt-1 checkbox bg-neutral-content text-neutral-content">
                <div class="flex flex-col">
                    <label for={s.title}
                           class="font-bold text-base mt-1 transition-opacity"
                           class:line-through={planCheckmarks[id]}
                           class:opacity-50={planCheckmarks[id]}>
                        {s.title}
                    </label>

                    <p class="m-0 transition-opacity"
                       class:line-through={planCheckmarks[id]}
                       class:opacity-50={planCheckmarks[id]}>
                        {s.desc}
                    </p>
                </div>
            </div>
        {/each}
    </div>
</ContentNarrow>

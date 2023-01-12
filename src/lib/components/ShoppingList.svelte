<script lang="ts">
    import type { Recipe } from "$lib/types/recipe";
    import { writable } from "svelte/store";
    import { onMount } from "svelte";

    export let recipe: Recipe = {} as Recipe;

    const have = writable<string[]>([]);

    onMount(() => {
        const stored: string[] = JSON.parse(localStorage.getItem(recipe.slug)) || [];
        have.set(stored);
    })

    const toggleIngredient = (name: string) => {
        if ($have.includes(name)) {
            have.update(list => [...list.filter(i => i != name)])
        } else {
            have.update(list => [...list, name])
        }
        localStorage.setItem(recipe.slug, JSON.stringify($have))
    };
</script>

<h2>Indkøbslisten</h2>

<div class="gap-4 rounded-lg p-4 drop-shadow-lg grid-list bg-neutral text-neutral-content">
    {#each recipe.ingredients as i (i)}
        <div class="flex justify-between gap-4">
            <input type="checkbox" checked={$have.includes(i.name) ? "checked" : ""}
                   on:click={() => toggleIngredient(i.name)} class="checkbox bg-neutral-content">
            <span class="grow">{i.name}{i.amount ? `, ${i.amount}` : ""}</span>
        </div>
    {/each}
</div>
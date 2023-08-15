<script lang="ts">
    import type { Recipe } from "$lib/types/recipe";
    import { onMount } from "svelte";
    import { flip } from "svelte/animate";
    import { cubicInOut } from "svelte/easing";
    import { localStorageStore } from "$lib/stores/localStorageStore";

    export let recipe: Recipe;
    const have = localStorageStore<string[]>("shopping_list", []);

    onMount(() => sortIngredients());

    function toggle(name: string) {
        if ($have.includes(name)) {
            have.update(list => [ ...list.filter(i => i != name) ])
        } else {
            have.update(list => [ ...list, name ])
        }
        sortIngredients();
    }

    function sortIngredients() {
        const h = recipe.ingredients.filter(i => $have.includes(i.name));
        const n = recipe.ingredients.filter(i => !$have.includes(i.name));
        recipe.ingredients = [ ...n, ...h ];
    }
</script>

<div class="gap-2 grid-list p-3">
    {#each recipe.ingredients as i (i.name)}
        <div animate:flip={{duration: 1000, easing: cubicInOut, delay: 2000}}
             class="flex items-center justify-between gap-4 p-1 hover:line-through">

            <input id={i.name}
                   type="checkbox"
                   checked={$have.includes(i.name)}
                   on:click={() => toggle(i.name)}
                   class="checkbox bg-neutral-content">

            <label class="grow cursor-pointer" for={i.name}
                   class:line-through={$have.includes(i.name) ? "checked" : ""}>
                <span class="font-bold">{i.name}</span>{i.amount ? `, ${i.amount}` : ""}
            </label>
        </div>
    {/each}
</div>

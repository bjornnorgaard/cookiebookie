<script lang="ts">
    import type { Recipe } from "$lib/types/recipe";
    import { writable } from "svelte/store";
    import { onMount } from "svelte";
    import { flip } from "svelte/animate";
    import { cubicInOut } from "svelte/easing";

    export let recipe: Recipe = {} as Recipe;

    const have = writable<string[]>([]);

    onMount(() => {
        have.set(JSON.parse(localStorage.getItem(recipe.slug)) || []);
        sortIngredients();
    })

    const onCheckChange = (name: string) => {
        toggle(name);
        sortIngredients();
        save();
    };

    function toggle(name: string) {
        if ($have.includes(name)) {
            have.update(list => [...list.filter(i => i != name)])
        } else {
            have.update(list => [...list, name])
        }
    }

    function sortIngredients() {
        const h = recipe.ingredients.filter(i => $have.includes(i.name));
        const n = recipe.ingredients.filter(i => !$have.includes(i.name));
        recipe.ingredients = [...n, ...h];
    }

    function save() {
        localStorage.setItem(recipe.slug, JSON.stringify($have))
    }
</script>

<h2>Indkøbslisten</h2>

<div class="gap-4 rounded-lg p-4 drop-shadow-lg grid-list bg-neutral-focus text-neutral-content">
    {#each recipe.ingredients as i (i.name)}
        <div animate:flip={{duration: 1000, easing: cubicInOut, delay: 2000}}
             class="flex justify-between gap-4">

            <input id={i.name}
                   type="checkbox"
                   checked={$have.includes(i.name)}
                   on:click={() => onCheckChange(i.name)}
                   class="checkbox bg-neutral-content">

            <label class="grow" for={i.name}
                   class:line-through={$have.includes(i.name) ? "checked" : ""}>
                {i.name}{i.amount ? `, ${i.amount}` : ""}
            </label>
        </div>
    {/each}
</div>

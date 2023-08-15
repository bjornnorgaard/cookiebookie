<script lang="ts">
    import Head from "$lib/components/Head.svelte";
    import ShoppingList from "$lib/components/ShoppingList.svelte";
    import MainContent from "$lib/components/MainContent.svelte";
    import { page } from "$app/stores";

    $: recipe = $page.data.recipe;
    const completedSteps: boolean[] = [];
</script>

<Head recipe={recipe}/>

<MainContent title={recipe.title}>
    <img class="rounded-lg drop-shadow-lg"
         title={recipe.title} loading="eager"
         src={`${recipe.image}/1260/540`} alt={recipe.title}
         height="300" width="700">

    <p class="text-base-content">{recipe.longDesc}</p>

    <section>
        <div class="relative">
            <h2>Indkøbslisten</h2>
            <div class="absolute bottom-0 left-0 h-1 w-10 rounded-2xl bg-primary"></div>
        </div>

        <div class="rounded-lg drop-shadow-lg bg-primary text-primary-content card">
            <ShoppingList recipe={recipe}/>
        </div>
    </section>

    <section>
        <div class="relative">
            <h2>Planen</h2>
            <div class="absolute bottom-0 left-0 h-1 w-10 rounded-2xl bg-secondary"></div>
        </div>

        <div class="rounded-lg drop-shadow-lg bg-secondary text-secondary-content card">
            <div class="flex flex-col gap-4 p-4">
                {#each recipe.steps as s, i}
                    <div id={"step" + (i+1)} class="flex gap-4"
                         class:bg-yellow-400={$page.url.toString().includes("#step" + (i+1))}>
                        <input id={s.title} type="checkbox" bind:checked={completedSteps[i]}
                               class="mt-1 checkbox bg-neutral-content text-neutral-content">
                        <div class="flex flex-col">
                            <label for={s.title}
                                   class="mt-1 w-fit cursor-pointer text-base font-bold transition-opacity hover:line-through"
                                   class:line-through={completedSteps[i]}
                                   class:opacity-50={completedSteps[i]}>
                                {s.title}
                            </label>

                            <p class="m-0 transition-opacity"
                               class:line-through={completedSteps[i]}
                               class:opacity-50={completedSteps[i]}>
                                {s.desc}
                            </p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </section>

</MainContent>

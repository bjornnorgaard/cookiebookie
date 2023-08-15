<script lang="ts">
    import Head from "$lib/components/Head.svelte";
    import ShoppingList from "$lib/components/ShoppingList.svelte";
    import type { PageData } from './$types';
    import MainContent from "$lib/components/MainContent.svelte";

    export let data: PageData;

    const completedSteps: boolean[] = [];
</script>

<Head recipe={data.recipe}/>

<MainContent title={data.recipe.title}>
    <img class="rounded-lg drop-shadow-lg"
         title={data.recipe.title} loading="eager"
         src={`${data.recipe.image}/1260/540`} alt={data.recipe.title}
         height="300" width="700">

    <p class="text-base-content">{data.recipe.longDesc}</p>

    <section>
        <div class="relative">
            <h2>Indkøbslisten</h2>
            <div class="bg-primary absolute bottom-0 left-0 h-1 w-10 rounded-2xl"></div>
        </div>

        <div class="bg-primary text-primary-content rounded-lg drop-shadow-lg card">
            <ShoppingList recipe={data.recipe}/>
        </div>
    </section>

    <section>
        <div class="relative">
            <h2>Planen</h2>
            <div class="bg-secondary absolute bottom-0 left-0 h-1 w-10 rounded-2xl"></div>
        </div>

        <div class="bg-secondary text-secondary-content rounded-lg drop-shadow-lg card">
            <div class="flex flex-col gap-4 p-4">
                {#each data.recipe.steps as s,id}
                    <div class="flex gap-4">
                        <input id={s.title} type="checkbox" bind:checked={completedSteps[id]}
                               class="mt-1 checkbox bg-neutral-content text-neutral-content">
                        <div class="flex flex-col">
                            <label for={s.title}
                                   class="mt-1 w-fit cursor-pointer text-base font-bold transition-opacity hover:line-through"
                                   class:line-through={completedSteps[id]}
                                   class:opacity-50={completedSteps[id]}>
                                {s.title}
                            </label>

                            <p class="m-0 transition-opacity"
                               class:line-through={completedSteps[id]}
                               class:opacity-50={completedSteps[id]}>
                                {s.desc}
                            </p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </section>

</MainContent>

<script lang="ts">
    import Head from "$lib/components/Head.svelte";
    import ShoppingList from "$lib/components/ShoppingList.svelte";
    import MainContent from "$lib/components/MainContent.svelte";

    let {data} = $props();
    const completedSteps: boolean[] = $state([]);
</script>

<Head recipe={data.recipe}/>

<MainContent title={data.recipe.title}>
    <img class="rounded-lg drop-shadow-lg"
         title={data.recipe.title}
         fetchpriority="high" loading="eager"
         src={`${data.recipe.image}/1260/540`} alt={data.recipe.title}
         height="300" width="700">

    <p class="py-4">
        {data.recipe.shortDesc}
        {data.recipe.longDesc}
    </p>

    <section>
        <div class="relative">
            <h4 class="h4">Indkøbslisten</h4>
            <div class="absolute bottom-0 bg-primary-500 left-0 h-1 w-10 rounded-2xl"></div>
        </div>

        <div class="preset-tonal-primary card my-4">
            <ShoppingList recipe={data.recipe}/>
        </div>
    </section>

    <section>
        <div class="relative">
            <h4 class="h4">Planen</h4>
            <div class="absolute bottom-0 bg-secondary-500 left-0 h-1 w-10 rounded-2xl"></div>
        </div>

        <div class="card preset-tonal-secondary my-4 flex flex-col gap-4 p-4">
            {#each data.recipe.steps as s, i}
                <div id={"step" + (i+1)} class="flex gap-4">
                    <input id={s.title} type="checkbox" bind:checked={completedSteps[i]} class="mt-1">
                    <div class="flex flex-col">
                        <label for={s.title}
                               class="mt-1 w-fit cursor-pointer font-bold transition-opacity hover:line-through"
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
    </section>

</MainContent>

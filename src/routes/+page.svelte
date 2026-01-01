<script lang="ts">
    import Head from "$lib/components/Head.svelte";
    import MainContent from "$lib/components/MainContent.svelte";

    let {data} = $props();
</script>

<Head/>

<MainContent title="Seneste opskrifter">
    <div class="gap-4 grid-list">
        {#each data.recipes as recipe, i}
            <a href={recipe.slug}
               class="overflow-hidden card rounded-lg preset-tonal no-underline duration-500 ease-in-out hover:scale-105">
                <img class="m-0 object-cover"
                     title={recipe.title}
                     loading="eager" fetchpriority={i < 4 ? 'high' : 'low'}
                     src={`${recipe.image}/700/300`} alt={recipe.title}
                     height="300" width="700"/>

                <div class="prose p-4">
                    <h2 class="m-0 font-bold text-xl">{recipe.title}</h2>
                    <p class="line-clamp-2">{recipe.shortDesc}</p>
                </div>
            </a>
        {/each}
    </div>
</MainContent>

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
                     fetchpriority={i < 6 ? "high" : "auto"} loading={i < 6 ? "eager" : "lazy"}
                     src={`${recipe.image}/300/125`} alt={recipe.title}
                     height="125" width="300"/>

                <div class="prose p-4">
                    <h2 class="m-0 font-bold text-xl">{recipe.title}</h2>
                    <p class="line-clamp-2">{recipe.shortDesc}</p>
                </div>
            </a>
        {/each}
    </div>
</MainContent>

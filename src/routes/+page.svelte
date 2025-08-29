<script lang="ts">
    import Head from "$lib/components/Head.svelte";
    import MainContent from "$lib/components/MainContent.svelte";

    let {data} = $props();
</script>

<Head/>

<MainContent title="Seneste opskrifter">
    <div class="gap-4 grid-list">
        {#each data.recipes as recipe}
            <a href={recipe.slug}
               class="overflow-hidden no-underline duration-500 ease-in-out card card-compact glass hover:scale-105">
                <img class="m-0 rounded-t object-cover"
                     title={recipe.title} loading="eager"
                     src={`${recipe.image}/700/300`} alt={recipe.title}
                     height="300" width="700"/>

                <div class="card-body prose">
                    <h2 class="m-0 card-title">{recipe.title}</h2>
                    <p class="line-clamp-2">{recipe.shortDesc}</p>
                </div>
            </a>
        {/each}
    </div>
</MainContent>

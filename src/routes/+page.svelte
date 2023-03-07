<script lang="ts">
    import ContentNarrow from "$lib/components/ContentNarrow.svelte";
    import { recipes } from "$lib/stores/recipes.ts";
    import Head from "$lib/components/Head.svelte";
</script>

<Head/>

<ContentNarrow title="Seneste opskrifter">
    <div class="gap-4 grid-list">
        {#each [...$recipes] as [slug, recipe]}
            <a href={slug}
               class="overflow-hidden no-underline duration-500 ease-in-out card card-compact glass hover:scale-105">
                <img class="m-0 rounded-t object-cover"
                     title={recipe.title} loading="lazy"
                     src={`${recipe.image}/700/300`} alt={recipe.title}
                     height="300" width="700"/>

                <div class="card-body prose">
                    <h2 class="m-0 card-title">{recipe.title}</h2>
                    <p>{recipe.shortDesc}</p>
                </div>
            </a>
        {/each}
    </div>
</ContentNarrow>

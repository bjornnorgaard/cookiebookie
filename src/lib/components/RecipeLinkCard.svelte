<script lang="ts">
    import { recipes } from "$lib/stores/recipes";

    export let slug: string;
    export let recipe = $recipes.get(slug);
</script>

<a href={slug} class="overflow-hidden no-underline duration-500 ease-in-out card card-compact glass hover:scale-105">
    <img class="m-0 rounded-t object-cover"
         src={`${recipe.image}/700/300`} alt={recipe.title}
         height="300" width="700"/>

    <div class="card-body prose">
        <h2 class="m-0 card-title">{recipe.title}</h2>
        <p>{recipe.shortDesc}</p>
    </div>
</a>

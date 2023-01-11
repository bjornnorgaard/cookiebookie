<script lang="ts">
	import { recipes } from "$lib/stores/recipes";

	export let slug: string;
	export let recipe = $recipes.get(slug);
</script>

<a
	href={slug}
	class="overflow-hidden duration-500 ease-in-out card card-compact glass hover:scale-105"
>
	<img class="m-0 rounded-t object-cover" src={recipe.image} alt="car!" />
	<div class="card-body prose">
		<h2 class="m-0 card-title">{recipe.title}</h2>
		<p>{recipe.desc}</p>
	</div>
</a>

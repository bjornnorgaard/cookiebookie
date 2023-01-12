<script lang="ts">
	import ContentNarrow from "$lib/components/ContentNarrow.svelte";
	import RecipeLinkCard from "$lib/components/RecipeLinkCard.svelte";
	import { recipes } from "$lib/stores/recipes.js";
</script>

<ContentNarrow title="Nyeste opskrifter">
	<div class="gap-4 grid-list">
		{#each [...$recipes] as [slug, recipe]}
			<RecipeLinkCard {slug} />
		{/each}
	</div>
</ContentNarrow>

<script lang="ts">
	import ContentNarrow from "$lib/components/ContentNarrow.svelte";
	import RecipeLinkCard from "$lib/components/RecipeLinkCard.svelte";
	import { recipes } from "$lib/stores/recipes.js";
	import Head from "$lib/components/Head.svelte";
</script>

<Head/>

<ContentNarrow title="Seneste opskrifter">
	<div class="gap-4 grid-list">
		{#each [...$recipes] as [slug, recipe]}
			<RecipeLinkCard {slug} />
		{/each}
	</div>
</ContentNarrow>

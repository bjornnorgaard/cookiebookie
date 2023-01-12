<script lang="ts">
	import ContentNarrow from "$lib/components/ContentNarrow.svelte";
	import RecipeLinkCard from "$lib/components/RecipeLinkCard.svelte";
	import { recipes } from "$lib/stores/recipes.js";
</script>

<svelte:head>
	<meta name="description" content="Lister af hjemmelavede opskrifter af varierende kvalitet">
</svelte:head>

<ContentNarrow title="Seneste opskrifter">
	<div class="gap-4 grid-list">
		{#each [...$recipes] as [slug, recipe]}
			<RecipeLinkCard {slug} />
		{/each}
	</div>
</ContentNarrow>

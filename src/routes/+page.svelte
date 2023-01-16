<script lang="ts">
	import ContentNarrow from "$lib/components/ContentNarrow.svelte";
	import RecipeLinkCard from "$lib/components/RecipeLinkCard.svelte";
	import { recipes } from "$lib/stores/recipes.js";
</script>

<svelte:head>
	<meta name="description" content="Hjemmelavede opskrifter af kraftigt varierende kvalitet">

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website">
	<meta property="og:url" content="https://www.cookieboogie.dk/">
	<meta property="og:title" content="Cookie Boogie: Bedre opskriter, mindre pis">
	<meta property="og:description" content="Hjemmelavede opskrifter af kraftigt varierende kvalitet">
</svelte:head>

<ContentNarrow title="Seneste opskrifter">
	<div class="gap-4 grid-list">
		{#each [...$recipes] as [slug, recipe]}
			<RecipeLinkCard {slug} />
		{/each}
	</div>
</ContentNarrow>

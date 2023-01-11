<script lang="ts">
	import { page } from "$app/stores";
	import ContentNarrow from "$lib/components/ContentNarrow.svelte";
	import { recipes } from "$lib/stores/recipes";

	const slug = $page.params.slug;
	const r = $recipes.get(slug)
</script>

<ContentNarrow title={r.title}>
	<pre class="mockup-code">{JSON.stringify(r, null, 2)}</pre>
</ContentNarrow>

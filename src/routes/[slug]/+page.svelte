<script lang="ts">
    import { page } from "$app/stores";
    import ContentNarrow from "$lib/components/ContentNarrow.svelte";
    import { recipes } from "$lib/stores/recipes";

    const slug = $page.params.slug;
    const r = $recipes.get(slug);
</script>

<ContentNarrow title={r.title}>
    <img src={r.image} alt="placeholder" class="rounded-lg drop-shadow-lg">
    <p class="m-0">{r.longDesc}</p>

    <h2>Indkøbslisten</h2>

    <div class="gap-4 rounded-lg p-4 drop-shadow-lg grid-list bg-neutral text-neutral-content">
        {#each r.ingredients as i}
            <div class="flex justify-between gap-4">
                <input type="checkbox" class="checkbox bg-neutral-content">
                <span class="grow">{i.name}{i.amount ? `, ${i.amount}` : ""}</span>
            </div>
        {/each}
    </div>

    <h2>Planen</h2>

    <div class="flex flex-col gap-4 rounded-lg p-4 drop-shadow-lg bg-secondary text-secondary-content">
        {#each r.steps as s}
            <div class="flex gap-4">
                <input type="checkbox" class="mt-1 checkbox bg-neutral-content text-neutral-content">
                <div class="flex flex-col">
                    <h4 class="m-0">{s.title}</h4>
                    <p class="m-0">{s.desc}</p>
                </div>
            </div>
        {/each}
    </div>
</ContentNarrow>

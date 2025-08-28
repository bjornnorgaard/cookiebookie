<script lang="ts">

    interface Props {
        title?: string;
        children?: import('svelte').Snippet;
    }

    let { title = "Missing title", children }: Props = $props();
</script>

<div class="m-auto max-w-screen-sm px-4 min-h-content prose py-nav">
    <h1 class="tracking-wide text-base-content">{title}</h1>
    {@render children?.()}
</div>

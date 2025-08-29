<script lang="ts">

    interface Props {
        title?: string;
        children?: import('svelte').Snippet;
    }

    let { title = "Missing title", children }: Props = $props();
</script>

<div class="m-auto max-w-screen-sm px-4 min-h-content prose">
    <h1 class="tracking-wide font-bold text-3xl py-4">{title}</h1>
    {@render children?.()}
</div>

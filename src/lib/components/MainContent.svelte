<script lang="ts">
	interface Props {
		title?: string;
		/** Max width tier. */
		width?: 'narrow' | 'wide';
		children?: import('svelte').Snippet;
	}

	let { title = 'Missing title', width = 'wide', children }: Props = $props();
</script>

<div class="mx-auto px-4 sm:px-6 {width === 'wide' ? 'max-w-6xl' : 'max-w-3xl'}">
	<h1 class="reveal py-6 font-display text-4xl font-semibold leading-tight sm:py-10 sm:text-6xl">{title}</h1>
	{@render children?.()}
</div>

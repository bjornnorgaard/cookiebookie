<script lang="ts">
	import '../app.css';
	import { onNavigate } from '$app/navigation';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const footerLinks = [
		{ href: 'https://github.com/bjornnorgaard/cookiebookie', svg: '/icons/github.svg', alt: 'GitHub' },
		{ href: 'https://www.linkedin.com/in/bjorn-norgaard', svg: '/icons/linkedin.svg', alt: 'LinkedIn' },
		{ href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', svg: '/icons/youtube.svg', alt: 'YouTube' }
	];

	// Cross-fade pages and morph shared elements (recipe photo + title) with the View Transitions API.
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<div class="scroll-progress" aria-hidden="true"></div>

<header class="sticky top-0 z-50">
	<div
		class="header-bg pointer-events-none absolute inset-0 border-b border-surface-300-700 bg-surface-50/80 opacity-0 backdrop-blur-xl dark:bg-surface-950/80"
		aria-hidden="true"
	></div>
	<nav class="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6" aria-label="Hovednavigation">
		<a href="/" class="group flex items-center gap-2 font-display text-xl font-semibold tracking-tight no-underline sm:text-2xl">
			<span class="inline-block transition-transform duration-500 ease-out group-hover:rotate-[-18deg] group-hover:scale-125" aria-hidden="true">🍪</span>
			Cookie Bookie
		</a>
		<p class="m-0 hidden items-center gap-3 font-display text-base italic text-primary-700-300 sm:flex">
			<span class="h-px w-8 bg-primary-500/60" aria-hidden="true"></span>
			Rimelige opskrifter, uden reklamer
		</p>
	</nav>
</header>

<main class="min-h-[70vh]">
	{@render children?.()}
</main>

<footer class="mt-24 border-t border-surface-300-700 pb-[max(2rem,env(safe-area-inset-bottom))] pt-10">
	<div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
		<p class="text-sm opacity-80">
			<span class="font-display text-base font-semibold">Cookie Bookie</span><br />
			Opskrifter by Bear · Rimelige opskrifter siden 2023
		</p>
		<div class="flex items-center gap-2">
			{#each footerLinks as link}
				<a
					href={link.href}
					rel="noopener noreferrer nofollow external"
					target="_blank"
					class="rounded-full p-3 transition duration-300 hover:-translate-y-1 hover:bg-surface-200-800"
					aria-label={link.alt}
				>
					<img src={link.svg} alt="" loading="lazy" class="dark:invert" width="24" height="24" />
				</a>
			{/each}
		</div>
	</div>
</footer>

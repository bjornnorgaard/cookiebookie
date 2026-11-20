<script lang="ts">
	import '../app.css';
	import '../print.css';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { onNavigate } from '$app/navigation';
	import TimerDock from '#lib/components/TimerDock.svelte';
	import { timerState } from '#lib/stores/timers.svelte.ts';
	import ConsentNotice from '#lib/components/ConsentNotice.svelte';
	import { openConsent } from '#lib/stores/consent.svelte.ts';
	import ThemeToggle from '#lib/components/ThemeToggle.svelte';
	import ThemeFollowDevice from '#lib/components/ThemeFollowDevice.svelte';
	import { initTheme } from '#lib/stores/theme.svelte.ts';
	import { initWake, setKeepAwake, wake } from '#lib/stores/wakeLock.svelte.ts';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const footerLinks = [
		{ href: 'https://github.com/bjornnorgaard/cookiebookie', svg: '/icons/github.svg', alt: 'GitHub' },
		{ href: 'https://www.linkedin.com/in/bjorn-norgaard', svg: '/icons/linkedin.svg', alt: 'LinkedIn' },
		{ href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', svg: '/icons/youtube.svg', alt: 'YouTube' }
	];

	onMount(initWake);
	onMount(initTheme);

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
		<div class="flex items-center gap-4">
			{#if wake.supported && wake.enabled && wake.viewing}
				<button
					type="button"
					class="awake-pill"
					onclick={() => setKeepAwake(false)}
					aria-label="Skærmen holdes tændt. Tryk for at slå fra"
					transition:fly={{ y: -8, duration: 300 }}
				>
					<span class="dot" class:on={wake.active} aria-hidden="true"></span>
					<span class="hidden sm:inline">Skærm tændt</span>
					<span aria-hidden="true" class="opacity-60">✕</span>
				</button>
			{/if}
			<p class="m-0 hidden items-center gap-3 font-display text-base italic text-primary-700-300 sm:flex">
				<span class="h-px w-8 bg-primary-500/60" aria-hidden="true"></span>
				Rimelige opskrifter, uden reklamer
			</p>
			<ThemeToggle />
		</div>
	</nav>
</header>

<main class="min-h-[70vh]">
	{@render children?.()}
</main>

<footer class="mt-24 border-t {timerState.list.length ? 'mb-56' : ''} border-surface-300-700 pb-[max(2rem,env(safe-area-inset-bottom))] pt-10">
	<div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
		<p class="text-sm opacity-80">
			<span class="font-display text-base font-semibold">Cookie Bookie</span><br />
			Opskrifter by Bear · Rimelige opskrifter siden 2023<br />
			<a href="/privatliv" class="underline underline-offset-2">Privatliv</a> ·
			<button type="button" class="underline underline-offset-2" onclick={openConsent}>Privatlivsindstillinger</button>
		</p>
		<ThemeFollowDevice />
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

<ConsentNotice />
<TimerDock />

<style>
	.awake-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.8rem;
		border-radius: 9999px;
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		color: var(--color-warning-900-100, inherit);
		background: color-mix(in oklab, var(--color-warning-500) 26%, transparent);
		border: 1px solid color-mix(in oklab, var(--color-warning-500) 55%, transparent);
		transition: background-color 200ms, transform 200ms;
	}
	.awake-pill:hover {
		background: color-mix(in oklab, var(--color-warning-500) 40%, transparent);
	}
	.awake-pill:active {
		transform: scale(0.96);
	}
	.dot {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 9999px;
		background: color-mix(in oklab, var(--color-warning-500) 50%, transparent);
	}
	.dot.on {
		background: var(--color-warning-500);
		animation: glow 2.4s ease-in-out infinite;
	}
	@keyframes glow {
		0%, 100% { box-shadow: 0 0 0 0 color-mix(in oklab, var(--color-warning-500) 60%, transparent); }
		50% { box-shadow: 0 0 0 6px transparent; }
	}
</style>

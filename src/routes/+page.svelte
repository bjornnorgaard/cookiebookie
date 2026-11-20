<script lang="ts">
	import Head from '#lib/components/Head.svelte';
	import RecipeImage from '#lib/components/RecipeImage.svelte';
	import { formatDuration } from '#lib/format.ts';

	let { data } = $props();

	const featured = $derived(data.recipes[0]);
	const rest = $derived(data.recipes.slice(1));
</script>

<Head />

<div class="mx-auto max-w-6xl px-4 sm:px-6">
	<section class="pb-8 pt-6 sm:pb-12 sm:pt-12">
		<p class="reveal mb-3 inline-flex items-center gap-2 rounded-full bg-primary-500/15 px-3 py-1 text-sm font-medium text-primary-700-300">
			Rimelige opskrifter siden 2023
		</p>
		<h1 class="reveal max-w-3xl font-display text-5xl font-semibold leading-[1.05] sm:text-7xl" style="--i:1">
			Seneste opskrifter
		</h1>
		<p class="reveal mt-5 max-w-2xl text-lg opacity-80 sm:text-xl" style="--i:2">
			Simple opskrifter uden lange oprindelseshistorier og uden irriterende reklamer. Skrevet så det er let at følge,
			og forhåbentlig lidt morsomt.
		</p>
	</section>

	<!-- Featured -->
	<a
		href="/{featured.slug}"
		class="group reveal-move tile grid overflow-hidden rounded-3xl no-underline shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-2xl lg:grid-cols-[1.35fr_1fr]"
		style="--i:3"
	>
		<RecipeImage
			slug={featured.slug}
			alt={featured.title}
			sizes="(min-width: 1152px) 680px, (min-width: 1024px) 56vw, 100vw"
			priority
			class="lg:h-full lg:aspect-auto!"
			transitionName="hero-{featured.slug}"
		/>
		<div class="flex flex-col justify-center gap-4 p-6 sm:p-10">
			<span class="text-sm font-semibold uppercase tracking-widest text-primary-700-300">Nyeste opskrift</span>
			<h2 class="font-display text-3xl font-semibold leading-tight sm:text-4xl" style:view-transition-name="title-{featured.slug}">
				{featured.title}
			</h2>
			<p class="line-clamp-3 opacity-80">{featured.shortDesc}</p>
			<div class="flex flex-wrap gap-2">
				<span class="badge preset-tonal-primary">⏱ {formatDuration(featured.totalTime)}</span>
				<span class="badge preset-tonal">{featured.cuisine}</span>
				<span class="badge preset-tonal">{featured.yield} portioner</span>
			</div>
			<span class="mt-2 inline-flex items-center gap-2 font-semibold text-primary-700-300">
				Se opskriften
				<span class="transition-transform duration-300 group-hover:translate-x-2" aria-hidden="true">→</span>
			</span>
		</div>
	</a>

	<!-- Grid -->
	<ul class="mt-8 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
		{#each rest as recipe, i (recipe.slug)}
			<li class="contents">
				<a
					href="/{recipe.slug}"
					class="group tile flex flex-col overflow-hidden rounded-2xl no-underline shadow-sm transition duration-500 hover:-translate-y-1.5 hover:shadow-xl {i < 3 ? 'reveal' : 'reveal-on-scroll'}"
					style="--i:{i + 4}"
				>
					<RecipeImage
						slug={recipe.slug}
						alt={recipe.title}
						sizes="(min-width: 1152px) 368px, (min-width: 640px) 45vw, 100vw"
						priority={false}
						transitionName="hero-{recipe.slug}"
					/>
					<div class="flex flex-1 flex-col gap-2 p-5">
						<h2 class="font-display text-xl font-semibold leading-snug" style:view-transition-name="title-{recipe.slug}">
							{recipe.title}
						</h2>
						<p class="line-clamp-2 text-sm opacity-75">{recipe.shortDesc}</p>
						<div class="mt-auto flex flex-wrap gap-2 pt-3">
							<span class="badge preset-tonal-primary">⏱ {formatDuration(recipe.totalTime)}</span>
							<span class="badge preset-tonal">{recipe.cuisine}</span>
						</div>
					</div>
				</a>
			</li>
		{/each}
	</ul>
</div>

<style>
	/* The featured card holds the LCP image: its entrance may slide but must never start from opacity 0. */
	.reveal-move {
		animation: rise-move 800ms var(--ease-out-expo) backwards;
		animation-delay: calc(var(--i, 0) * 70ms);
	}
	@keyframes rise-move {
		from { transform: translateY(18px); }
	}
	@media (prefers-reduced-motion: reduce) {
		.reveal-move { animation: none; }
	}
</style>

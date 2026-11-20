<script lang="ts">
	import { page } from '$app/state';
	import Head from '#lib/components/Head.svelte';
	import RecipeImage from '#lib/components/RecipeImage.svelte';
	import { recipes } from '#lib/data/recipes.ts';

	const status = $derived(page.status);
	const isNotFound = $derived(status === 404);
	const suggestions = recipes.slice(0, 3);
</script>

<Head
	noindex={isNotFound}
	titleOverride={isNotFound ? 'Side ikke fundet | Cookie Bookie' : 'Noget gik galt | Cookie Bookie'}
	descriptionOverride={isNotFound
		? 'Siden du leder efter findes ikke. Gå tilbage til forsiden og find en opskrift i stedet.'
		: 'Der skete en fejl. Gå tilbage til forsiden og prøv igen.'}
/>

<section class="mx-auto max-w-3xl px-4 pb-8 pt-10 text-center sm:px-6 sm:pt-20">
	<!-- 4🍪4: the cookie rolls in and then wobbles. -->
	<div class="reveal flex items-center justify-center gap-1 font-display font-semibold leading-none sm:gap-3" aria-hidden="true">
		<span class="text-[6.5rem] font-extrabold text-primary-500 sm:text-[11rem]" style="font-variation-settings: 'opsz' 24">{String(status)[0]}</span>
		<svg class="cookie size-[5.5rem] sm:size-40" viewBox="0 0 120 120" fill="none">
			<path
				d="M60 8a52 52 0 1 0 52 52 18 18 0 0 1-20-22 18 18 0 0 1-22-20A52 52 0 0 0 60 8Z"
				fill="var(--color-primary-400)"
				stroke="var(--color-primary-700)"
				stroke-width="4"
				stroke-linejoin="round"
			/>
			<g fill="var(--color-primary-900)">
				<circle cx="40" cy="42" r="6" />
				<circle cx="72" cy="30" r="4.5" />
				<circle cx="30" cy="72" r="5" />
				<circle cx="62" cy="64" r="7" />
				<circle cx="86" cy="84" r="5.5" />
				<circle cx="50" cy="92" r="4.5" />
			</g>
		</svg>
		<span class="text-[6.5rem] font-extrabold text-primary-500 sm:text-[11rem]" style="font-variation-settings: 'opsz' 24">{String(status)[2] ?? ''}</span>
	</div>

	<h1 class="reveal mt-6 font-display text-3xl font-semibold sm:text-5xl" style="--i:1">
		{isNotFound ? 'Du er vist faret vild' : 'Noget gik galt i køkkenet'}
	</h1>

	<p class="reveal mx-auto mt-4 max-w-xl text-lg opacity-80" style="--i:2">
		{#if isNotFound}
			Jeg har naturligvis forudset, at du ville gå ud hvor du ikke kunne bunde. Har endda lavet en lille knap til dig, så
			du kan komme tilbage i sikkerhed.
		{:else}
			Der røg noget i bunden. Prøv igen om lidt, eller gå tilbage til forsiden.
		{/if}
	</p>

	<div class="reveal mt-8" style="--i:3">
		<a href="/" class="btn preset-filled-primary-500 no-underline transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
			Gå til Forsiden
		</a>
	</div>
</section>

{#if isNotFound}
	<section class="mx-auto max-w-6xl px-4 pt-10 sm:px-6" aria-labelledby="forslag">
		<h2 id="forslag" class="reveal mb-6 text-center font-display text-2xl font-semibold" style="--i:4">
			Sulten alligevel? Prøv en af disse
		</h2>
		<ul class="m-0 grid list-none gap-5 p-0 sm:grid-cols-3">
			{#each suggestions as recipe, i (recipe.slug)}
				<li class="contents">
					<a
						href="/{recipe.slug}"
						class="group tile reveal flex flex-col overflow-hidden rounded-2xl no-underline transition duration-500 hover:-translate-y-1.5 hover:shadow-xl"
						style="--i:{i + 5}"
					>
						<RecipeImage
							slug={recipe.slug}
							alt={recipe.title}
							sizes="(min-width: 1152px) 368px, (min-width: 640px) 30vw, 100vw"
						/>
						<span class="p-4 font-display text-lg font-semibold">{recipe.title}</span>
					</a>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.cookie {
		animation:
			roll-in 1100ms cubic-bezier(0.16, 1, 0.3, 1) backwards,
			wobble 5s ease-in-out 1.2s infinite;
		filter: drop-shadow(0 10px 14px rgb(120 60 10 / 0.35));
	}
	@keyframes roll-in {
		from {
			transform: translateX(-140%) rotate(-540deg);
			opacity: 0;
		}
	}
	@keyframes wobble {
		0%,
		100% {
			transform: rotate(0);
		}
		50% {
			transform: rotate(14deg) translateY(-4px);
		}
	}
</style>

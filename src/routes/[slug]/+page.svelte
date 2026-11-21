<script lang="ts">
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import KeepAwake from '#lib/components/KeepAwake.svelte';
	import { setViewingRecipe } from '#lib/stores/wakeLock.svelte.ts';
	import { Progress } from '@skeletonlabs/skeleton-svelte';
	import Head from '#lib/components/Head.svelte';
	import RecipeImage from '#lib/components/RecipeImage.svelte';
	import StepTimers from '#lib/components/StepTimers.svelte';
	import ShoppingList from '#lib/components/ShoppingList.svelte';
	import ShareActions from '#lib/components/ShareActions.svelte';
	import PrintSheet from '#lib/components/PrintSheet.svelte';
	import { formatDuration, isoDate, longDate } from '#lib/format.ts';
	import { renderStepText } from '#lib/scale.ts';
	import { Portions, setPortions } from '#lib/stores/portions.svelte.ts';
	import { page } from '$app/state';
	import { pushState } from '$app/navigation';
	import { Steps, setSteps } from '#lib/stores/steps.svelte.ts';

	let { data } = $props();
	const recipe = $derived(data.recipe);
	const portions = setPortions(new Portions(() => recipe));

	onMount(() => {
		setViewingRecipe(true);
		return () => setViewingRecipe(false);
	});

	const steps = setSteps(new Steps(() => recipe));
	const doneCount = $derived(steps.doneCount);
	const current = $derived(steps.current);
	const allDone = $derived(steps.allDone);

	function setStep(i: number, checked: boolean) {
		steps.set(i, checked);
		nudge(i);
	}

	// After ticking a step, bring the next one into view if it is below the fold.
	function nudge(i: number) {
		const next = document.getElementById(`step${i + 2}`);
		if (!next || !steps.done[i]) return;
		const rect = next.getBoundingClientRect();
		if (rect.bottom > window.innerHeight - 24) {
			next.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}

	// Cook mode is code-split: the component is fetched the first time it is wanted. Open state lives in the
	// shallow history entry (`#cook`), so the browser's Back button closes it.
	let CookMode: typeof import('#lib/components/CookMode.svelte').default | undefined = $state();
	const cookOpen = $derived(!!page.state.cook);

	async function startCook() {
		CookMode ??= (await import('#lib/components/CookMode.svelte')).default;
		pushState('#cook', { cook: true });
	}

	function closeCook() {
		if (page.state.cook) history.back();
	}

	const facts = $derived([
		{ label: 'Forberedelse', value: formatDuration(recipe.prepTime) },
		{ label: 'Tilberedning', value: formatDuration(recipe.cookTime) },
		{ label: 'I alt', value: formatDuration(recipe.totalTime) },
		{ label: 'Portioner', value: String(portions.count) }
	]);
</script>

<Head {recipe} />

<article class="mx-auto max-w-6xl px-4 sm:px-6">
	<nav aria-label="Brødkrummer" class="reveal pt-4 text-sm opacity-75">
		<a href="/" class="hover:underline">Forside</a>
		<span aria-hidden="true" class="px-1">›</span>
		<span aria-current="page">{recipe.title}</span>
	</nav>

	<header class="mx-auto max-w-3xl pb-6 pt-4 text-center sm:pb-10 sm:pt-8">
		<div class="reveal mb-4 flex flex-wrap justify-center gap-2" style="--i:1">
			<span class="badge preset-filled-primary-500">{recipe.cuisine}</span>
			{#each recipe.categories as c}
				<span class="badge preset-tonal">{c}</span>
			{/each}
		</div>
		<h1
			class="reveal font-display text-4xl font-semibold leading-[1.08] sm:text-6xl"
			style="--i:2"
			style:view-transition-name="title-{recipe.slug}"
		>
			{recipe.title}
		</h1>
		<p class="reveal mt-4 text-sm opacity-70" style="--i:3">
			Af {recipe.author} · <time datetime={isoDate(recipe.datePublished)}>{longDate(recipe.datePublished)}</time>
		</p>
	</header>

	<RecipeImage
		slug={recipe.slug}
		kind="hero"
		alt={recipe.title}
		sizes="(min-width: 1152px) 1104px, 100vw"
		priority
		class="parallax rounded-3xl shadow-2xl"
		transitionName="hero-{recipe.slug}"
	/>

	<dl class="reveal not-prose mx-auto -mt-8 grid w-[calc(100%-2rem)] max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-surface-300-700 shadow-xl ring-1 ring-surface-300-700 sm:grid-cols-4 relative" style="--i:4">
		{#each facts as f}
			<div class="bg-surface-50-950 px-4 py-4 text-center">
				<dt class="text-xs uppercase tracking-wider opacity-60">{f.label}</dt>
				<dd class="m-0 mt-1 font-display text-xl font-semibold">{f.value}</dd>
			</div>
		{/each}
	</dl>

	<div class="print-host">
		<ShareActions {recipe} />
		<PrintSheet {recipe} />
	</div>

	<div class="prose mx-auto mt-10 max-w-3xl dark:prose-invert sm:prose-lg">
		<p class="lead text-xl! font-medium text-inherit!">{recipe.shortDesc}</p>
		<p class="text-inherit!">{recipe.longDesc}</p>
	</div>

	<div class="mt-10 text-center">
		<button type="button" class="btn btn-lg preset-filled-primary-500" data-testid="start-cook" onclick={startCook}>
			<span aria-hidden="true">🍳</span> Start madlavning
		</button>
	</div>

	<div class="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
		<section class="reveal-on-scroll lg:sticky lg:top-24" aria-labelledby="indkoeb">
			<h2 id="indkoeb" class="font-display text-3xl font-semibold">
				Indkøbslisten
				<span class="mt-2 block h-1 w-12 rounded-full bg-primary-500"></span>
			</h2>
			<div class="panel mt-5 overflow-hidden rounded-3xl" style="--panel-accent: var(--color-primary-500)">
				{#key recipe.slug}
					<ShoppingList {recipe} />
				{/key}
			</div>
		</section>

		<section class="reveal-on-scroll" aria-labelledby="planen">
			<h2 id="planen" class="font-display text-3xl font-semibold">
				Planen
				<span class="mt-2 block h-1 w-12 rounded-full bg-secondary-500"></span>
			</h2>

			<div class="mt-5"><KeepAwake /></div>


			<div class="mt-4">
				<Progress value={doneCount} max={recipe.steps.length}>
					<div class="mb-2 flex justify-between text-sm opacity-75">
						<Progress.Label>Fremgang</Progress.Label>
						<span aria-live="polite">{doneCount} af {recipe.steps.length} trin</span>
					</div>
					<Progress.Track class="h-2 overflow-hidden rounded-full">
						<Progress.Range class="bg-secondary-500 transition-[width] duration-700 ease-out" />
					</Progress.Track>
				</Progress>
			</div>

			<ol class="m-0 mt-5 flex list-none flex-col gap-3 p-0" style="--panel-accent: var(--color-secondary-500)">
				{#each recipe.steps as s, i}
					{@const done = steps.done[i]}
					<li
						id={'step' + (i + 1)}
						class="panel step scroll-mt-24 rounded-2xl transition duration-500 {done ? 'opacity-85' : 'hover:-translate-y-0.5'}"
						class:is-current={i === current}
					>
						<label for="step-check-{i}" class="flex cursor-pointer flex-col gap-2 p-4 transition-opacity sm:p-5" class:line-through={done}>
							<span class="flex items-center gap-4">
								<input
									id="step-check-{i}"
									type="checkbox"
									checked={!!done}
									onchange={(e) => setStep(i, e.currentTarget.checked)}
									class="tick round shrink-0"
									style="--tick: var(--color-secondary-500)"
								/>
								<span class="flex min-w-0 flex-col gap-0.5">
									<span class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest leading-none {i === current ? 'text-secondary-950-300' : 'opacity-85'}">
										Trin {i + 1}
										{#if i === current}
											<span class="badge preset-filled-secondary-500 normal-case tracking-normal" in:scale={{ start: 0.7, duration: 350 }}>
												{doneCount === 0 ? 'Start her' : 'Næste'}
											</span>
										{/if}
									</span>
									<span class="font-display text-lg font-semibold leading-snug">{s.title}</span>
								</span>
							</span>
							<span class="block font-normal opacity-85">{renderStepText(s.desc, recipe.ingredients, portions.scaling)}</span>
						</label>
						{#if s.timers?.length}
							<StepTimers {recipe} stepIndex={i} stepTitle={s.title} timers={s.timers} />
						{/if}
					</li>
				{/each}
			</ol>

			{#if allDone}
				<div
					in:scale={{ start: 0.8, duration: 500 }}
					class="mt-6 rounded-3xl bg-success-500/15 p-6 text-center font-display text-2xl font-semibold ring-1 ring-success-500/40"
					role="status"
				>
					🍽 Velbekomme!
				</div>
			{/if}
		</section>
	</div>

	<div class="mt-16 text-center">
		<a href="/" class="btn preset-tonal no-underline transition duration-300 hover:-translate-x-1">← Flere opskrifter</a>
	</div>
</article>

{#if CookMode && cookOpen}
	<CookMode {recipe} onclose={closeCook} />
{/if}

<script lang="ts">
	// Cook mode: one step at a time in large type, in a native <dialog>. It owns no recipe state: step progress comes from
	// the page's Steps store, portions from the Portions store, ticks from the shopping list store, timers from the timer
	// store. Opened and closed by the page (history entry `#cook`); `onclose` asks the page to close it.
	import { onMount, tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import type { Recipe } from '#lib/types/recipe.ts';
	import PortionStepper from '#lib/components/PortionStepper.svelte';
	import StepTimers from '#lib/components/StepTimers.svelte';
	import { formatAmount, renderStepText } from '#lib/scale.ts';
	import { getPortions } from '#lib/stores/portions.svelte.ts';
	import { getSteps } from '#lib/stores/steps.svelte.ts';
	import { localStorageStore } from '#lib/stores/localStorageStore.ts';
	import { setForceAwake } from '#lib/stores/wakeLock.svelte.ts';
	import { timerState } from '#lib/stores/timers.svelte.ts';
	import { formatRemaining, remainingAt, timerStatus } from '#lib/timerMath.ts';

	interface Props {
		recipe: Recipe;
		onclose: () => void;
	}

	let { recipe, onclose }: Props = $props();
	const portions = getPortions();
	const steps = getSteps();
	const have = localStorageStore<string[]>('shopping_list', []);

	const last = $derived(recipe.steps.length - 1);
	// Start at the first unfinished step (or the beginning when everything is already ticked).
	let idx = $state(Math.max(0, steps.current));
	let dir = $state(1);
	const step = $derived(recipe.steps[idx]);
	const nextStep = $derived(recipe.steps[idx + 1]);

	let dialog: HTMLDialogElement;
	let heading = $state<HTMLElement>();
	let opener: Element | null = null;

	// ---- text size (remembered) -------------------------------------------------------------------------------------
	const SIZES = ['s', 'm', 'l'] as const;
	type Size = (typeof SIZES)[number];
	const SIZE_KEY = 'cook_text_size';
	let size = $state<Size>('m');
	function setSize(s: Size) {
		size = s;
		try {
			localStorage.setItem(SIZE_KEY, s);
		} catch {
			/* not remembered */
		}
	}
	const sizeIdx = $derived(SIZES.indexOf(size));

	// ---- layout -----------------------------------------------------------------------------------------------------
	let wide = $state(false);
	let drawer = $state(false);
	const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

	onMount(() => {
		opener = document.activeElement;
		try {
			const saved = localStorage.getItem(SIZE_KEY);
			if (saved === 's' || saved === 'm' || saved === 'l') size = saved;
		} catch {
			/* default */
		}
		const mq = matchMedia('(min-width: 900px) and (orientation: landscape)');
		wide = mq.matches;
		const onMq = () => (wide = mq.matches);
		mq.addEventListener('change', onMq);

		dialog.showModal();
		heading?.focus();
		setForceAwake(true);
		const html = document.documentElement;
		const overflow = html.style.overflow;
		html.style.overflow = 'hidden';

		return () => {
			mq.removeEventListener('change', onMq);
			setForceAwake(false);
			html.style.overflow = overflow;
			if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
		};
	});

	// ---- navigation -------------------------------------------------------------------------------------------------
	async function go(to: number, d: number) {
		if (to < 0 || to > last || to === idx) return;
		dir = d;
		idx = to;
		drawer = false;
		await tick();
		heading?.focus();
		dialog.querySelector('.stage')?.scrollTo({ top: 0 });
	}

	function next() {
		steps.set(idx, true); // same ripple rule as the page: earlier steps are done too
		if (idx < last) void go(idx + 1, 1);
		else onclose();
	}

	function prev() {
		if (idx === 0) return;
		steps.set(idx - 1, false); // un-ticks the step we go back to and everything after it
		void go(idx - 1, -1);
	}

	function onKey(e: KeyboardEvent) {
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		const t = e.target as HTMLElement;
		if (t.matches('input, textarea, select')) return;
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			next();
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			prev();
		} else if (e.key === ' ' && (t === dialog || t === heading)) {
			e.preventDefault();
			next();
		}
	}

	// Esc: close the ingredient drawer first, then cook mode. The page owns history, so cancel the native close.
	function onCancel(e: Event) {
		e.preventDefault();
		if (drawer) drawer = false;
		else onclose();
	}

	// ---- swipe ------------------------------------------------------------------------------------------------------
	let start: { x: number; y: number; t: number } | null = null;
	const NO_SWIPE = 'input, textarea, select, a, button, [data-no-swipe]';

	function down(e: PointerEvent) {
		start = (e.target as HTMLElement).closest(NO_SWIPE) ? null : { x: e.clientX, y: e.clientY, t: e.timeStamp };
	}

	function up(e: PointerEvent) {
		if (!start) return;
		const dx = e.clientX - start.x;
		const dy = e.clientY - start.y;
		const quick = e.timeStamp - start.t < 900;
		start = null;
		if (!quick) return;
		if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
			if (dx < 0) next();
			else prev();
		} else if (dy < -70 && Math.abs(dy) > Math.abs(dx) * 1.5 && !wide) {
			drawer = true; // swipe up from the bottom bar
		}
	}

	// ---- ingredients ------------------------------------------------------------------------------------------------
	const toggle = (name: string) => have.update((list) => (list.includes(name) ? list.filter((n) => n !== name) : [...list, name]));
	const ingredientsOpen = $derived(wide || drawer);
	const ingDone = $derived(recipe.ingredients.filter((i) => $have.includes(i.name)).length);

	const text = $derived(renderStepText(step.desc, recipe.ingredients, portions.scaling));
	const timersRunning = $derived([...timerState.list].sort((a, b) => remainingAt(a, timerState.now) - remainingAt(b, timerState.now)));
</script>

<dialog
	bind:this={dialog}
	class="cook"
	class:wide
	data-size={size}
	data-testid="cook-mode"
	aria-label="Madlavning: {recipe.title}"
	aria-modal="true"
	oncancel={onCancel}
	onkeydown={onKey}
>
	<header class="bar">
		<p class="m-0 min-w-0 grow truncate font-display text-lg font-semibold">{recipe.title}</p>
		<div class="flex items-center gap-1" role="group" aria-label="Tekststørrelse" data-testid="cook-size">
			<button type="button" class="ctl" aria-label="Mindre tekst" disabled={sizeIdx === 0} onclick={() => setSize(SIZES[sizeIdx - 1])}>A−</button>
			<button type="button" class="ctl" aria-label="Større tekst" disabled={sizeIdx === SIZES.length - 1} onclick={() => setSize(SIZES[sizeIdx + 1])}>A+</button>
		</div>
		{#if !wide}
			<button type="button" class="ctl" aria-expanded={drawer} aria-controls="cook-ingredients" onclick={() => (drawer = !drawer)} data-testid="cook-drawer-toggle">
				<span aria-hidden="true">🧺</span> <span class="sr-only sm:not-sr-only">Ingredienser</span>
			</button>
		{/if}
		<button type="button" class="ctl" aria-label="Luk madlavning" onclick={onclose} data-testid="cook-close">✕</button>
	</header>

	<div class="dots" role="group" aria-label="Trin">
		{#each recipe.steps as s, i}
			<button
				type="button"
				class="dot-btn"
				aria-label="Gå til trin {i + 1}: {s.title}"
				aria-current={i === idx ? 'step' : undefined}
				onclick={() => go(i, i > idx ? 1 : -1)}
			>
				<span class="dot" class:done={steps.done[i]} class:now={i === idx}></span>
			</button>
		{/each}
	</div>

	<div class="body">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="stage" onpointerdown={down} onpointerup={up} onpointercancel={() => (start = null)} data-testid="cook-stage">
			{#key idx}
				<div class="step" in:fly={{ x: reduced() ? 0 : dir * 56, duration: reduced() ? 0 : 260 }}>
					<p class="count" aria-hidden="true">Trin {idx + 1} af {recipe.steps.length}</p>
					<h2 bind:this={heading} tabindex="-1" class="title" aria-label="Trin {idx + 1} af {recipe.steps.length}: {step.title}">
						{step.title}
					</h2>
					<p class="desc" data-testid="cook-desc">{text}</p>
					{#if step.timers?.length}
						<div class="mt-6">
							<StepTimers {recipe} stepIndex={idx} stepTitle={step.title} timers={step.timers} large />
						</div>
					{/if}
					{#if nextStep}
						<p class="preview" data-testid="cook-preview">Næste: {nextStep.title}</p>
					{/if}
				</div>
			{/key}
		</div>

		<aside id="cook-ingredients" class="ings" class:open={ingredientsOpen} inert={!ingredientsOpen} aria-label="Ingredienser" data-testid="cook-ingredients">
			<div class="flex items-center justify-between px-5 pt-4">
				<h2 class="m-0 font-display text-xl font-semibold">Ingredienser</h2>
				<span class="badge preset-tonal-primary tabular-nums">{ingDone}/{recipe.ingredients.length}</span>
			</div>
			<PortionStepper />
			<ul class="m-0 list-none p-2">
				{#each recipe.ingredients as ing, n}
					{@const checked = $have.includes(ing.name)}
					{@const amount = formatAmount(ing, portions.scaling)}
					<li>
						<label for="cook-ing-{n}" class="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3 py-2" class:line-through={checked}>
							<input id="cook-ing-{n}" type="checkbox" class="tick" {checked} onchange={() => toggle(ing.name)} />
							<span class:opacity-60={checked}>
								<span class="font-semibold">{ing.name}</span>{#if amount}<span class="opacity-80">, {amount}</span>{/if}
							</span>
						</label>
					</li>
				{/each}
			</ul>
		</aside>
	</div>

	{#if timersRunning.length}
		<ul class="timers" aria-label="Kørende timere" data-testid="cook-timers">
			{#each timersRunning as t (t.id)}
				{@const status = timerStatus(t)}
				<li class="timer-pill" class:done={status === 'done'}>
					<span class="truncate">{t.label}</span>
					<time class="tabular-nums font-semibold">{status === 'done' ? 'Færdig!' : formatRemaining(remainingAt(t, timerState.now))}</time>
					{#if status === 'paused'}<span class="text-sm">(sat på pause)</span>{/if}
				</li>
			{/each}
		</ul>
	{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="nav" onpointerdown={down} onpointerup={up}>
		<button type="button" class="nav-btn preset-tonal" onclick={prev} disabled={idx === 0} data-testid="cook-prev">← Forrige</button>
		<button type="button" class="nav-btn preset-filled-primary-500" onclick={next} data-testid="cook-next">
			{idx === last ? 'Færdig 🍽' : 'Næste →'}
		</button>
	</div>
</dialog>

<style>
	.cook {
		--cook-fs: 1.625rem;
		position: fixed;
		inset: 0;
		width: 100%;
		max-width: none;
		height: 100dvh;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		overflow: hidden;
		/* Body text is at least 12:1 against the background in both themes (AAA). Colours follow html[data-mode]. */
		color: light-dark(oklch(19% 0.02 55), oklch(96% 0.01 85));
		background: light-dark(oklch(98.5% 0.01 85), oklch(20% 0.03 55));
		animation: cook-in 260ms var(--ease-out-expo, ease-out);
	}
	.cook[open] {
		display: flex;
		flex-direction: column;
	}
	.cook[data-size='s'] { --cook-fs: 1.375rem; }
	.cook[data-size='l'] { --cook-fs: 2rem; }
	.cook::backdrop { background: transparent; }
	@keyframes cook-in {
		from { opacity: 0; transform: scale(0.97); }
	}

	.bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem 0.25rem 1rem;
		padding-top: max(0.5rem, env(safe-area-inset-top));
	}
	.ctl {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		min-width: 48px;
		min-height: 48px;
		padding: 0 0.75rem;
		border-radius: 9999px;
		font-size: 1.0625rem;
		font-weight: 700;
		cursor: pointer;
		color: inherit;
		background: color-mix(in oklab, currentColor 10%, transparent);
	}
	.ctl:hover:not(:disabled) { background: color-mix(in oklab, currentColor 20%, transparent); }
	.ctl:disabled { opacity: 0.4; cursor: default; }
	:is(.ctl, .dot-btn, .nav-btn):focus-visible { outline: 3px solid var(--color-primary-500); outline-offset: 2px; }
	.title:focus { outline: none; }

	.dots {
		display: flex;
		padding: 0 0.75rem;
	}
	.dot-btn {
		flex: 1 1 0;
		min-width: 1.5rem;
		max-width: 3rem;
		min-height: 48px;
		display: grid;
		place-items: center;
		cursor: pointer;
		color: inherit;
	}
	.dot {
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 9999px;
		border: 2px solid currentColor;
		transition: width 200ms, background-color 200ms;
	}
	.dot.done { background: currentColor; }
	.dot.now { width: 1.6rem; border-color: var(--color-primary-500); background: var(--color-primary-500); }

	.body {
		position: relative;
		flex: 1 1 0;
		min-height: 0;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}
	.stage {
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
		touch-action: pan-y;
		padding: 0.5rem 1.25rem 1rem;
	}
	.step { max-width: 46rem; margin: 0 auto; }
	.count { margin: 0.5rem 0 0; font-size: 0.9375rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.8; }
	.title { margin: 0.25rem 0 0.75rem; font-family: var(--font-display, inherit); font-size: calc(var(--cook-fs) * 1.2); font-weight: 600; line-height: 1.15; }
	.desc { margin: 0; font-size: var(--cook-fs); line-height: 1.5; }
	.preview { margin: 2rem 0 0; font-size: 1.0625rem; color: color-mix(in oklab, currentColor 72%, transparent); }

	.ings {
		position: absolute;
		inset: auto 0 0 0;
		max-height: 80%;
		overflow-y: auto;
		z-index: 2;
		border-radius: 1.5rem 1.5rem 0 0;
		background: light-dark(oklch(95% 0.03 80), oklch(26% 0.035 55));
		box-shadow: 0 -12px 40px -8px rgb(0 0 0 / 0.35);
		transform: translateY(105%);
		visibility: hidden;
		transition: transform 280ms var(--ease-out-expo, ease-out), visibility 0s linear 280ms;
	}
	.ings.open { transform: none; visibility: visible; transition-delay: 0s; }

	.wide .body { grid-template-columns: minmax(0, 1.5fr) minmax(20rem, 1fr); }
	.wide .ings {
		position: static;
		transform: none;
		visibility: visible;
		max-height: none;
		border-radius: 0;
		box-shadow: none;
		border-left: 1px solid color-mix(in oklab, currentColor 20%, transparent);
	}

	.timers {
		display: flex;
		gap: 0.5rem;
		margin: 0;
		padding: 0.5rem 1rem;
		list-style: none;
		overflow-x: auto;
	}
	.timer-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		flex: none;
		min-height: 2.75rem;
		padding: 0.25rem 1rem;
		border-radius: 9999px;
		font-size: 1rem;
		background: color-mix(in oklab, var(--color-secondary-500) 28%, transparent);
		border: 1px solid var(--color-secondary-500);
	}
	.timer-pill.done { background: color-mix(in oklab, var(--color-success-500) 35%, transparent); border-color: var(--color-success-500); }

	.nav {
		display: grid;
		grid-template-columns: 1fr 1.4fr;
		gap: 0.75rem;
		padding: 0.5rem 1rem;
		padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
		touch-action: pan-y;
	}
	.nav-btn {
		min-height: 64px;
		border-radius: 1rem;
		font-size: 1.25rem;
		font-weight: 700;
		cursor: pointer;
	}
	.nav-btn:disabled { opacity: 0.4; cursor: default; }

	@media (prefers-reduced-motion: reduce) {
		.cook { animation: none; }
		.ings, .dot { transition: none; }
	}
</style>

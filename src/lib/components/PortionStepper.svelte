<script lang="ts">
	import { onDestroy } from 'svelte';
	import { PORTION_PRESETS } from '#lib/scale.ts';
	import { getPortions } from '#lib/stores/portions.svelte.ts';

	const portions = getPortions();

	// Long-press repeats: first step at once, then every 120 ms after a short hold.
	let hold: ReturnType<typeof setTimeout> | undefined;
	let repeat: ReturnType<typeof setInterval> | undefined;

	function stop() {
		clearTimeout(hold);
		clearInterval(repeat);
	}

	function start(delta: number) {
		stop();
		portions.step(delta);
		hold = setTimeout(() => (repeat = setInterval(() => portions.step(delta), 110)), 450);
	}

	function down(e: PointerEvent, delta: number) {
		if (e.button !== 0) return;
		// Capture keeps the hold alive if the layout shifts under the finger.
		(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
		start(delta);
	}

	// Keyboard activation arrives as a click without a pointer (detail 0); pointer clicks are handled on pointerdown.
	function key(e: MouseEvent, delta: number) {
		if (e.detail === 0) portions.step(delta);
	}

	onDestroy(stop);

	const presets = $derived([...new Set([...PORTION_PRESETS, portions.base])].sort((a, b) => a - b));
	const label = (n: number) => `${n} ${n === 1 ? 'portion' : 'portioner'}`;
</script>

<div class="px-5 pt-4" role="group" aria-labelledby="portions-label">
	<div class="flex items-center justify-between gap-4">
		<span id="portions-label" class="font-display text-xl font-semibold">Portioner</span>

		<div class="flex items-center gap-1">
			<button
				type="button"
				class="step-btn"
				aria-label="Færre portioner"
				disabled={portions.count <= portions.min}
				onpointerdown={(e) => down(e, -1)}
				onpointerup={stop}
				onpointercancel={stop}
				oncontextmenu={(e) => e.preventDefault()}
				onclick={(e) => key(e, -1)}>−</button
			>
			<input
				type="number"
				inputmode="numeric"
				class="count"
				min={portions.min}
				max={portions.max}
				step="1"
				aria-label="Antal portioner"
				value={portions.count}
				onchange={(e) => {
					portions.set(Number(e.currentTarget.value));
					e.currentTarget.value = String(portions.count);
				}}
			/>
			<button
				type="button"
				class="step-btn"
				aria-label="Flere portioner"
				disabled={portions.count >= portions.max}
				onpointerdown={(e) => down(e, 1)}
				onpointerup={stop}
				onpointercancel={stop}
				oncontextmenu={(e) => e.preventDefault()}
				onclick={(e) => key(e, 1)}>+</button
			>
		</div>

	</div>

	<div class="presets mt-3" role="group" aria-label="Hurtigvalg">
		{#each presets as n}
			<button type="button" class="preset" aria-pressed={portions.count === n} onclick={() => portions.set(n)}>{n}</button>
		{/each}
	</div>

	<p class="mt-2 flex h-6 items-center gap-1 text-sm opacity-75" class:invisible={!portions.scaled}>
		Originalt: {label(portions.base)} ·
		<button type="button" class="link" onclick={() => portions.reset()}>Nulstil</button>
	</p>

	<span class="sr-only" role="status" aria-live="polite">{label(portions.count)}</span>
</div>

<style>
	.step-btn {
		min-width: 2.75rem;
		min-height: 2.75rem;
		border-radius: 9999px;
		font-size: 1.4rem;
		line-height: 1;
		font-weight: 600;
		cursor: pointer;
		touch-action: manipulation;
		user-select: none;
		background: color-mix(in oklab, var(--color-primary-500) 16%, transparent);
		transition:
			background-color 150ms,
			transform 150ms;
	}
	.step-btn:hover:not(:disabled) {
		background: color-mix(in oklab, var(--color-primary-500) 28%, transparent);
	}
	.step-btn:active:not(:disabled) {
		transform: scale(0.94);
	}
	.step-btn:disabled {
		opacity: 0.35;
		cursor: default;
	}
	.count {
		width: 3.25rem;
		min-height: 2.75rem;
		text-align: center;
		font-family: var(--font-display, inherit);
		font-size: 1.35rem;
		font-weight: 600;
		background: transparent;
		border-radius: 0.75rem;
		appearance: textfield;
		-moz-appearance: textfield;
	}
	.count::-webkit-outer-spin-button,
	.count::-webkit-inner-spin-button {
		appearance: none;
		margin: 0;
	}
	.presets {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(0, 1fr);
		gap: 0.5rem;
	}
	.preset {
		min-width: 0;
		min-height: 2.75rem;
		padding: 0 0.6rem;
		border-radius: 9999px;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		touch-action: manipulation;
		border: 1px solid color-mix(in oklab, var(--color-primary-500) 35%, transparent);
	}
	.preset[aria-pressed='true'] {
		background: var(--color-primary-500);
		color: var(--color-primary-contrast-500, white);
		border-color: transparent;
	}
	.link {
		font-weight: 600;
		text-decoration: underline;
		cursor: pointer;
		color: var(--color-primary-700-300);
	}
</style>

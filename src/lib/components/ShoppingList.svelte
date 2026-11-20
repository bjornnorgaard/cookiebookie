<script lang="ts">
	import type { Ingredient, Recipe } from '#lib/types/recipe.ts';
	import PortionStepper from '#lib/components/PortionStepper.svelte';
	import { formatAmount } from '#lib/scale.ts';
	import { getPortions } from '#lib/stores/portions.svelte.ts';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { localStorageStore } from '#lib/stores/localStorageStore.ts';

	interface Props {
		recipe: Recipe;
	}

	let { recipe }: Props = $props();
	const portions = getPortions();
	// Amount text per ingredient at the chosen portion count. Ticks stay keyed by name, never by amount.
	const amountText = (ingredient: Ingredient) => formatAmount(ingredient, portions.scaling);
	// Brief fly-in for changed numbers; skipped for reduced motion.
	const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	const have = localStorageStore<string[]>('shopping_list', []);

	// Ticked items move to the bottom straight away (the list animates the move).
	const items = $derived(recipe.ingredients.map((ingredient, idx) => ({ ...ingredient, idx })));
	let order = $state<number[]>([]);

	function sorted(): number[] {
		const owned = (name: string) => $have.includes(name);
		return [...items.filter((i) => !owned(i.name)), ...items.filter((i) => owned(i.name))].map((i) => i.idx);
	}

	onMount(() => {
		order = sorted();
		return () => {
			clearTimeout(undoTimer);
		};
	});

	function toggle(name: string) {
		have.update((list) => (list.includes(name) ? list.filter((i) => i !== name) : [...list, name]));
		order = sorted();
	}

	// Reset only this recipe's ingredients (the store is shared across recipes), with a short undo window.
	let undo = $state<string[] | null>(null);
	let undoTimer: ReturnType<typeof setTimeout> | undefined;

	function reset() {
		const names = items.map((i) => i.name);
		const cleared = names.filter((n) => $have.includes(n));
		if (!cleared.length) return;
		have.update((list) => list.filter((n) => !names.includes(n)));
		order = sorted();
		undo = cleared;
		clearTimeout(undoTimer);
		undoTimer = setTimeout(() => (undo = null), 6000);
	}

	function restore() {
		if (!undo) return;
		const back = undo;
		have.update((list) => [...new Set([...list, ...back])]);
		order = sorted();
		undo = null;
		clearTimeout(undoTimer);
	}

	const view = $derived(
		order.length === items.length ? order.map((idx) => items[idx]) : items
	);
	const doneCount = $derived(items.filter((i) => $have.includes(i.name)).length);
</script>

<PortionStepper />

<div class="flex items-center justify-between gap-3 px-5 pt-4 text-sm">
	<span class="opacity-70">Sæt kryds ved det, du allerede har</span>
	<span class="flex items-center gap-2">
		{#if undo}
			<button type="button" class="reset-btn" onclick={restore} in:fade={{ duration: 150 }}>↶ Fortryd</button>
		{:else if doneCount > 0}
			<button type="button" class="reset-btn" onclick={reset} in:fade={{ duration: 150 }}>Nulstil</button>
		{/if}
		<span class="badge preset-tonal-primary tabular-nums" aria-live="polite">{doneCount}/{items.length}</span>
	</span>
</div>

<ul id="ingredients" class="m-0 list-none p-2 sm:p-3">
	{#each view as i (i.idx)}
		{@const checked = $have.includes(i.name)}
		<li animate:flip={{ duration: 600, easing: cubicInOut }}>
			<label
				class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-primary-500/10 {checked ? 'bg-primary-500/5' : ''}"
				for="ing-{i.idx}"
				class:line-through={checked}
							>
				<input id="ing-{i.idx}" type="checkbox" class="tick" {checked} onchange={() => toggle(i.name)} />
				<span class="flex grow items-baseline justify-between gap-3 transition-opacity duration-300" class:opacity-90={checked}>
					<span class="font-semibold">{i.name}</span>{#if amountText(i)}{#key amountText(i)}<span
								class="amount whitespace-nowrap text-right tabular-nums opacity-75"
								class:flash={portions.changed}
								data-amount
								in:fly={{ y: reduced() ? 0 : 8, duration: reduced() ? 0 : 220 }}><span class="sr-only">,&nbsp;</span>{amountText(i)}</span
							>{/key}{/if}
				</span>
			</label>
		</li>
	{/each}
</ul>

<style>
	/* Soft flash on amounts that just changed. The keyed span is recreated on every change, so it replays. */
	.amount.flash {
		animation: amount-flash 1100ms ease-out;
		border-radius: 0.375rem;
	}
	@keyframes amount-flash {
		from {
			background: color-mix(in oklab, var(--color-primary-500) 35%, transparent);
		}
		to {
			background: transparent;
		}
	}

	.reset-btn {
		font-size: 0.8125rem;
		font-weight: 600;
		padding: 0.25rem 0.6rem;
		border-radius: 9999px;
		color: light-dark(var(--color-primary-950), var(--color-primary-300));
		background: transparent;
		cursor: pointer;
		transition: background-color 200ms;
	}
	.reset-btn:hover {
		background: color-mix(in oklab, var(--color-primary-500) 18%, transparent);
	}
</style>

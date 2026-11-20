<script lang="ts">
	import type { Recipe } from '#lib/types/recipe.ts';
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { localStorageStore } from '#lib/stores/localStorageStore.ts';

	interface Props {
		recipe: Recipe;
	}

	let { recipe }: Props = $props();
	const have = localStorageStore<string[]>('shopping_list', []);

	// `order` lags behind `have` on purpose: ticked items drop to the bottom a moment later,
	// so an accidental tap can be undone before things jump around.
	const items = $derived(recipe.ingredients.map((ingredient, idx) => ({ ...ingredient, idx })));
	let order = $state<number[]>([]);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function sorted(): number[] {
		const owned = (name: string) => $have.includes(name);
		return [...items.filter((i) => !owned(i.name)), ...items.filter((i) => owned(i.name))].map((i) => i.idx);
	}

	onMount(() => {
		order = sorted();
		return () => {
			clearTimeout(timer);
			clearTimeout(undoTimer);
		};
	});

	function toggle(name: string) {
		have.update((list) => (list.includes(name) ? list.filter((i) => i !== name) : [...list, name]));
		clearTimeout(timer);
		timer = setTimeout(() => (order = sorted()), 900);
	}

	// Reset only this recipe's ingredients (the store is shared across recipes), with a short undo window.
	let undo = $state<string[] | null>(null);
	let undoTimer: ReturnType<typeof setTimeout> | undefined;

	function reset() {
		const names = items.map((i) => i.name);
		const cleared = names.filter((n) => $have.includes(n));
		if (!cleared.length) return;
		have.update((list) => list.filter((n) => !names.includes(n)));
		clearTimeout(timer);
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
				<span class="grow transition-opacity duration-300" class:opacity-50={checked}>
					<span class="font-semibold">{i.name}</span>{#if i.amount}<span class="opacity-75">, {i.amount}</span>{/if}
				</span>
			</label>
		</li>
	{/each}
</ul>

<style>
	.reset-btn {
		font-size: 0.8125rem;
		font-weight: 600;
		padding: 0.25rem 0.6rem;
		border-radius: 9999px;
		color: var(--color-primary-700-300);
		background: transparent;
		cursor: pointer;
		transition: background-color 200ms;
	}
	.reset-btn:hover {
		background: color-mix(in oklab, var(--color-primary-500) 18%, transparent);
	}
</style>

// Portion count for the recipe on screen. One instance per recipe page, shared through context, so
// the stepper, the facts strip, the ingredient list and later features (share, print, cook mode) agree.
//
// Server render and first paint use the recipe's own yield. After hydration the count from `?p=` (or the
// one remembered for this recipe in localStorage) is applied.

import { getContext, setContext, untrack } from 'svelte';
import { page } from '$app/state';
import { clampPortions, MAX_PORTIONS, MIN_PORTIONS, type Scaling } from '#lib/scale.ts';

const KEY = Symbol('portions');
const storageKey = (slug: string) => `portions:${slug}`;

function read(slug: string): number | null {
	try {
		return clampPortions(localStorage.getItem(storageKey(slug)));
	} catch {
		return null;
	}
}

function write(slug: string, value: number | null) {
	try {
		if (value === null) localStorage.removeItem(storageKey(slug));
		else localStorage.setItem(storageKey(slug), String(value));
	} catch {
		// Storage can be blocked (private mode); the count then simply is not remembered.
	}
}

export class Portions {
	readonly #recipe: () => { slug: string; yield: number };
	#chosen = $state<number | null>(null);
	/** True once the count has changed after load; used to switch on the change highlight. */
	changed = $state(false);

	constructor(recipe: () => { slug: string; yield: number }) {
		this.#recipe = recipe;

		// (Re)load whenever the recipe changes. Effects never run during server rendering.
		$effect(() => {
			const slug = this.slug;
			untrack(() => {
				this.changed = false;
				const fromUrl = clampPortions(page.url.searchParams.get('p'));
				const next = fromUrl ?? read(slug);
				this.#chosen = next === this.base ? null : next;
				if (this.#chosen !== null) this.changed = true;
			});
		});
	}

	get slug() {
		return this.#recipe().slug;
	}

	/** The recipe's own yield. */
	get base() {
		return this.#recipe().yield;
	}

	get count() {
		return this.#chosen ?? this.base;
	}

	get scaled() {
		return this.count !== this.base;
	}

	/** Pass this to `formatAmount` / `renderStepText`. */
	get scaling(): Scaling {
		return { base: this.base, portions: this.count };
	}

	get min() {
		return MIN_PORTIONS;
	}

	get max() {
		return MAX_PORTIONS;
	}

	set(value: number) {
		const n = clampPortions(value);
		if (n === null || n === this.count) return;
		this.changed = true;
		this.#chosen = n === this.base ? null : n;
		write(this.slug, this.#chosen);
	}

	step(delta: number) {
		this.set(this.count + delta);
	}

	reset() {
		this.set(this.base);
	}
}

export function setPortions(portions: Portions): Portions {
	return setContext(KEY, portions);
}

export function getPortions(): Portions {
	return getContext<Portions>(KEY);
}

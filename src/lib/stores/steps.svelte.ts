// Which steps of the recipe on screen are done. One instance per recipe page, shared through context, so the page's
// step list and cook mode always agree (there is no second copy of the state).

import { getContext, setContext } from 'svelte';

const KEY = Symbol('steps');
const RIPPLE_MS = 70;

export class Steps {
	readonly #recipe: () => { slug: string; steps: unknown[] };
	#timers: ReturnType<typeof setTimeout>[] = [];
	done: boolean[] = $state([]);

	constructor(recipe: () => { slug: string; steps: unknown[] }) {
		this.#recipe = recipe;
		// Reset the checks when navigating from one recipe to another. Effects never run during server rendering.
		$effect(() => {
			this.#recipe().slug;
			this.#clear();
			this.done = [];
			return () => this.#clear();
		});
	}

	#clear() {
		this.#timers.forEach(clearTimeout);
		this.#timers = [];
	}

	get total() {
		return this.#recipe().steps.length;
	}

	get doneCount() {
		return this.done.filter(Boolean).length;
	}

	/** First unchecked step = what to do next; -1 when everything is done. */
	get current() {
		return Array.from({ length: this.total }, (_, i) => this.done[i]).findIndex((c) => !c);
	}

	get allDone() {
		return this.doneCount === this.total && this.doneCount > 0;
	}

	/**
	 * Ticking a step means everything before it is done; unticking means everything after it is not.
	 * The change ripples outwards one step at a time so the user sees what happened.
	 */
	set(i: number, checked: boolean) {
		this.#clear();
		this.done[i] = checked;

		const targets = checked
			? Array.from({ length: i }, (_, k) => i - 1 - k) // i-1, i-2, ... 0
			: Array.from({ length: this.total - i - 1 }, (_, k) => i + 1 + k); // i+1 ... last
		targets.forEach((idx, n) => {
			if (!!this.done[idx] === checked) return;
			this.#timers.push(setTimeout(() => (this.done[idx] = checked), (n + 1) * RIPPLE_MS));
		});
	}
}

export function setSteps(steps: Steps): Steps {
	return setContext(KEY, steps);
}

export function getSteps(): Steps {
	return getContext<Steps>(KEY);
}

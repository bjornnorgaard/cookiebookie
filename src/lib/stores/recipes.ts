import type { Recipe } from "$lib/types/recipe";
import { lasagne } from "$lib/recipes/lasagne";
import { tomatsalat } from "$lib/recipes/tomatsalat";
import { readable } from "svelte/store";
import { brod } from "$lib/recipes/brod";
import { ristaffel } from "$lib/recipes/ristaffel";

const all: Recipe[] = [
	lasagne,
	tomatsalat,
	brod,
	ristaffel,
]

export const recipes = readable<Map<string, Recipe>>(new Map<string, Recipe>(), (set) => {
	const list = new Map<string, Recipe>();
	all.forEach(r => list.set(r.slug, r))
	set(list)
});

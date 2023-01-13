import type { Recipe } from "$lib/types/recipe";
import { readable } from "svelte/store";
import { all } from "$lib/recipes/_all";

export const recipes = readable<Map<string, Recipe>>(new Map<string, Recipe>(), (set) => {
	const list = new Map<string, Recipe>();
	all.forEach(r => list.set(r.slug, r))
	set(list)
});

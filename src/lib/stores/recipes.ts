import type { Recipe } from "$lib/types/recipe";
import { lasagne } from "$lib/recipes/lasagne";
import { tomatsalat } from "$lib/recipes/tomatsalat";
import { readable } from "svelte/store";

const map = new Map<string, Recipe>([
	[lasagne.slug, lasagne],
	[tomatsalat.slug, tomatsalat],
]);

export const recipes = readable<Map<string, Recipe>>(map);

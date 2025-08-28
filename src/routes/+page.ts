import type { PageLoad } from './$types';
import { error } from "@sveltejs/kit";
import { recipes } from "$lib/data/recipes";
import type { Recipe } from "$lib/types/recipe";

export const load: PageLoad = () => {
    const list: Recipe[] = recipes;
    if (!list.length) {
        error(500, "No list found");
    }

    return {
        recipes: list,
    };
};

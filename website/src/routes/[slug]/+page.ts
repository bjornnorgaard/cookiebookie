import type {PageLoad} from './$types';
import type {Recipe} from "$lib/types/recipe";
import {error} from "@sveltejs/kit";
import {recipes} from "../../recipes/recipes";

export const load: PageLoad = (async ({params}) => {
    let recipe: Recipe = recipes.filter(r => r.slug === params.slug)[0];
    if (!recipe) {
        throw error(404, "Recipe not found");
    }

    return {
        recipe: recipe,
    };
}) satisfies PageLoad;
import type { PageLoad } from './$types';
import { error } from "@sveltejs/kit";
import { recipes } from "$lib/data/recipes";
import type { Recipe } from "$lib/types/recipe";

export const load: PageLoad = ({ params }) => {
    const list: Recipe[] = recipes;
    if (!list.length) {
        throw error(500, "No list found");
    }

    return {
        title: "Seneste opskrifter",
        recipes: list,
    };
};

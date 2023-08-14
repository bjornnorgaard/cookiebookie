import type { PageLoad } from './$types';
import type { Recipe } from "$lib/types/recipe";
import { error } from "@sveltejs/kit";
import { recipes } from "$lib/data/recipes";

export const load: PageLoad = ({ params }) => {
    const maybeRecipe: Recipe | undefined = recipes.find(r => r.slug === params.slug);
    if (!maybeRecipe) {
        throw error(404, "Recipe not found");
    }

    const recipe: Recipe = maybeRecipe as Recipe;

    return {
        title: recipe.title,
        recipe: recipe,
    };
};

import { recipes } from '$lib/stores/recipes';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({params}) => {
    const recipe = recipes.find(r => r.slug === params.slug);
    if (!recipe) {
        throw error(404, "Recipe not found");
    }

    return {
        recipe: recipe,
    };
}) satisfies PageLoad;

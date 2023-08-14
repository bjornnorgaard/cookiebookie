import { recipes } from '$lib/stores/recipes';
import type { PageLoad } from './$types';

export const load = (async () => {
    return {
        recipes: recipes,
    };
}) satisfies PageLoad;

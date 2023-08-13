import type {PageLoad} from './$types';
import {recipes} from "../recipes/recipes";

export const load: PageLoad = (async () => {
    return {
        recipes: recipes,
    };
}) satisfies PageLoad;

import type { PageLoad } from './$types';
import type { Recipe } from "$lib/types/recipe";

export const load: PageLoad = ({ params }) => {
    const list: Recipe[] = [];
    return {
        recipes: list,
    };
};

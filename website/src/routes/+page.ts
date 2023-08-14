import type { PageLoad } from './$types';
import { recipes } from "$lib/stores/recipes";

export const load: PageLoad = ({ params }) => {
    return {
        recipes: recipes,
    };
};

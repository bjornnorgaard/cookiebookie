import {recipes} from "../../recipes/_recipes";
import type {PageLoad} from "./$types";
import {error} from "@sveltejs/kit";

export const load: PageLoad = ({params}) => {
    const r = recipes.filter(r => r.slug === params.slug)[0];
    if (!r) {
        throw error(404, 'Recipe not found');
    }

    return {
        recipe: r,
    };
};

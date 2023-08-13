import {recipes} from "../recipes/_recipes";
import type {PageLoad} from "./$types";

export const prerender = true;

export const load: PageLoad = () => {
    return {
        recipes: recipes,
    };
};

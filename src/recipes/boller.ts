import type { Recipe } from "$lib/types/recipe";
import { picsumHost } from "../lib/constants/picsum";

export const boller: Recipe = {
    slug: "boller",
    title: "Fødselsdagsboller",
    image: `${picsumHost}/id/244`,
    shortDesc: "Kommer snart...",
    longDesc: "Vi er der ikke helt endnu!",
    ingredients: [
        {name: "Mel", amount: "tror jeg nok"},
    ],
    steps: [
        {title: "Første skridt", desc: "Ingen ide"},
    ],
};

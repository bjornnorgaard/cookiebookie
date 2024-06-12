import type { Recipe } from "$lib/types/recipe";
import { ristaffel } from "$recipes/ristaffel";
import { risotto } from "$recipes/risotto";
import { lasagne } from "$recipes/lasagne";
import { sorensPastaret } from "$recipes/sorens-pastaret";
import { brod } from "$recipes/brod";
import { tomatsalat } from "$recipes/tomatsalat";
import { svinemorbrad } from "$recipes/spansk-svinemorbrad";
import { rasmusKlumpPandekager } from "$recipes/rasmus-klump-pandekager";

// Recipes will appear in the listed order.
export const recipes: Recipe[] = [
    ristaffel,
    // boller,
    // frittata,
    risotto,
    lasagne,
    sorensPastaret,
    brod,
    tomatsalat,
    svinemorbrad,
    rasmusKlumpPandekager,
];

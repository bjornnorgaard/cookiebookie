import {lasagne} from "./lasagne";
import {tomatsalat} from "./tomatsalat";
import {brod} from "./brod";
import {ristaffel} from "./ristaffel";
import type {Recipe} from "$lib/types/recipe";
import {sorensPastaret} from "./sorens-pastaret";
import {risotto} from "./risotto";
import {svinemorbrad} from "./spansk-svinemorbrad";

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
];

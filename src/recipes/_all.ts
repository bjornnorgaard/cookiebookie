import { lasagne } from "./lasagne";
import { tomatsalat } from "./tomatsalat";
import { brod } from "./brod";
import { ristaffel } from "./ristaffel";
import type { Recipe } from "$lib/types/recipe";
import { sorensPastaret } from "./sorens-pastaret";
import { risotto } from "./risotto";

// Recipes will appear in the listed order.
export const all: Recipe[] = [
    ristaffel,
    // boller,
    risotto,
    lasagne,
    sorensPastaret,
    brod,
    tomatsalat,
];

import type {Recipe} from "$lib/types/recipe";
import { brod } from "../../recipes/brod";
import { lasagne } from "../../recipes/lasagne";
import { risotto } from "../../recipes/risotto";
import { ristaffel } from "../../recipes/ristaffel";
import { sorensPastaret } from "../../recipes/sorens-pastaret";
import { svinemorbrad } from "../../recipes/spansk-svinemorbrad";
import { tomatsalat } from "../../recipes/tomatsalat";

export const recipes: Recipe[] = [
    ristaffel,
    lasagne,
    sorensPastaret,
    risotto,
    brod,
    tomatsalat,
    svinemorbrad,
    // boller,
    // frittata,
];

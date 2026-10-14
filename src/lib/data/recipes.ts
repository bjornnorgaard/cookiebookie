import type {Recipe} from "#lib/types/recipe.ts";
import {ristaffel} from "#recipes/ristaffel.ts";
import {risotto} from "#recipes/risotto.ts";
import {lasagne} from "#recipes/lasagne.ts";
import {sorensPastaret} from "#recipes/sorens-pastaret.ts";
import {brod} from "#recipes/brod.ts";
import {tomatsalat} from "#recipes/tomatsalat.ts";
import {svinemorbrad} from "#recipes/spansk-svinemorbrad.ts";
import {rasmusKlumpPandekager} from "#recipes/rasmus-klump-pandekager.ts";
import {marryMeChickpeas} from "#recipes/marry-me-chickpeas.ts";

// Recipes will appear in the listed order.
export const recipes: Recipe[] = [
    ristaffel,
    // boller,
    // frittata,
    risotto,
    lasagne,
    sorensPastaret,
    marryMeChickpeas,
    brod,
    tomatsalat,
    svinemorbrad,
    rasmusKlumpPandekager,
];

import { lasagne } from "./lasagne";
import { tomatsalat } from "./tomatsalat";
import { brod } from "./brod";
import { ristaffel } from "./ristaffel";
import type { Recipe } from "$lib/types/recipe";
import { sorensPastaret } from "./sorens-pastaret";

export const all: Recipe[] = [
    lasagne,
    tomatsalat,
    brod,
    ristaffel,
    sorensPastaret,
];

import { lasagne } from "$lib/recipes/lasagne";
import { tomatsalat } from "$lib/recipes/tomatsalat";
import { brod } from "$lib/recipes/brod";
import { ristaffel } from "$lib/recipes/ristaffel";
import type { Recipe } from "$lib/types/recipe";

export const all: Recipe[] = [
    lasagne,
    tomatsalat,
    brod,
    ristaffel,
];

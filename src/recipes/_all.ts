import { lasagne } from "./lasagne";
import { tomatsalat } from "./tomatsalat";
import { brod } from "./brod";
import { ristaffel } from "./ristaffel";
import type { Recipe } from "$lib/types/recipe";

export const all: Recipe[] = [
    lasagne,
    tomatsalat,
    brod,
    ristaffel,
];
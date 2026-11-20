import type { Recipe } from "#lib/types/recipe.ts";
import { Category, Cuisine } from "#lib/types/recipe.ts";
import { Months } from "#lib/types/months.ts";

export const lasagne: Recipe = {
    slug: "lasagne",
    title: "Den første Lasagne",
    shortDesc: "Baseret på kombination af de millioner opskrifter, jeg kunne finde.",
    author: "Bjørn Nørgaard",
    prepTime: "PT50M",
    cookTime: "PT40M",
    totalTime: "PT90M",
    cuisine: Cuisine.Italian,
    yield: 8,
    categories: [ Category.Hovedretter, Category.Aftensmad ],
    datePublished: new Date(2023, Months.January, 11),
    dateModified: new Date(2023, Months.March, 3),
    longDesc: "Det er lagsagne... Smid det hele i en gryde i to timer. Hvis det er for svært, så læs videre - følg nu med. Jeg smider alt det her i min udgave, men drop endelig hvad du ikke kan lide. Vi gider ikke lave monay eller plader fra bunden. Så dem køber vi for at vinde tid. ",
    ingredients: [
        { name: "Løg", amount: { qty: 3, unit: "stk." } },
        { name: "Hvidløg", amount: { qty: 1, unit: "stk." } },
        { name: "Olivenolie", amount: { qty: 2, unit: "spsk." } },
        { name: "Oregano", amount: { qty: 2, unit: "spsk." } },
        { name: "Gulerødder", amount: { qty: 4, unit: "stk." } },
        { name: "Bladselleri", amount: { qty: 5, unit: "stang", plural: "stænger" } },
        { name: "Squash (revet)", amount: { qty: 1, unit: "stk." } },
        { name: "Aubergine (revet)", amount: { qty: 1, unit: "stk." } },
        { name: "Tomatpuré", amount: { qty: 1, unit: "dl" } },
        { name: "Hakkedetomater", amount: { qty: 3, unit: "dåse", plural: "dåser" }, scale: "round-up" },
        { name: "Rødvin", amount: { qty: 1, unit: "dl" } },
        { name: "Hakketoksekød", amount: { qty: 500, unit: "g", display: "500g" } },
        { name: "Timian", amount: { qty: 1, unit: "tsk" } },
        { name: "Basilikum", amount: { qty: 1, unit: "tsk", display: "1tsk" } },
        { name: "Oksebouillon", amount: { qty: 2, unit: "dl" } },
        { name: "Ost", amount: { qty: 400, unit: "g", display: "400g" } },
        { name: "Rasp", amount: { qty: 1, unit: "pose" } },
        { name: "Lasagneplader", amount: { qty: 500, unit: "g", display: "500g" } },
        { name: "Monaysauce", amount: { qty: 1000, unit: "ml", display: "1000ml" } },
        { name: "Peber og salt" },
    ],
    steps: [
        {
            title: "Løgløg, hvide løg og olie oliven",
            desc: "Først skal vi pille og hakke alle grønsagerne. Start med løg og hvidløg. Det skal være fint, og steges i lidt olivenolie. Kun let på en pande uden at det tager farve!",
        },
        {
            title: "Kød og vin",
            desc: "Tilsæt kødet og lad det stege med, til alt kødet har taget farve. Hæld rødvin ved og lad det boble med nogle minutter.",
        },
        {
            title: "Tomat, fond og urter",
            desc: "Tilsæt hakket tomat og oksefond. Rør det hele sammen. Bind dine krydderurterne sammen (du har nu lavet en bouquet garni) og læg dem ned i gryden.",
        },
        {
            title: "Simre, slumre, simmer",
            desc: "Lad det hele simre til det det ikke er for flydende, og egner sig til lasagne (45-60 minutter).",
        },
        {
            title: "Beper og zalt",
            desc: "Smag til med salt og peber - og evt. lidt chili hvis bedstemor ikke spiser med.",
        },
        {
            title: "Bonus",
            desc: "Du kan med fordel tilføje mørk balsamico eller en anden god eddike, hvis saucen mangler syre.",
        },
    ],
};

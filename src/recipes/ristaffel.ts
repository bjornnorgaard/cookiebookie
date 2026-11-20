import type { Recipe } from "#lib/types/recipe.ts";
import { Category, Cuisine } from "#lib/types/recipe.ts";
import { Months } from "#lib/types/months.ts";

export const ristaffel: Recipe = {
    slug: "ristaffel",
    title: "Ristaffel",
    shortDesc: "Ris, kokos, kylling og alle de gode sager!",
    author: "Bjørn Nørgaard",
    prepTime: "PT10M",
    cookTime: "PT40M",
    totalTime: "PT50M",
    cuisine: Cuisine.Danish,
    yield: 4,
    categories: [ Category.Hovedretter, Category.Aftensmad ],
    datePublished: new Date(2023, Months.January, 12),
    dateModified: new Date(2023, Months.March, 7),
    longDesc: "Det ender cirka den mængde jeg plejer at lave, så der også er morgenmad til næste dag. Så må du sjusse dig frem til en nogenlunde mængde.",
    ingredients: [
        { name: "Kylling", amount: { qty: 500, unit: "gram" } },
        { name: "Creme Fraiche", amount: { qty: 0.5, unit: "liter", display: "0.5 liter" } },
        { name: "Forårsløg", amount: { qty: 1, unit: "bundt", display: "et bundt" } },
        { name: "Kokosmælk (øko)", amount: { qty: 2, unit: "dåse", plural: "dåser", display: "to dåser" }, scale: "round-up" },
        { name: "Bananer", amount: { text: "mindst en pr. pers", perServing: 1 } },
        { name: "Mango Chutney" },
        { name: "Et stort æble" },
        { name: "Løg", amount: { qty: [1, 100], unit: "stk" } },
        { name: "Peanuts" },
        { name: "Karry" },
        { name: "Ris" },
    ],
    steps: [
        {
            title: "Brus karryen af",
            desc: "Smid noget fedtstof i en stor gryde og brus karryen af (mere karry end du tror).",
        },
        {
            title: "Gør som hakkedyret",
            desc: "Hak løg og smid dem i når karryen er blevet lidt mørk.",
        },
        {
            title: "Kvadratisk, praktisk, æble",
            desc: "Hak æblet i stykker på cirka en kubikcentimeter (meget vigtigt) - og smid dem i når løgene er gule.",
        },
        {
            title: "Nu sker der noget",
            desc: "Kokosmælken hældes i. IKKE det hele, bare nok til at kyllingen har noget at koge i.",
        },
        {
            title: "Tid til kylle",
            desc: "Kyllingen skæres i gode stykker og puttes i når kokosmælken ikke klumper mere. Smid kokosmælk i til konsistensen er smuk.",
        },
        {
            title: "Så skal der fraises noget creme",
            desc: "Når kyllingen ikke længere er rå, hældes creme fraisen i.",
        },
        {
            title: "Forårsløg!",
            desc: "Hak forårsløgene i stykker og smid dem i. Husk at gemme nogle til toppings!",
        },
        {
            title: "Vi er der næsten",
            desc: "Nu mangler vi bare at smage det til med salt og peber. Cirka 5-10 min efter forårsløgene.",
        },
    ],
};

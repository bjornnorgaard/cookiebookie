import type { Recipe } from "#lib/types/recipe.ts";
import { Category, Cuisine } from "#lib/types/recipe.ts";
import { Months } from "#lib/types/months.ts";

export const rasmusKlumpPandekager: Recipe = {
    slug: "rasmus-klump-pandekager",
    title: "Pandekager á la Klump",
    shortDesc: "Den klassiske opskrift - så hut jeg visker.",
    author: "Bjørn Nørgaard",
    prepTime: "PT5M",
    cookTime: "PT35M",
    totalTime: "PT40M",
    cuisine: Cuisine.Danish,
    yield: 4,
    categories: [ Category.Sides, Category.Dessert ],
    datePublished: new Date(2024, Months.June, 12),
    dateModified: new Date(2024, Months.June, 12),
    diets: ['vegetarian'],
    longDesc: "Pandekager efter opskriften på forklædet - ligesom vi lavede dem i gamle dage. Dengang vi skulle læse opskriften på hovedet, fordi vi var for dumme til at tage forklædet af først - eller var det kun mig?",
    ingredients: [
        { name: "Hvedemel", amount: { qty: 200, unit: "gram" } },
        { name: "Mælk", amount: { qty: 0.5, unit: "liter" } },
        { name: "Æg", amount: { qty: 3, unit: "stk." }, scale: "round-up" },
        { name: "Sukker", amount: { qty: 1, unit: "spsk." } },
        { name: "Salt", amount: { qty: 1, unit: "teske" } },
        { name: "Smør" },
    ],
    steps: [
        {
            title: "Pisketid",
            desc: "Bland det hele i en skål og pisk det sammen - med undtagelse af smøret.",
        },
        {
            title: "Pandetid",
            desc: "Middel varme og en smule smør. Nu går vi på scenen! Find en behagelig plads og sæt din yndlingsplade på - her står du de næste 30 minutter.",
        },
        {
            title: "Spisetid",
            desc: "Tag nu et øjeblik, beundr dit hårde arbejde, som nu står perfekt stablet på en tallerken. Når alle om bordet har tilkendegivet deres værdsættelse, går I til fadet!",
        },
    ],
};

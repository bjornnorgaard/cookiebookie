import type { Recipe } from "$lib/types/recipe";
import { Category, Cuisine } from "$lib/types/recipe";
import { picsumHost } from "$lib/constants/picsum";
import { Months } from "$lib/types/months";

export const rasmusKlumpPandekager: Recipe = {
    slug: "rasmus-klump-pandekager",
    title: "Pandekager á la Klump",
    image: `${picsumHost}/id/380`,
    shortDesc: "Den klassiske opskrift - så hut jeg visker.",
    author: "Bjørn Nørgaard",
    prepTime: "PT5M",
    cookTime: "PT35M",
    totalTime: "PT40M",
    cuisine: Cuisine.Danish,
    yield: 4,
    categories: [ Category.Sides, Category.Dessert ],
    datePublished: new Date(2024, Months.June, 12),
    longDesc: "Pandekager efter opskriften på forklædet - ligesom vi lavede dem i gamle dage. Dengang vi skulle læse opskriften på hovedet, fordi vi var for dumme til at tage forklædet af først - eller var det kun mig?",
    ingredients: [
        { name: "Hvedemel", amount: "200 gram" },
        { name: "Mælk", amount: "½ liter" },
        { name: "Æg", amount: "3 stk." },
        { name: "Sukker", amount: "1 spsk." },
        { name: "Salt", amount: "1 teske" },
        { name: "Smør", amount: "" },
    ],
    steps: [
        {
            title: "Pisketid",
            desc: "Bland det hele i en skål og pisk det sammen - med undtagelse af smørret",
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

import type { Recipe } from "#lib/types/recipe.ts";
import { Category, Cuisine } from "#lib/types/recipe.ts";
import { Months } from "#lib/types/months.ts";

export const tomatsalat: Recipe = {
    slug: "tomatsalat",
    title: "Tomatsalat",
    shortDesc: "Farverig tomatsalat med mozzarella og alt jeg ellers kunne finde.",
    author: "Bjørn Nørgaard",
    prepTime: "PT10M",
    cookTime: "PT10M",
    totalTime: "PT20M",
    cuisine: Cuisine.Danish,
    yield: 4,
    categories: [ Category.Sides, Category.Aftensmad ],
    datePublished: new Date(2023, Months.January, 11),
    dateModified: new Date(2023, Months.March, 3),
    diets: ['vegetarian'],
    longDesc: "Det kan være meget fristende at smide mere end ét rødløg i, men for første gang i historien skal vi lige tæmme følelserne og forholde os i ro. I denne opskrift smager det skidt virkelig igennem, så slap af med løgene.",
    ingredients: [
        { name: "Cherrytomater", amount: { qty: 600, unit: "g", display: "600g" } },
        { name: "Mozzarrella", amount: { qty: 300, unit: "g", display: "300g" } },
        { name: "Rødløg", amount: { qty: 1, unit: "stk." } },
        { name: "Fetaost", amount: { qty: 200, unit: "g", display: "200g" } },
        { name: "Frisk basilikum" },
        { name: "Olivenolie" },
        { name: "Balsamico eddike" },
        { name: "Citronsaft" },
        { name: "Peber og salt" },
    ],
    steps: [
        { title: "Hak og nak", desc: "Det skal blandes. Du kan godt." },
    ],
};

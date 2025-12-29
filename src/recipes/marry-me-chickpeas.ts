import type { Recipe } from "$lib/types/recipe";
import { Category, Cuisine } from "$lib/types/recipe";
import { picsumHost } from "$lib/constants/picsum";
import { Months } from "$lib/types/months";

export const marryMeChickpeas: Recipe = {
    slug: "merry-me-chickpeas",
    title: "Camilla's Kikgryde",
    image: `${picsumHost}/id/546`, // 508, 517, 521, 522, 525, 529, 530, 533, 535, 537, 546
    shortDesc: "Vegetarisk bud på en af internettets favoritter. Der finder vist også en version med kylling.",
    author: "Camilla Bøgelund",
    prepTime: "PT20M",
    cookTime: "PT40M",
    totalTime: "PT60M",
    cuisine: Cuisine.Danish,
    yield: 4,
    categories: [ Category.Hovedretter, Category.Aftensmad ],
    datePublished: new Date(2025, Months.December, 29),
    longDesc: "Den varme ret til den kolde måned - kan også laves uden chili, hvis mor spiser med. Her skulle være nok til 4 personer.",
    ingredients: [
        { name: "Løg", amount: "2-100 stk" },
        { name: "Hvidløg", amount: "8 fed" },
        { name: "Kikærter", amount: "2 dåser" },
        { name: "Kokosmælk", amount: "2 dåser" },
        { name: "Soltørrede tomater", amount: "250 g" },
        { name: "Pasta/Ris", amount: "100 g/1 dl, per snude" },
        { name: "Chiliflager", amount: "" },
        { name: "Timian", amount: "" },
        { name: "Basilikum", amount: "" },
    ],
    steps: [
        { title: "Vi steger!", desc: "" },
        { title: "", desc: "" },
    ],
}

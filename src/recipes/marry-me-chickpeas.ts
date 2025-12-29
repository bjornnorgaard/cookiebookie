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
    longDesc: "Den varme ret til den kolde måned - hvis mor spiser med, kan den også laves uden chili. Her skulle være nok til 4 personer.",
    ingredients: [
        { name: "Løg", amount: "2-10 stk" },
        { name: "Hvidløg", amount: "8 fed" },
        { name: "Kikærter", amount: "2 dåser" },
        { name: "Kokosmælk", amount: "2 dåser" },
        { name: "Tomatpuré", amount: "1 dåse" },
        { name: "Vand", amount: "3 dl" },
        { name: "Soltørrede tomater", amount: "250 g" },
        { name: "Pasta", amount: "400 g" },
        { name: "Frisk Basilikum", amount: "" },
        { name: "Chiliflager", amount: "" },
        { name: "Citronsaft", amount: "" },
        { name: "Timian", amount: "" },
        { name: "Oregano", amount: "" },
    ],
    steps: [
        { title: "Hak og steg", desc: "Nærmere beskrivelse" },
        { title: "Hak og tilsæt", desc: "Nærmere beskrivelse" },
        { title: "De våde sager", desc: "Nærmere beskrivelse" },
        { title: "Så trækker vi!", desc: "Nærmere beskrivelse" },
    ],
}

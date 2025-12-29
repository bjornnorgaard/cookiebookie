import type { Recipe } from "$lib/types/recipe";
import { Category, Cuisine } from "$lib/types/recipe";
import { picsumHost } from "$lib/constants/picsum";
import { Months } from "$lib/types/months";

export const marryMeChickpeas: Recipe = {
    slug: "camillas-kikgryde",
    title: "Camillas Kikgryde",
    image: `${picsumHost}/id/546`, // 508, 517, 521, 530, 546
    shortDesc: "Vegetarisk bud på en favorit fra den sociale del af internettet. Der hedder den Marry Me Chickpeas, men jeg har givet den et jysk navn. Der findes vist også en version med kylling.",
    longDesc: "Den varme ret til den kolde måned - hvis mor spiser med, kan den også laves uden chili. Her skulle være nok til 4 personer.",
    author: "Camilla Bøgelund",
    prepTime: "PT20M",
    cookTime: "PT40M",
    totalTime: "PT60M",
    cuisine: Cuisine.Danish,
    yield: 4,
    categories: [ Category.Hovedretter, Category.Aftensmad ],
    datePublished: new Date(2025, Months.December, 29),
    ingredients: [
        { name: "Løg", amount: "4 stk" },
        { name: "Hvidløg", amount: "4 fed" },
        { name: "Kikærter", amount: "2 dåser" },
        { name: "Kokosmælk", amount: "2 dåser" },
        { name: "Tomatpuré", amount: "1 dåse" },
        { name: "Vand", amount: "1,5 dl" },
        { name: "Soltørrede tomater", amount: "1/2 glas" },
        { name: "Pasta", amount: "400 g" },
        { name: "Frisk Basilikum", amount: "" },
        { name: "Chiliflager, 1 tsk", amount: "" },
        { name: "Citronsaft, 2 spsk", amount: "" },
        { name: "Soya, 1 spsk", amount: "" },
        { name: "Timian, 1 tsk", amount: "" },
        { name: "Oregano, 1 tsk", amount: "" },
        { name: "Boullionterninger, 2 stk", amount: "" },
        { name: "Lidt salt og peber", amount: "" },
    ],
    steps: [
        { title: "Hak og steg", desc: "Hak og steg løg, hvidløg og alle krydderier og lad det stege til det dufter himmmelsk. Tilføj derefter de soltørrede tomater og tomoatpuré og steg i yderligere 3 minutter." },
        { title: "De våde sager", desc: "Tilføj vand, citronsaft, soya, boullionterninger og kokosmælk. Lad det simre i 10 minutter." },
        { title: "Så trækker vi!", desc: "Tilføj kikærterne og lad det simre i minimum 10 mintter mere og gerne helt op til 45-60 minutter. Når du er klar til at spise, så husk også at koge pasta. Velbekomme!" },
    ],
}

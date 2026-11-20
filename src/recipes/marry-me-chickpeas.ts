import type {Recipe} from "#lib/types/recipe.ts";
import {Category, Cuisine} from "#lib/types/recipe.ts";
import {Months} from "#lib/types/months.ts";

export const marryMeChickpeas: Recipe = {
    slug: "camillas-kikgryde",
    title: "Camillas Kikgryde",
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
    dateModified: new Date(2025, Months.December, 29),
    diets: ['vegetarian'],
    ingredients: [
        { name: "Løg", amount: { qty: 4, unit: "stk" } },
        { name: "Hvidløg", amount: { qty: 4, unit: "fed" } },
        { name: "Kikærter", amount: { qty: 2, unit: "dåse", plural: "dåser" }, scale: "round-up" },
        { name: "Kokosmælk", amount: { qty: 2, unit: "dåse", plural: "dåser" }, scale: "round-up" },
        { name: "Tomatpuré", amount: { qty: 1, unit: "dåse", plural: "dåser" }, scale: "round-up" },
        { name: "Vand", amount: { qty: 1.5, unit: "dl", display: "1,5 dl" } },
        { name: "Soltørrede tomater", amount: { qty: 0.5, unit: "glas", display: "1/2 glas" } },
        { name: "Pasta", amount: { qty: 400, unit: "g" } },
        { name: "Frisk Basilikum" },
        { name: "Chiliflager", amount: { qty: 1, unit: "tsk" } },
        { name: "Citronsaft", amount: { qty: 2, unit: "spsk" } },
        { name: "Soya", amount: { qty: 1, unit: "spsk" } },
        { name: "Timian", amount: { qty: 1, unit: "tsk" } },
        { name: "Oregano", amount: { qty: 1, unit: "tsk" } },
        { name: "Boullionterning", amount: { qty: 2, unit: "stk" } },
        { name: "Salt og peber" },
    ],
    steps: [
        { title: "Hak og steg", desc: "Hak og steg løg, hvidløg og alle krydderier og lad det stege til det dufter himmmelsk. Tilføj derefter de soltørrede tomater og tomoatpuré og steg i yderligere 3 minutter." },
        { title: "De våde sager", desc: "Tilføj vand, citronsaft, soya, boullionterninger og kokosmælk. Lad det simre i 10 minutter." },
        { title: "Så trækker vi!", desc: "Tilføj kikærterne og lad det simre i minimum 10 mintter mere og gerne helt op til 45-60 minutter. Når du er klar til at spise, så husk også at koge pasta. Velbekomme!" },
    ],
}

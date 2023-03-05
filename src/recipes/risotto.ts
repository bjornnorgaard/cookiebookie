import type { Recipe } from "$lib/types/recipe";

export const risotto: Recipe = {
    slug: "risotto",
    title: "Risotto",
    image: "https://picsum.photos/id/344",
    shortDesc: "Kommer snart...",
    longDesc: "Vi er der ikke helt endnu!",
    ingredients: [
        {name: "Grødris", amount: "200g gram"},
        {name: "Hvidvin", amount: "2 dl"},
        {name: "Løg", amount: "1-2 stk"},
        {name: "Smør", amount: "75-100 gram"},
        {name: "Hvidløg", amount: "2-3 fed"},
        {name: "Boullion", amount: "5-10 dl"},
        {name: "Hård ost", amount: "100-200 gram"},
        {name: "Olivenolie", amount: ""},
        {name: "Timian", amount: ""},
        {name: "Peber og salt", amount: ""},
    ],
    steps: [
        {title: "Første skridt", desc: "Ingen ide"},
    ],
};

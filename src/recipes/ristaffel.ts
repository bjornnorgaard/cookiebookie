import type { Recipe } from "$lib/types/recipe";
import { Category, Cuisine } from "$lib/types/recipe";
import { picsumHost } from "$lib/constants/picsum";
import { Months } from "$lib/types/months";

export const ristaffel: Recipe = {
    slug: "ristaffel",
    title: "Ristaffel",
    image: `${picsumHost}/id/82`,
    shortDesc: "Ris, kokos, kylling og alle de gode sager!",
    author: "Bjørn Nørgaard",
    prepTime: "PT10M",
    cookTime: "PT40M",
    totalTime: "PT50M",
    cuisine: Cuisine.Indian,
    yield: 4,
    categories: [ Category.Hovedretter, Category.Aftensmad ],
    datePublished: new Date(2023, Months.January, 12),
    longDesc: "Det ender cirka den mængde jeg plejer at lave, så der også er morgenmad til næste dag. Så må du sjusse dig frem til en nogenlunde mængde.",
    ingredients: [
        { name: "Kylling", amount: "500 gram" },
        { name: "Creme Fraiche", amount: "0.5 liter" },
        { name: "Forårsløg", amount: "et bundt" },
        { name: "Kokosmælk (øko)", amount: "to dåser" },
        { name: "Bananer", amount: "mindst en pr. pers" },
        { name: "Mango Chutney", amount: "" },
        { name: "Et stort æble", amount: "" },
        { name: "Løg", amount: "1-100 stk" },
        { name: "Peanuts", amount: "" },
        { name: "Karry", amount: "" },
        { name: "Ris", amount: "" },
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

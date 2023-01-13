import type { Recipe } from "$lib/types/recipe";

export const ristaffel: Recipe = {
    slug: "ristaffel",
    title: "Ristaffel",
    image: "",
    shortDesc: "Ris, kokus, kylling og alle de goder sager!",
    longDesc: "Det ender cirka i den mængde jeg plejer at lave. Så er der også til morgenmad næste dag. Så må du sjusse dig frem til en nogenlunde mængde.",
    ingredients: [
        {name: "Kylling", amount: "cirka 500 gram"},
        {name: "Creme Fraise", amount: "½ liter"},
        {name: "Forårsløg", amount: "et bundt"},
        {name: "Kokosmælk", amount: "to dåser"},
        {name: "Bananer", amount: "mindst en pr. pers"},
        {name: "Mango Chutney", amount: ""},
        {name: "Et stort æble", amount: ""},
        {name: "Løg", amount: "1-100 stk"},
        {name: "Peanuts", amount: ""},
        {name: "Karry", amount: ""},
        {name: "Ris", amount: ""},
    ],
    steps: [
        {title: "Brus karryen af", desc: "Smid noget fedtstof i en stor gryde og brus karryen af (mere karry end du tror)."},
        {title: "Gør som hakkedyret", desc: "Hak løg og smid dem i når karryen er blevet lidt mørk."},
        {title: "Kvadratisk, praktisk, æble", desc: "Hak æblet i stykker på cirka en kubikcentimeter, (meget vigtigt) - og smid dem i når løgene er gule."},
        {title: "Nu sker der noget", desc: "Kokosmælken hældes i."},
        {title: "Tid til kylle", desc: "Kyllingen skæres i gode stykker og puttes i når kokosmælken ikke klumper mere."},
        {title: "Så skal der fraises noget creme", desc: "Når kyllingen ikke længere er rå, hældes creme fraisen i."},
        {title: "Forårsløg!", desc: "Hak forårsløgene i stykker og smid dem i."},
        {title: "Vi er der næsten", desc: "Cirka 5-10min efter forårsløgene: smag til med salt og peber."},
    ]
};

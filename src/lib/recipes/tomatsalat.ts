import type { Recipe } from "$lib/types/recipe";

export const tomatsalat: Recipe = {
    slug: "tomatsalat",
    title: "Tomatsalat",
    image: "",
    shortDesc: "En farverig skål med tomat, mozzarella og alt hvad jeg ellers kunne finde på.",
    longDesc: "Det kan være meget fristende at smide mere end ét rødløg i, men for første gang i historien skal man lige tæmme følelserne og forholde sig i ro. I denne opskrift smager det skidt virkelig igennem, så slap af med løgene.",
    ingredients: [
        {name: "Cherrytomater", amount: "600g"},
        {name: "Mozzarrella", amount: "300g"},
        {name: "Rødlæg", amount: "1"},
        {name: "Fetaost", amount: "200g"},
        {name: "Frisk basilikum", amount: ""},
        {name: "Olivenolie", amount: ""},
        {name: "Balsamico eddike", amount: ""},
        {name: "Citronsaft", amount: ""},
        {name: "Peber og salt", amount: ""},
    ],
    steps: [
        {title: "Hak og nak", desc: "Det skal blandes. Du kan godt."},
    ],
};

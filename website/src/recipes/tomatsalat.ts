import type { Recipe } from "$lib/types/recipe";
import { picsumHost } from "$lib/constants/picsum";

export const tomatsalat: Recipe = {
    slug: "tomatsalat",
    title: "Tomatsalat",
    image: `${picsumHost}/id/122`,
    shortDesc: "Farverig tomatsalat med mozzarella og alt jeg ellers kunne finde.",
    longDesc: "Det kan være meget fristende at smide mere end ét rødløg i, men for første gang i historien skal vi lige tæmme følelserne og forholde os i ro. I denne opskrift smager det skidt virkelig igennem, så slap af med løgene.",
    ingredients: [
        { name: "Cherrytomater", amount: "600g" },
        { name: "Mozzarrella", amount: "300g" },
        { name: "Rødløg", amount: "1 stk." },
        { name: "Fetaost", amount: "200g" },
        { name: "Frisk basilikum", amount: "" },
        { name: "Olivenolie", amount: "" },
        { name: "Balsamico eddike", amount: "" },
        { name: "Citronsaft", amount: "" },
        { name: "Peber og salt", amount: "" },
    ],
    steps: [
        { title: "Hak og nak", desc: "Det skal blandes. Du kan godt." },
    ],
};

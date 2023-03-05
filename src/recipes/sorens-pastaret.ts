import type { Recipe } from "$lib/types/recipe";
import { picsumHost } from "../lib/constants/picsum";

export const sorensPastaret: Recipe = {
    slug: "sorens-pastaret",
    title: "Sørens Pastaret",
    image: `${picsumHost}/id/98`,
    shortDesc: "Pastaret. Lav indsats. Super lækker. Mums.",
    longDesc: "Nem ret. Smid det hele i et fad og bland. Kan sagtens klare " +
        "random grønsager - rosenkål og porre er ikke fjenden! " +
        "Tager ingen tid at forberede og skal bare glemmes i ovnen i " +
        "alt mellem 30 minutter og 24 timer - bliver nice.",
    ingredients: [
        {name: "Fyldt pasta", amount: "400g"},
        {name: "Hakkede tomater", amount: "2-3 dåser"},
        {name: "Løg", amount: "2-20 stk"},
        {name: "Fløde", amount: "1/4 liter fløde"},
        {name: "Havarti ost (revet)", amount: "200g"},
        {name: "Grønsag", amount: "Nok"},
        {name: "Bacon", amount: "~200g"},
        {name: "Salt og peber", amount: ""},
    ],
    steps: [
        {
            title: "Åbn, hak og bland",
            desc: "Hak grønsager og riv osten. Bland grønsager og pasta. " +
                "Gem osten til sidst. Hæld tomaterne i så det kun lige dækker."
        },
        {
            title: "Ost - selvfølgelig",
            desc: "Osten fordeles nøjsomt ovenpå. Når osten er fordelt, " +
                "smider du fingerne i fadet og begynder skødesløst at blande det hele."
        },
        {
            title: "Ovnen klarer resten",
            desc: "Det skal næppe have mindre end 30 minutter, lander normalt et sted omkring 45-60 min. " +
                "Kig på den hver 20. minut og tænk dig om."
        },
        {
            title: "Du er der næsten!",
            desc: "Nu skal den bare have til du ikke tør mere. " +
                "I stræberversionen kan man også røre i den under inspektionerne."
        },
    ],
};

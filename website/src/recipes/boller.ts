import type { Recipe } from "$lib/types/recipe";
import { picsumHost } from "$lib/constants/picsum";

export const boller: Recipe = {
    slug: "boller",
    title: "Fødselsdagsboller",
    image: `${picsumHost}/id/244`,
    shortDesc: "Kommer snart...",
    longDesc: "Vi er der ikke helt endnu!",
    ingredients: [
        { name: "Mel", amount: "1200 gram" },
        { name: "Mælk", amount: "½ liter" },
        { name: "Gær", amount: "90 gram" },
        { name: "Sukker", amount: "48 gram" },
        { name: "Salt", amount: "3 tsk" },
        { name: "Fedtstof", amount: "120 gram" },
    ],
    steps: [
        { title: "Første skridt", desc: "Ingen ide" },
        { title: "Smulder garen i skälen.", desc: "asdf" },
        { title: "Lun malken (lillefingerproven).", desc: "asdf" },
        { title: "Ror gren ud med den lune malk.", desc: "asdf" },
        { title: "Kom krydderier, fedtstof og evt. ag i.", desc: "asdf" },
        { title: "Kom halvdelen af melet i.", desc: "asdf" },
        { title: "Sla dejen sammen. Brug fx. händmixer (kroge-ne) eller roremaskine.", desc: "asdf" },
        { title: "/Elt efterhänden mel i, til dejen slipper.", desc: "asdf" },
        { title: "Form dejen til en kugle. Lad den hvile 2-3 min.", desc: "asdf" },
        { title: "Tril dejen til en palse. Del den i 8 lige store stykker.", desc: "asdf" },
        { title: "Form stykkerne til kugler og stil dem p§ en smurt plade.", desc: "asdf" },
        { title: "Dek med et madstykke. Stil til having pa et lunt sted 10-15 min.", desc: "asdf" },
        { title: "Smør derefter med æggestrygelse", desc: "asdf" },
        { title: "Bag bollerne omkring 12 min ved 225 grader.", desc: "asdf" },
    ],
};

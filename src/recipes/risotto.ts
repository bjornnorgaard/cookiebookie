import type { Recipe } from "$lib/types/recipe";
import { picsumHost } from "../lib/constants/picsum";

export const risotto: Recipe = {
    slug: "risotto",
    title: "Risotto",
    image: `${picsumHost}/id/368`,
    shortDesc: "Risotto til billige penge, men italienerne kan alligvel ikke smage forskel.",
    longDesc: "Risottoris og pamesanost er alt for dyrt. Vi er ikke millionære, " +
        "så vi bruger grødris og en semi-hård ost, " +
        "som ikke må koste mere end 200 DDK for et kilo - " +
        "selv hvis du lige har fået løn! " +
        "Endeligt skal du også selv finde nogle grønsager - held og lykke.",
    ingredients: [
        {name: "Grødris", amount: "200 gram"},
        {name: "Hvidvin", amount: "2 dl"},
        {name: "Ost", amount: "100-200 gram"},
        {name: "Løg", amount: "2 stk"},
        {name: "Smør", amount: "50-100 gram"},
        {name: "Boullion", amount: "5-10 dl"},
        {name: "Hvidløg", amount: ""},
        {name: "Olivenolie", amount: ""},
        {name: "Timian", amount: ""},
        {name: "Peber og salt", amount: ""},
    ],
    steps: [
        {title: "Forberedelse", desc: "Hak løg og hvidløg - riv osten nu, hvis du laver det alene. Lav også lige under en liter boullion og stil det klar, ved konfuret."},
        {title: "Turbosvits", desc: "Dæk bunden er din pande med olivenolie og løgene noget kærlighed. Når løgene er halvvejs, smider du hvidløgene i - så undgår vi at brænde dem."},
        {title: "Vin og ris", desc: "Når løgene spiller, tilføjer du ris og timian. Når de har lagt sig til rette og er blevet lidt solbrune, skal vores hvidvin i."},
        {title: "Boulliontid", desc: "Præcis når det begynder at sidde fast på panden, smider du den første tredjedel af boullionvandet i og sørge for at skrabe bunden ren. Gentag løbende med en mere og mere forsigig mændge boullion."},
        {title: "Grøntsager", desc: "Hvis du ikke har gjort det endnu, skal grøntsagerne i."},
        {title: "Smør og ost", desc: ""},
    ],
};

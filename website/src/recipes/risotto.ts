import type { Recipe } from "$lib/types/recipe";
import { Category, Cuisine } from "$lib/types/recipe";
import { picsumHost } from "$lib/constants/picsum";
import { Months } from "$lib/types/months";

export const risotto: Recipe = {
    slug: "risotto",
    title: "Risotto",
    image: `${picsumHost}/id/368`,
    shortDesc: "Fancy risgrød til billige penge, men italienerne kan nok ikke smage forskel.",
    author: "Bjørn Nørgaard",
    prepTime: "PT10M",
    cookTime: "PT30M",
    totalTime: "PT40M",
    cuisine: Cuisine.Italian,
    yield: 2,
    categories: [Category.Hovedretter, Category.Aftensmad],
    datePublished: new Date(2023, Months.March, 5),
    longDesc: "Vi er ikke millionærer, så risottoris og parmesanost er udelukket. Grødris og en semi-hård ost er lige så godt. Jeg har lige sparet dig omkring 150 kroner - selv tak. Endeligt skal du også vælge nogle grønsager eller svampe - i dag bruger vi champignon og ærter. Sidste ting før vi starter: Du må ikke salte undervejs. Held og lykke.",
    ingredients: [
        { name: "Grødris", amount: "200 gram" },
        { name: "Hvidvin", amount: "2 dl" },
        { name: "Ost", amount: "100 gram" },
        { name: "Løg", amount: "1-2 stk" },
        { name: "Smør", amount: "75 gram" },
        { name: "Bouillon", amount: "1 liter" },
        { name: "Champignon", amount: "250 gram" },
        { name: "Ærter", amount: "100 gram" },
        { name: "Hvidløg", amount: "1/2 hvidløg" },
        { name: "Olivenolie", amount: "" },
        { name: "Timian", amount: "" },
        { name: "Peber og salt", amount: "" },
    ],
    steps: [
        {
            title: "Forberedelse",
            desc: "Hak løg og hvidløg - riv osten nu, hvis du laver det alene. Lav lige under en liter bouillon og sæt det ved komfuret.",
        },
        {
            title: "Turbosvits",
            desc: "Dæk bunden af din pande med olivenolie og giv løgene noget kærlighed. Når løgene er halvvejs, smides hvidløgene i - så undgår vi at brænde dem.",
        },
        {
            title: "Vin og ris",
            desc: "Når løgene spiller, tilføjes ris og timian. Risene skal præcis nå at blive lidt solbrune. Når det er blevet for sent til after-sun, skal hvidvinen i. Vi forsætter når den næsten er kogt væk.",
        },
        {
            title: "Bouillontid",
            desc: "Hemmeligheden er, kun at hælde mere bouillonvand i, når det begynder at sidde fast på panden. Start med den første tredjedel af bouillonvandet, og sørg for at skrabe bunden ren efter hver tankning. Gentag løbende med gradvist mere konservativ mængde. Smag på det og gå videre lige før risene er perfekte.",
        },
        {
            title: "Grønsager og svampe",
            desc: "Jeg glemmer ofte helt at købe grønsager. Hvis du har været så forudseende, kan de enten steges lidt på en pande eller bare hakkes og smides i. Du er chefen.",
        },
        {
            title: "Kan du mærke kærligheden?",
            desc: "Risene spiller, men fuglene synger ikke endnu. Tag grøden af varmen og rør smøret i. Gentag med osten. Nu synger de små kræ.",
        },
        {
            title: "Sidste finjustering",
            desc: "Nu smager vi endeligt til. Den mangler nok peber, men træd varsomt med salten - ost og smør indeholder en del.",
        },
    ],
};

import type { Recipe } from "$lib/types/recipe";
import { Category, Cuisine } from "$lib/types/recipe";
import { picsumHost } from "$lib/constants/picsum";
import { Months } from "$lib/types/months";

export const svinemorbrad: Recipe = {
    slug: "svinemorbrad",
    title: "Svinemørbrad i Svøb",
    image: `${picsumHost}/id/15`,
    shortDesc: "Svinemørbrad tilberedt som den bør",
    author: "Nikolaj Matzen",
    prepTime: "PT20M",
    cookTime: "PT30M",
    totalTime: "PT50M",
    cuisine: Cuisine.Spanish,
    yield: 4,
    categories: [ Category.Hovedretter, Category.Aftensmad ],
    datePublished: new Date(2023, Months.June, 14),
    longDesc: "Dress to impress! Dette svin er svøbt i sine spanske artsfæller og derefter klædt på med butterdej. Aldrig mere vil du forbinde ordet tør med svinemørbrad. Advarsel, tilfælde af kronisk løbende mundvand er hændt efter indtagelse.",
    ingredients: [
        { name: "Svinemørbrad", amount: "1 stk." },
        { name: "Butterdej", amount: "1 rulle" },
        { name: "Ost", amount: "120 gram" },
        { name: "Løg", amount: "2 stk." },
        { name: "Svampe", amount: "250 gram" },
        { name: "Jamon iberico", amount: "100 gram" },
        { name: "Dijonsennep", amount: "2-3 spsk." },
        { name: "Æg", amount: "1 (kan undværes)" },
        { name: "Øl", amount: "2 stk." },
        { name: "Olivenolie", amount: "" },
        { name: "Timian", amount: "" },
        { name: "Salt og peber", amount: "" },
    ],
    steps: [
        {
            title: "Forberedelse",
            desc: "Put øl i køleskabet. Hak løg og svampe i ca. 0,732 cm tykke skiver - riv osten.",
        },
        {
            title: "Svits svinet",
            desc: "Brun svinemørbrad på en pande med olie på alle sider ved høj varme. Tag den af panden, krydr den med salt og peber og smør den nænsomt i sennep.",
        },
        {
            title: "Fyld",
            desc: "Giv panden mere olie og steg løgene til de er klare, sæt dem til side og steg derefter svampene.",
        },
        {
            title: "Be square",
            desc: "Nu kommer det svære. Placer film på køkkenbordet og læg nøjsomt jamon iberico ud så der ligger skiver side om side og fylder en firkant så bred som dit svin. Fordel herefter svampe og løg ensartet på firkanten. Til sidst drysses ost jævnt udover.",
        },
        {
            title: "Svøb svinet",
            desc: "Anbring svinet på firkanten og beundr dit arbejde hidtil, indse derefter at du har for meget fyld og at den næppe kan lukke om svinet. Vær ligeglad og rul herligheden så godt du kan om svinet og læg det i køleskabet med film og det hele.",
        },
        {
            title: "Vent",
            desc: "Sæt dig ned og drik en kold øl, derefter tænder du ovnen 200 grader almindelig ovn (lad et ovnfast fad blive i ovnen). Tag butterdej ud af køleskabet. Drik en øl mere, mens du pisker et æg.",
        },
        {
            title: "Nu er du klar",
            desc: "Rul butterdej ud. Tag dit svøbte svin ud af ovnen og placer svinet midtpå. Fjern filmen med en rullende bevægelse og rul derefter butterdej om svin og luk den ved at pensle med lidt pisket æg og presse dejen sammen.",
        },
        {
            title: "Nu er ovnen klar",
            desc: "Tag det ovnfaste fad ud og placer dit svøbte svin i fadet med lukningen nedad. Pensl herefter butterdejen med det resterende piskede æg og put det hele tilbage i ovnen.",
        },
        {
            title: "Nu er svinet klar",
            desc: "Efter hvad der føles som uendligheder, der nok svarer til 30 min. burde svinet være klar. Dette kommer dog an på tykkelsen, stjernetegn og alt muligt brug derfor et stegetermometer, den skal være mindst 60 grader indeni og butterdejen gylden og sprød.",
        },
    ],
};

import type { Recipe } from "#lib/types/recipe.ts";
import { Category, Cuisine } from "#lib/types/recipe.ts";
import { Months } from "#lib/types/months.ts";

export const svinemorbrad: Recipe = {
    slug: "svinemorbrad",
    title: "Svinemørbrad i Svøb",
    shortDesc: "Svinemørbrad tilberedt som den bør",
    author: "Nikolaj Matzen",
    prepTime: "PT20M",
    cookTime: "PT30M",
    totalTime: "PT50M",
    cuisine: Cuisine.Spanish,
    yield: 4,
    categories: [ Category.Hovedretter, Category.Aftensmad ],
    datePublished: new Date(2023, Months.June, 14),
    dateModified: new Date(2023, Months.June, 14),
    longDesc: "Dress to impress! Dette svin er svøbt i sine spanske artsfæller og derefter klædt på med butterdej. Aldrig mere vil du forbinde ordet tør med svinemørbrad. Advarsel, tilfælde af kronisk løbende mundvand er hændt efter indtagelse.",
    ingredients: [
        { name: "Svinemørbrad", amount: { qty: 1, unit: "stk." } },
        { name: "Butterdej", amount: { qty: 1, unit: "rulle" } },
        { name: "Ost", amount: { qty: 120, unit: "gram" } },
        { name: "Løg", amount: { qty: 2, unit: "stk." } },
        { name: "Svampe", amount: { qty: 250, unit: "gram" } },
        { name: "Jamon iberico", amount: { qty: 100, unit: "gram" } },
        { name: "Dijonsennep", amount: { qty: [2, 3], unit: "spsk." } },
        { name: "Æg", amount: { qty: 1 }, scale: "round-up", note: "kan undværes" },
        { name: "Øl", amount: { qty: 2, unit: "stk." } },
        { name: "Olivenolie" },
        { name: "Timian" },
        { name: "Salt og peber" },
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
            timers: [{ label: "Bagning", minutes: 30 }],
        },
    ],
};

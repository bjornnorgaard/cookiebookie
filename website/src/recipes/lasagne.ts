import type { Recipe } from "$lib/types/recipe";
import { picsumHost } from "$lib/constants/picsum";

export const lasagne: Recipe = {
    slug: "lasagne",
    title: "Den første Lasagne",
    image: `${picsumHost}/id/21`,
    shortDesc: "Baseret på kombination af de millioner opskrifter, jeg kunne finde.",
    longDesc: "Det er lagsagne... Smid det hele i en gryde i to timer. Hvis det er for svært, så læs videre - følg nu med. Jeg smider alt det her i min udgave, men drop endelig hvad du ikke kan lide. Vi gider ikke lave monay eller plader fra bunden. Så dem køber vi for at vinde tid. ",
    ingredients: [
        {name: "Løg", amount: "2 stk."},
        {name: "Hvidløg", amount: "4 fed"},
        {name: "Olivenolie", amount: "2 spsk"},
        {name: "Oregano", amount: "2 tsk"},
        {name: "Gulerødder", amount: "4 stk."},
        {name: "Bladselleri", amount: "5 stænger"},
        {name: "Squash (revet)", amount: "1 stk."},
        {name: "Aubergine (revet)", amount: "1 stk."},
        {name: "Tomatpuré", amount: "1 dl"},
        {name: "Hakkedetomater", amount: "2 dåser"},
        {name: "Rødvin", amount: "1 dl"},
        {name: "Hakketoksekød", amount: "500g"},
        {name: "Timian", amount: "1 tsk"},
        {name: "Basilikum", amount: "1tsk"},
        {name: "Oksebouillon", amount: "1½ dl"},
        {name: "Ost", amount: "2 poser revet"},
        {name: "Rasp", amount: "1 pose"},
        {name: "Lasagneplader", amount: "nok"},
        {name: "Monaysauce", amount: ""},
        {name: "Peber og salt", amount: ""},
    ],
    steps: [
        {
            title: "Løgløg, hvide løg og olie oliven",
            desc: "Først skal vi pille og hakke. Start med løg og hvidløg. Det skal være fint, og steges i lidt olivenolie. Kun let på en pande uden at det tager farve!",
        },
        {
            title: "Kød og vin",
            desc: "Tilsæt kødet og lad det stege med, til alt kødet har taget farve. Hæld rødvin ved og lad det boble med nogle minutter.",
        },
        {
            title: "Tomat, fond og urter",
            desc: "Tilsæt hakket tomat og oksefond. Rør det hele sammen. Bind dine krydderuderter sammen (du har nu lavet en bouquet garni) og læg dem ned i gryden.",
        },
        {
            title: "Simre, slumre, simmer",
            desc: "Lad det hele simre til det det ikke er for flydende, og egner sig til lasagne (45-60 minutter).",
        },
        {
            title: "Beper og zalt",
            desc: "Smag til med salt og peber - og evt. lidt chili hvis bedstemor ikke spiser med.",
        },
        {
            title: "Bonus",
            desc: "Du kan med fordel tilføje mørk balsamico eller en anden god eddike, hvis saucen mangler syre.",
        },
    ],
};

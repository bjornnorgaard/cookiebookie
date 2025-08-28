import type { Recipe } from "$lib/types/recipe";
import { Category, Cuisine } from "$lib/types/recipe";
import { picsumHost } from "$lib/constants/picsum";
import { Months } from "$lib/types/months";

export const brod: Recipe = {
    slug: "brod",
    title: "Uæltet Brød",
    image: `${picsumHost}/id/40`,
    shortDesc: "Lækkert, tæt og svampet brød, som ikke skal æltes - særlig meget",
    author: "Bjørn Nørgaard",
    prepTime: "PT10M",
    cookTime: "PT45M",
    totalTime: "PT55M",
    cuisine: Cuisine.Danish,
    yield: 4,
    categories: [ Category.Bagning ],
    datePublished: new Date(2023, Months.January, 12),
    ingredients: [
        { name: "Hvedemel", amount: "400g" },
        { name: "Salt", amount: "10g" },
        { name: "Tørgær", amount: "½ pakke" },
        { name: "Vand", amount: "300g" },
    ],
    longDesc: "Efter at have konsulteret internettet lader dette til at være opskriften på sejr. Vi ælter ingenting, næsten, men tingene skal nu blandes alligevel - livet er hårdt. " +
        "Her finder du ingen mål i te- eller spiseskeer, som ved konventionel madlavning. Bagning er alkemi og har intet at gøre med madlavning - så her bruger vi gram og liter! " +
        "Når det skal bages, forvarmer jeg en stor støbejernsgryde ved max ovn. Alternativt kan et bagestål bruges. " +
        "Ellers kan den sikkert også ligge på en bageplade uden at gå i stykker - hvem ved.",
    steps: [
        {
            title: "Skål!",
            desc: "Find din største stål, som forhåbentligt har et låg - ellers bruger du et viskestykke.",
        },
        {
            title: "Bland de våde sager",
            desc: "Der er ikke så meget andet at sige. Gær, salt, sukker og tempereret vand. Brug 10 sekunder og værdsæt at du næsten er færdig.",
        },
        {
            title: "Tilsæt de tørre sager",
            desc: "Bland det hele indtil det hænger sammen og der ikke meget mel på siderne af skålen. Tager omkring to minutter.",
        },
        {
            title: "Hævetid er sovetid",
            desc: "Smid låg på. Det skal hvile i 12 til 24 timer, eller indtil det er fordoblet i størrelse. Tak for i dag - vi ses i morgen.",
        },
        {
            title: "Den lever!",
            desc: "Vores baby er nu (forhåbentligt) vokset til mindst dobbelt størrelse og har pruttet hele natten - hvilket gerne skulle kunne duftes.",
        },
        {
            title: "Olie og form",
            desc: "Hæld lidt olivenolie ned i kanten af skålen (indersiden) og lidt på bordet. Så arbejdes dejen forsigtigt ud af skålen. Den skal ikke æltes, bare lige foldes. Gør det nogle gange indtil den ligner en pæn dej med en stram overflade. Nu skal den hvile under et viskestykke eller en skål.",
        },
        {
            title: "Bagetid",
            desc: "Du tænder ovnen på alt hvad den trække og forvarmer din støbejernsfætter. Vi mødes her igen om ~30 min.",
        },
        {
            title: "Brænd nu ikke dine små dumme fingre",
            desc: "Sænk den så forsigtigt ned i din støbejernsgryde (pas nu på pølserne) og sprøjt den gavmildt til med vand. Sæt låg på og efterlad i ovnen i ca. 30 minutter før næste inspektion.",
        },
        {
            title: "Tjekketid",
            desc: "Kig til brødet. Hvis den ikke er færdig, sættes du den tilbage i ovnen. Hvis du er i tvivl spørger du en voksen.",
        },
        {
            title: "La' det lig'",
            desc: "I mindst en time før du fucker med brødet. Alt er spildt hvis du rør den før - det kan ikke diskuteres!",
        },
        {
            title: "Skær den over på midten",
            desc: "Når du har ventet i en time, må du skære den over på midten og sende et billede til mor - det er vigtigt. Husk tandsmør, ost i tykke skiver og lidt salt!",
        },
    ],
};

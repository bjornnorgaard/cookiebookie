import type { Recipe } from "$lib/types/recipe";

export const brod: Recipe = {
    slug: "brod",
    title: "Uæltet Brød",
    image: "",
    shortDesc: "Lækkert lyst, tæt og svampet brød, som ikke skal æltes. I hvert fald ikke særlig meget.",
    longDesc: "Efter at lave konsulteret internettet lader dette til at være opskriften på sejr. Vi ælter ingenting, næsten, men tingene skal nu blandes alligevel - livet er hårdt. " +
        "Når det skal bages, forvarmer jeg en stor støbejernsgryde ved max ovn. Alternativt kan et bagestål bruges. " +
        "Ellers kan den sikkert også ligge på en bageplade uden at gå i stykker - hvem ved.",
    ingredients: [
        {name: "Hvedemel", amount: "400g"},
        {name: "Sukker", amount: "10g"},
        {name: "Salt", amount: "10g"},
        {name: "Gær", amount: "1g"},
        {name: "Vand", amount: "300g"},
    ],
    steps: [
        {title: "Bland de våde sager", desc: "Der er ikke så meget andet at sige. Brug 10 sekunder og værdsæt at du næsten er færdig."},
        {title: "Tilsæt de tørre sager", desc: "Bland det hele indtil det hænger sammen og der ikke meget mel på siderne af skålen. Hvis det tager dig mere end 40 sekunder prøver du for hårdt."},
        {title: "Hævetid er sovetid", desc: "Smid låg på. Det skal hvile i 12 til 24 timer, eller indtil det er fordoblet i størrelse. Tak for i dag - vi ses i morgen."},
        {title: "Den lever!", desc: "Vores baby er nu (forhåbentligt) vokset til mindst dobbelt størrelse og har pruttet hele natten - hvilket gerne skulle kunne duftes."},
        {title: "Bagetid", desc: "Du tænder ovnen på alt hvad den trække og smider din støbejernsfætter ind. Vi mødes her igen om ~45 min."},
        {title: "Nu kommer svineriet", desc: "Hør nu efter. Det bliver et klisterhelvede. Der skal masser af mel på bordet og vand på fingerne - i den rækkefølge! Den skal ikke æltes, men bare lige foldes nogle gange. Gør det nogle få gange indtil den ligner en pæn dej med en stram overflade."},
        {title: "Brænd nu ikke dine små dumme fingre", desc: "Smid den på et stykke velmelet bagepapir og sprøjt den gavmildt til med vand. Sænk den så forsigtigt ned i din støbejernsgryde (pas nu på pølserne). Sæt låg på og efterlad i ovnen i 20 minutter før næste inspektion."},
        {title: "Tjekketid", desc: "Kig til brødet. Hvis den ikke er færdig, sættes du den tilbage i ovnen. Hvis du er i tvivl, spørger du en voksen."},
        {title: "La' det lig'", desc: "I mindst en time før du fucker med brødet. Alt er spildt hvis du rør den før - det kan ikke diskuteres!"},
        {title: "Skær den over på midten", desc: "Når du har ventet i en time, må du skære den over på midten og sende et billede til mor - det er vigtigt. Husk tandsmør, ost i tykke skiver og lidt salt - selv tak!"},
    ],
};

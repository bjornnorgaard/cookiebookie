<script>
    import ContentNarrow from "$lib/components/ContentNarrow.svelte";

    const ingredients = [
        {what: "Løg", count: "2"},
        {what: "Hvidløg ", count: "4"},
        {what: "Olivenolie ", count: "2 spsk"},
        {what: "Oregano", count: "2 tsk"},
        {what: "Gulerødder", count: "4"},
        {what: "Bladselleri", count: "5 stænger"},
        {what: "Squash (revet)", count: "1"},
        {what: "Aubergine (revet)", count: "1"},
        {what: "Tomatpuré", count: "1 dl"},
        {what: "Hakkedetomater ", count: "2 dåser"},
        {what: "Rødvin", count: "1 dl"},
        {what: "Hakketoksekød", count: "500g"},
        {what: "Timian", count: "1 tsk"},
        {what: "Basilikum", count: "1tsk"},
        {what: "Oksebouillon", count: "1½ dl"},
        {what: "Ost", count: "2 poser revet"},
        {what: "Rasp", count: "1 pose"},
        {what: "Lasagneplader", "count": "Nok"},
        {what: "Monaysause", "count": ""},
        {what: "Peber og salt", "count": ""},
    ];

    const steps = [
        {
            title: "Løgløg, hvide løg og olie oliven",
            desc: "Start med at pille og hakke løg og hvidløg fint og steg det i lidt olivenolie let på en pande uden at det tager farve."
        },
        {
            title: "Kød og vin",
            desc: "Tilsæt kødet og lad det stege med, til alt kødet har taget farve. Hæld rødvin ved og lad det boble med et par minutter."
        },
        {
            title: "Tomat, fond og urter",
            desc: "Tilsæt hakket tomat og oksefond og rør det hele sammen. Bind dine krydderuderter sammen (du har nu lavet en bouquet garni) og læg ned i gryden."
        },
        {
            title: "Simre, slumre, simmer",
            desc: "Lad det hele simre til det det ikke er for flydende, og egner sig til lasagne (45-50 minutter)."
        },
        {title: "Beper og zalt", desc: "Smag til med salt og peber (og evt. lidt chili hvis du vil give det et pift)."},
        {
            title: "Bonus",
            desc: "Evt. tilføj mørk balsamico eller en anden god eddike, hvis du synes saucen mangler syre."
        },
    ];

</script>

<ContentNarrow title="Lasagne">
    <p>En lækker lasagne baseret på en kombination af alle de opskrifter jeg kunne finde.</p>

    <h2>Ingredienser</h2>

    <p>
        Jeg smider alt dette i min udgave, men drop endelig hvad du ikke kan lide.
        Vi gider ikke lave monay eller plader fra bunden. Så dem køber vi for at vinde tid.
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each ingredients as i}
            <div class="flex items-center gap-2">
                <input type="checkbox" class="checkbox">
                <span>{i.what}</span>
                <span>{i.count}</span>
            </div>
        {/each}
    </div>

    <h2>Sovs</h2>

    <p>
        Det er lagsagne... Smid det hele i en gryd i to timer - hvis det er for svært, så læs videre.
        Let den vigtigste del. Følg nu med.
    </p>

    <ol>
        {#each steps as s}
            <li>
                <span class="font-medium">{s.title}</span>
                <br>
                <span>{s.desc}</span>
            </li>
        {/each}
    </ol>

</ContentNarrow>
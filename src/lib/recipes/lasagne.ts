import type { Recipe } from "$lib/types/recipe";

export const lasagne: Recipe = {
	slug: "lasagne",
	title: "Verdens bedste lasagne",
	image: "https://picsum.photos/600/200",
	desc: "Første gang jeg nogensinde har lavet lasagne",
	ingredients: [
		{ name: "Løg", amount: "2" },
		{ name: "Hvidløg ", amount: "4" },
		{ name: "Olivenolie ", amount: "2 spsk" },
		{ name: "Oregano", amount: "2 tsk" },
		{ name: "Gulerødder", amount: "4" },
		{ name: "Bladselleri", amount: "5 stænger" },
		{ name: "Squash (revet)", amount: "1" },
		{ name: "Aubergine (revet)", amount: "1" },
		{ name: "Tomatpuré", amount: "1 dl" },
		{ name: "Hakkedetomater ", amount: "2 dåser" },
		{ name: "Rødvin", amount: "1 dl" },
		{ name: "Hakketoksekød", amount: "500g" },
		{ name: "Timian", amount: "1 tsk" },
		{ name: "Basilikum", amount: "1tsk" },
		{ name: "Oksebouillon", amount: "1½ dl" },
		{ name: "Ost", amount: "2 poser revet" },
		{ name: "Rasp", amount: "1 pose" },
		{ name: "Lasagneplader", amount: "Nok" },
		{ name: "Monaysause", amount: "" },
		{ name: "Peber og salt", amount: "" },
	],
	steps: [
		{
			title: "Løgløg, hvide løg og olie oliven",
			desc: "Start med at pille og hakke løg og hvidløg fint og steg det i lidt olivenolie let på en pande uden at det tager farve.",
		},
		{
			title: "Kød og vin",
			desc: "Tilsæt kødet og lad det stege med, til alt kødet har taget farve. Hæld rødvin ved og lad det boble med et par minutter.",
		},
		{
			title: "Tomat, fond og urter",
			desc: "Tilsæt hakket tomat og oksefond og rør det hele sammen. Bind dine krydderuderter sammen (du har nu lavet en bouquet garni) og læg ned i gryden.",
		},
		{
			title: "Simre, slumre, simmer",
			desc: "Lad det hele simre til det det ikke er for flydende, og egner sig til lasagne (45-50 minutter).",
		},
		{ title: "Beper og zalt", desc: "Smag til med salt og peber (og evt. lidt chili hvis du vil give det et pift)." },
		{
			title: "Bonus",
			desc: "Evt. tilføj mørk balsamico eller en anden god eddike, hvis du synes saucen mangler syre.",
		},
	],
};

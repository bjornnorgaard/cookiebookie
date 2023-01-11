import type { Recipe } from "$lib/types/recipe";

export const tomatsalat: Recipe = {
	slug: "tomatsalat",
	title: "Tomatsalat",
	image: "https://picsum.photos/600/500",
	desc: "Det okay godt",
	ingredients: [
		{ name: "Hakkede tomater", amount: "tre dåser" },
		{ name: "Salt og peber", amount: "en smule" },
	],
	steps: [
		{ title: "Bland det hele", desc: "Bla bla. Åbn ting og hæld det i." },
		{ title: "Smag det til", desc: "Herp smag" },
	],
};

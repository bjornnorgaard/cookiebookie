export interface Recipe {
	slug: string;
	title: string;
	desc: string;
	image: string;
	ingredients: Ingredient[];
	steps: Step[];
}

export interface Ingredient {
	name: string;
	amount: string;
}

export interface Step {
	title: string;
	desc: string;
}

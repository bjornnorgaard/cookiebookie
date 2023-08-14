export interface Recipe {
    slug: string;
    title: string; // 35-65
    shortDesc: string;
    longDesc: string; // 70-320
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

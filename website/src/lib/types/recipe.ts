export interface Recipe {
    slug: string;
    title: string; // 35-65
    author: string;
    shortDesc: string;
    longDesc: string; // 70-320
    datePublished: Date; // "2018-03-10"
    image: string;
    prepTime: string; // PT20M
    cookTime: string; // PT30M
    totalTime: string; // PT50M
    cuisine: Cuisine;
    categories: Category[];
    yield: number;
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

export enum Cuisine {
    Danish = 'Dansk',
    Indian = 'Indisk',
    Italian = 'Italiensk',
    Spanish = 'Spansk',
}

export enum Category {
    Aftensmad = 'Aftensmad',
    Hovedretter = 'Hovedretter',
    Fodselsdag = 'Fødselsdag',
    Bagning = 'Bagning',
    Sides = 'Tilbehør',
}

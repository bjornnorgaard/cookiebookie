export interface Recipe {
    slug: string;
    title: string; // 35-65
    author: string;
    shortDesc: string;
    longDesc: string; // 70-320
    datePublished: Date; // "2018-03-10"
    dateModified?: Date; // last content edit; falls back to datePublished
    prepTime: string; // PT20M
    cookTime: string; // PT30M
    totalTime: string; // PT50M
    cuisine: Cuisine;
    categories: Category[];
    yield: number;
    ingredients: Ingredient[];
    steps: Step[];
    estimatedCostDKK?: number; // total, for the stated yield
    diets?: Diet[];
    nutrition?: Nutrition;
}

export type Diet = 'vegetarian' | 'vegan' | 'glutenFree' | 'lactoseFree';

export interface Nutrition {
    kcalPerServing: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
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
    Dessert = 'Dessert',
}

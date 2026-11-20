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

/** A single number, or an inclusive range such as "2-3 spsk." (both ends scale). */
export type Quantity = number | [number, number];

/** A measurable amount. Scales with the portion count. */
export interface MeasuredAmount {
    qty: Quantity;
    /** Unit as authored ("g", "gram", "dl", "stk.", "dåse" ...). Known kitchen units are normalised when scaled. */
    unit?: string;
    /** Plural form of a count unit ("dåser"); used when the quantity is above 1. */
    plural?: string;
    /** Authored wording at the recipe's own yield, for legacy spellings ("500g", "0.5 liter", "to dåser"). Never used once scaled. */
    display?: string;
}

/** An amount that is prose, not a number ("Ja", "mindst en pr. pers"). */
export interface TextAmount {
    text: string;
    /** Pieces needed per portion; when scaled we append the total ("6 i alt"). */
    perServing?: number;
}

export type ScaleMode = 'linear' | 'fixed' | 'round-up';

export interface Ingredient {
    name: string;
    /** Omitted for "to taste" items such as salt and pepper (shown without an amount). */
    amount?: MeasuredAmount | TextAmount;
    /** linear (default), fixed (salt, spices: never changes), round-up (eggs, cans: whole numbers, rounded up). */
    scale?: ScaleMode;
    /** Shown in parentheses after the amount, e.g. "kan undværes". */
    note?: string;
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

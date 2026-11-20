import type { Recipe } from "#lib/types/recipe.ts";
import { Category, Cuisine } from "#lib/types/recipe.ts";
import { Months } from "#lib/types/months.ts";

export const frittata: Recipe = {
    slug: "frittata",
    title: "Frittata",
    shortDesc: "Retten der går sig fint til alle dagens måltider. Frittata.",
    author: "Bjørn Nørgaard",
    prepTime: "PT20M",
    cookTime: "PT30M",
    totalTime: "PT50M",
    cuisine: Cuisine.Italian,
    yield: 2,
    categories: [ Category.Hovedretter, Category.Aftensmad ],
    datePublished: new Date(2023, Months.May, 11),
    longDesc: "Den idelle frittata har alle regnbuens farver - hvis du ikke bliver glad af at se på den, har du gjort det forkert.",
    ingredients: [
        { name: "Kartofler", amount: { qty: 500, unit: "g" } },
        { name: "Squash", amount: { qty: 1, unit: "stk" } },
        { name: "Æg", amount: { qty: 8, unit: "stk" }, scale: "round-up" },
        { name: "Rødløg", amount: { qty: 1, unit: "stk" } },
        { name: "Cherrytomater", amount: { qty: 250, unit: "g" } },
        { name: "Mozzarellakugler", amount: { text: "Ja" } },
        { name: "Creme fraiche", amount: { qty: 250, unit: "ml" } },
        { name: "Spinat", amount: { qty: 1, unit: "pose" } },
    ],
    steps: [
        { title: "", desc: "" },
    ],
}

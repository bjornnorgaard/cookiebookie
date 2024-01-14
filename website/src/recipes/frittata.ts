import type { Recipe } from "$lib/types/recipe";
import { Category, Cuisine } from "$lib/types/recipe";
import { picsumHost } from "$lib/constants/picsum";
import { Months } from "$lib/types/months";

export const frittata: Recipe = {
    slug: "frittata",
    title: "Frittata",
    image: `${picsumHost}/id/505`,
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
        { name: "Kartofler", amount: "500 g" },
        { name: "Squash", amount: "1 stk" },
        { name: "Æg", amount: "8 stk" },
        { name: "Rødløg", amount: "1 stk" },
        { name: "Cherrytomater", amount: "250 g" },
        { name: "Mozzarellakugler", amount: "Ja" },
        { name: "Creme fraiche", amount: "250 ml" },
        { name: "Spinat", amount: "1 pose" },
    ],
    steps: [
        { title: "", desc: "" },
    ],
}

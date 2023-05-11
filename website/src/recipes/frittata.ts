import type { Recipe } from "$lib/types/recipe";
import { picsumHost } from "$lib/constants/picsum";

export const frittata: Recipe = {
    slug: "frittata",
    title: "Frittata",
    image: `${picsumHost}/id/505`,
    shortDesc: "Retten der går sig fint til alle dagens måltider. Frittata.",
    longDesc: "Den idelle frittata har alle regnbuens farver - hvis du ikke bliver glad af at se på den, har du gjort det forkert.",
    ingredients: [
        {name: "Kartofler", amount: "500 g"},
        {name: "Squash", amount: "1 stk"},
        {name: "Æg", amount: "8 stk"},
        {name: "Rødløg", amount: "1 stk"},
        {name: "Cherrytomater", amount: "250 g"},
        {name: "Mozzarellakugler", amount: "Ja"},
        {name: "Creme fraiche", amount: "250 ml"},
        {name: "Spinat", amount: "1 pose"},
    ],
    steps: [
        {title: "", desc: ""},
    ],
}
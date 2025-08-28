import type { Recipe } from "$lib/types/recipe";
import { seoImgHeight, seoImgWidth } from "$lib/constants/seo";

export function buildRecipeHead(recipe: Recipe, rootUrl: string): any {
    const data = {
        "@context": "https://schema.org/",
        "@type": "Recipe",
        "name": recipe.shortDesc,
        "image": [
            `${recipe.image}/${seoImgWidth}/${seoImgHeight}`,
        ],
        "author": {
            "@type": "Person",
            "name": recipe.author,
        },
        "datePublished": recipe.datePublished.toISOString().split("T")[0],
        "description": recipe.longDesc,
        "prepTime": recipe.prepTime,
        "cookTime": recipe.cookTime,
        "totalTime": recipe.totalTime,
        "keywords": recipe.title,
        "recipeYield": recipe.yield.toString(),
        "recipeCategory": recipe.categories.toString(),
        "recipeCuisine": recipe.cuisine.toString(),
        /* "nutrition": {
            "@type": "NutritionInformation",
            "calories": "270 calories"
        }, */
        "recipeIngredient": recipe.ingredients.map(i => i.amount ? `${i.amount} ${i.name}` : i.name),
        "recipeInstructions": recipe.steps.map((s, i) => ({
            "@type": "HowToStep",
            "name": s.title,
            "text": s.desc,
            "url": `${rootUrl}/${recipe.slug}#step${i + 1}`,
            // "image": `${recipe.image}/${seoImgWidth}/${seoImgHeight}`,
        })),
        /* "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5",
            "ratingCount": "18"
        }, */
        /* "video": {
            "@type": "VideoObject",
            "name": "How to make a Party Coffee Cake",
            "description": "This is how you make a Party Coffee Cake.",
            "thumbnailUrl": [
                "https://example.com/photos/1x1/photo.jpg",
                "https://example.com/photos/4x3/photo.jpg",
                "https://example.com/photos/16x9/photo.jpg"
            ],
            "contentUrl": "https://www.example.com/video123.mp4",
            "embedUrl": "https://www.example.com/videoplayer?video=123",
            "uploadDate": "2018-02-05T08:00:00+08:00",
            "duration": "PT1M33S",
            "interactionStatistic": {
                "@type": "InteractionCounter",
                "interactionType": {"@type": "WatchAction"},
                "userInteractionCount": 2347
            },
            "expires": "2019-02-05T08:00:00+08:00"
        } */
    };

    return data;
}

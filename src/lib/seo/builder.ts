import type { Recipe } from '$lib/types/recipe';
import { seoImgHeight, seoImgWidth } from '$lib/constants/seo';
import { siteAuthor, siteLanguage, siteName, siteUrl } from '$lib/constants/site';

const homepageDescription =
	'Simple opskrifter og gode råd om madlavning. ' +
	'Skrevet i et uformelt og, forhåbentligt, morsomt sprog, som er let at følge. ' +
	'Ingen lange oprindelseshistorier - og naturligvis uden irriterende reklamer.';

export function buildWebsiteHead() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: siteName,
		url: siteUrl,
		description: homepageDescription,
		inLanguage: siteLanguage,
		author: {
			'@type': 'Person',
			name: siteAuthor
		}
	};
}

export function buildRecipeHead(recipe: Recipe, rootUrl: string) {
	return {
		'@context': 'https://schema.org/',
		'@type': 'Recipe',
		name: recipe.title,
		image: [`${recipe.image}/${seoImgWidth}/${seoImgHeight}`],
		author: {
			'@type': 'Person',
			name: recipe.author
		},
		datePublished: recipe.datePublished.toISOString().split('T')[0],
		description: recipe.longDesc,
		prepTime: recipe.prepTime,
		cookTime: recipe.cookTime,
		totalTime: recipe.totalTime,
		keywords: recipe.title,
		recipeYield: recipe.yield.toString(),
		recipeCategory: recipe.categories,
		recipeCuisine: recipe.cuisine,
		recipeIngredient: recipe.ingredients.map((i) => (i.amount ? `${i.amount} ${i.name}` : i.name)),
		recipeInstructions: recipe.steps.map((s, i) => ({
			'@type': 'HowToStep',
			name: s.title,
			text: s.desc,
			url: `${rootUrl}/${recipe.slug}#step${i + 1}`
		}))
	};
}

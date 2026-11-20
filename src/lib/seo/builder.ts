import type { Recipe } from '#lib/types/recipe.ts';
import { siteAuthor, siteLanguage, siteName, siteUrl } from '#lib/constants/site.ts';
import { isoDate } from '#lib/format.ts';
import { getPhoto } from '#lib/images.ts';

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

export function buildBreadcrumbs(recipe: Recipe, rootUrl: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: siteName, item: rootUrl },
			{ '@type': 'ListItem', position: 2, name: recipe.title, item: `${rootUrl}/${recipe.slug}` }
		]
	};
}

export function buildRecipeHead(recipe: Recipe, rootUrl: string) {
	// Google asks for several aspect ratios of the same photo for rich results.
	const { social, isPlaceholder } = getPhoto(recipe.slug);
	return {
		'@context': 'https://schema.org/',
		'@type': 'Recipe',
		name: recipe.title,
		// A drawn placeholder is not a photo of the dish, so keep it out of rich-result data.
		...(isPlaceholder ? {} : { image: [social['1x1'], social['4x3'], social['16x9']].map((v) => `${rootUrl}${v.src}`) }),
		author: {
			'@type': 'Person',
			name: recipe.author
		},
		datePublished: isoDate(recipe.datePublished),
		description: recipe.longDesc,
		prepTime: recipe.prepTime,
		cookTime: recipe.cookTime,
		totalTime: recipe.totalTime,
		keywords: [recipe.title, recipe.cuisine, ...recipe.categories].join(', '),
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

import type { Diet, Nutrition, Recipe } from '#lib/types/recipe.ts';
import {
	siteAuthor,
	siteAuthorUrl,
	siteDescription,
	siteLanguage,
	siteLogo,
	siteName,
	siteSameAs,
	siteUrl
} from '#lib/constants/site.ts';
import { isoDate } from '#lib/format.ts';
import { getPhoto } from '#lib/images.ts';

const websiteId = `${siteUrl}/#website`;
const organizationId = `${siteUrl}/#organization`;

/** Last content edit, falling back to the publication date. */
export const modifiedDate = (recipe: Recipe) => recipe.dateModified ?? recipe.datePublished;

const dietUrls: Record<Diet, string> = {
	vegetarian: 'https://schema.org/VegetarianDiet',
	vegan: 'https://schema.org/VeganDiet',
	glutenFree: 'https://schema.org/GlutenFreeDiet',
	lactoseFree: 'https://schema.org/LowLactoseDiet'
};

function buildNutrition(n: Nutrition) {
	return {
		'@type': 'NutritionInformation',
		servingSize: '1 portion',
		calories: `${n.kcalPerServing} kcal`,
		...(n.proteinG === undefined ? {} : { proteinContent: `${n.proteinG} g` }),
		...(n.carbsG === undefined ? {} : { carbohydrateContent: `${n.carbsG} g` }),
		...(n.fatG === undefined ? {} : { fatContent: `${n.fatG} g` })
	};
}

export function buildWebsiteHead() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': websiteId,
		name: siteName,
		url: siteUrl,
		description: siteDescription,
		inLanguage: siteLanguage,
		publisher: { '@id': organizationId },
		author: {
			'@type': 'Person',
			name: siteAuthor
		}
	};
}

export function buildOrganization() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': organizationId,
		name: siteName,
		url: siteUrl,
		logo: { '@type': 'ImageObject', url: `${siteUrl}${siteLogo}`, width: 512, height: 512 },
		sameAs: siteSameAs
	};
}

/** Carousel-eligible list of every recipe on the home page. */
export function buildItemList(recipes: Recipe[], rootUrl: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		itemListElement: recipes.map((recipe, i) => {
			const { social, isPlaceholder } = getPhoto(recipe.slug);
			return {
				'@type': 'ListItem',
				position: i + 1,
				url: `${rootUrl}/${recipe.slug}`,
				name: recipe.title,
				...(isPlaceholder ? {} : { image: `${rootUrl}${social['16x9'].src}` })
			};
		})
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
	const url = `${rootUrl}/${recipe.slug}`;
	// The author profile only applies to the site owner; guest authors get a plain Person.
	const isOwner = recipe.author === siteAuthor;
	return {
		'@context': 'https://schema.org/',
		'@type': 'Recipe',
		'@id': `${url}#recipe`,
		name: recipe.title,
		url,
		mainEntityOfPage: url,
		isPartOf: { '@id': websiteId },
		inLanguage: siteLanguage,
		// A drawn placeholder is not a photo of the dish, so keep it out of rich-result data.
		...(isPlaceholder ? {} : { image: [social['1x1'], social['4x3'], social['16x9']].map((v) => `${rootUrl}${v.src}`) }),
		author: {
			'@type': 'Person',
			name: recipe.author,
			...(isOwner ? { url: siteAuthorUrl, sameAs: [siteAuthorUrl, ...siteSameAs] } : {})
		},
		publisher: {
			'@type': 'Organization',
			name: siteName,
			url: rootUrl,
			logo: { '@type': 'ImageObject', url: `${rootUrl}${siteLogo}`, width: 512, height: 512 }
		},
		datePublished: isoDate(recipe.datePublished),
		dateModified: isoDate(modifiedDate(recipe)),
		description: recipe.longDesc,
		prepTime: recipe.prepTime,
		cookTime: recipe.cookTime,
		totalTime: recipe.totalTime,
		keywords: [recipe.title, recipe.cuisine, ...recipe.categories].join(', '),
		// Google reads both the bare number and the "N portioner" form.
		recipeYield: [recipe.yield.toString(), `${recipe.yield} portioner`],
		recipeCategory: recipe.categories,
		recipeCuisine: recipe.cuisine,
		...(recipe.estimatedCostDKK === undefined
			? {}
			: { estimatedCost: { '@type': 'MonetaryAmount', currency: 'DKK', value: recipe.estimatedCostDKK } }),
		...(recipe.diets?.length ? { suitableForDiet: recipe.diets.map((d) => dietUrls[d]) } : {}),
		...(recipe.nutrition ? { nutrition: buildNutrition(recipe.nutrition) } : {}),
		recipeIngredient: recipe.ingredients.map((i) => (i.amount ? `${i.amount} ${i.name}` : i.name)),
		recipeInstructions: [
			{
				'@type': 'HowToSection',
				name: 'Fremgangsmåde',
				itemListElement: recipe.steps.map((s, i) => ({
					'@type': 'HowToStep',
					position: i + 1,
					name: s.title,
					text: s.desc,
					url: `${url}#step${i + 1}`
				}))
			}
		]
	};
}

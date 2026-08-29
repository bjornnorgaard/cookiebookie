import { recipes } from '$lib/data/recipes';
import { siteUrl } from '$lib/constants/site';
import type { RequestHandler } from './$types';

function formatDate(date: Date): string {
	return date.toISOString().split('T')[0];
}

function latestRecipeDate(): string {
	const latest = recipes.reduce(
		(max, recipe) => (recipe.datePublished > max ? recipe.datePublished : max),
		recipes[0].datePublished
	);
	return formatDate(latest);
}

export const GET: RequestHandler = () => {
	const pages = [
		{ loc: siteUrl, lastmod: latestRecipeDate() },
		...recipes.map((recipe) => ({
			loc: `${siteUrl}/${recipe.slug}`,
			lastmod: formatDate(recipe.datePublished)
		}))
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
	.map(
		(page) => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};

import { recipes } from '#lib/data/recipes.ts';
import { siteName, siteUrl } from '#lib/constants/site.ts';
import { isoDate } from '#lib/format.ts';
import { getPhoto } from '#lib/images.ts';
import { modifiedDate } from '#lib/seo/builder.ts';
import type { RequestHandler } from './$types';

const formatDate = isoDate;

function latestRecipeDate(): string {
	const latest = recipes.reduce(
		(max, recipe) => (modifiedDate(recipe) > max ? modifiedDate(recipe) : max),
		modifiedDate(recipes[0])
	);
	return formatDate(latest);
}

// Bump when the privacy page text changes.
const privacyLastModified = '2026-11-20';

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: RequestHandler = () => {
	const pages = [
		{ loc: siteUrl, lastmod: latestRecipeDate(), image: undefined as string | undefined, title: siteName, priority: undefined as string | undefined },
		...recipes.map((recipe) => ({
			loc: `${siteUrl}/${recipe.slug}`,
			lastmod: formatDate(modifiedDate(recipe)),
			image: getPhoto(recipe.slug).isPlaceholder ? undefined : getPhoto(recipe.slug).social['16x9'].src,
			title: recipe.title,
			priority: undefined as string | undefined
		})),
		{ loc: `${siteUrl}/privatliv`, lastmod: privacyLastModified, image: undefined, title: 'Privatliv', priority: '0.1' }
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages
	.map(
		(page) => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>${
		page.priority ? `
    <priority>${page.priority}</priority>` : ''}${
		page.image
			? `
    <image:image>
      <image:loc>${siteUrl}${page.image}</image:loc>
      <image:title>${escapeXml(page.title)}</image:title>
    </image:image>`
			: ''
	}
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

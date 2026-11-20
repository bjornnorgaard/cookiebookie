import { recipes } from '#lib/data/recipes.ts';
import { siteDescription, siteLanguage, siteName, siteUrl } from '#lib/constants/site.ts';
import { getPhoto } from '#lib/images.ts';
import { modifiedDate } from '#lib/seo/builder.ts';
import type { RequestHandler } from './$types';

const escapeXml = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// RFC 822 date at noon UTC, so the calendar day is stable in every timezone.
const rfc822 = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12)).toUTCString();

export const GET: RequestHandler = () => {
	// Newest first, as feed readers expect.
	const sorted = [...recipes].sort((a, b) => b.datePublished.getTime() - a.datePublished.getTime());
	const lastBuild = recipes.reduce((max, r) => (modifiedDate(r) > max ? modifiedDate(r) : max), modifiedDate(recipes[0]));

	const items = sorted
		.map((recipe) => {
			const link = `${siteUrl}/${recipe.slug}`;
			const { social, isPlaceholder } = getPhoto(recipe.slug);
			// The drawn placeholder is not a photo of the dish, so it is left out here as well.
			const image = isPlaceholder ? '' : `${siteUrl}${social['16x9'].src}`;
			const description = `${recipe.shortDesc} ${recipe.longDesc}`;
			return `    <item>
      <title>${escapeXml(recipe.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${rfc822(recipe.datePublished)}</pubDate>
      <description>${escapeXml(description)}</description>${
				image
					? `
      <media:content url="${image}" medium="image" type="image/jpeg" />`
					: ''
			}
    </item>`;
		})
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>${siteLanguage}</language>
    <lastBuildDate>${rfc822(lastBuild)}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};

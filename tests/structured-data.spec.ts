import { expect, test, type Page } from '@playwright/test';

type Json = Record<string, any>;

const origin = 'https://cookiebookie.dk';
const isoDuration = /^PT(?:\d+H)?(?:\d+M)?$/;
const isoDay = /^\d{4}-\d{2}-\d{2}$/;
const placeholders = ['brod', 'tomatsalat', 'camillas-kikgryde', 'svinemorbrad', 'rasmus-klump-pandekager'];

async function jsonLd(page: Page): Promise<Json[]> {
	const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
	return raw.map((text) => JSON.parse(text));
}

async function recipeSlugs(page: Page): Promise<string[]> {
	await page.goto('/');
	const hrefs = await page.locator('main a[href^="/"]').evaluateAll((els) => els.map((e) => e.getAttribute('href')!));
	return [...new Set(hrefs)].map((h) => h.slice(1));
}

function expectAbsolute(url: unknown) {
	expect(typeof url).toBe('string');
	expect(() => new URL(url as string)).not.toThrow();
	expect(url as string).toMatch(/^https:\/\//);
}

test('every recipe page has exactly one valid, complete Recipe item', async ({ page }) => {
	const slugs = await recipeSlugs(page);
	expect(slugs.length).toBeGreaterThan(5);
	for (const slug of slugs) {
		await page.goto(`/${slug}`);
		const items = await jsonLd(page);
		const recipes = items.filter((i) => i['@type'] === 'Recipe');
		expect(recipes, slug).toHaveLength(1);
		expect(items.filter((i) => i['@type'] === 'BreadcrumbList')).toHaveLength(1);
		const r = recipes[0];

		for (const key of ['name', 'description', 'author', 'publisher', 'recipeIngredient', 'recipeInstructions'])
			expect(r[key], `${slug}.${key}`).toBeTruthy();
		for (const key of ['prepTime', 'cookTime', 'totalTime']) expect(r[key]).toMatch(isoDuration);
		expect(r.datePublished).toMatch(isoDay);
		expect(r.dateModified).toMatch(isoDay);
		expect(r.dateModified >= r.datePublished).toBe(true);
		expect(r.inLanguage).toBe('da-DK');
		expect(r.recipeYield).toHaveLength(2);
		expect(r.recipeYield[1]).toBe(`${r.recipeYield[0]} portioner`);

		expect(r.author['@type']).toBe('Person');
		if (r.author.name === 'Bjørn Nørgaard') expect(r.author.url).toBe('https://bybear.dk');
		expect(r.publisher['@type']).toBe('Organization');
		expectAbsolute(r.publisher.logo.url);
		expectAbsolute(r.url);
		expectAbsolute(r.mainEntityOfPage);
		expect(r.url).toBe(`${origin}/${slug}`);

		const section = r.recipeInstructions[0];
		expect(section['@type']).toBe('HowToSection');
		expect(section.itemListElement.length).toBeGreaterThan(0);
		for (const step of section.itemListElement) {
			expect(step['@type']).toBe('HowToStep');
			expect(step.text).toBeTruthy();
			expectAbsolute(step.url);
		}

		if (placeholders.includes(slug)) expect(r.image, slug).toBeUndefined();
		else {
			expect(r.image, slug).toHaveLength(3);
			r.image.forEach(expectAbsolute);
		}
		// Never fabricate ratings; optional data is omitted rather than empty.
		expect(r.aggregateRating).toBeUndefined();
		expect(r.review).toBeUndefined();
		expect(JSON.stringify(r)).not.toMatch(/null|undefined|NaN/);

		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /max-image-preview:large/);
		await expect(page.locator('meta[property="article:modified_time"]')).toHaveAttribute('content', r.dateModified);
		await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute('href', `${origin}/rss.xml`);
	}
});

test('known diets map to schema.org and absent data stays omitted', async ({ page }) => {
	await page.goto('/camillas-kikgryde');
	const r = (await jsonLd(page)).find((i) => i['@type'] === 'Recipe')!;
	expect(r.suitableForDiet).toEqual(['https://schema.org/VegetarianDiet']);
	expect(r.nutrition).toBeUndefined();
	expect(r.estimatedCost).toBeUndefined();
});

test('home page has WebSite, Organization and an ItemList of every recipe', async ({ page }) => {
	const slugs = await recipeSlugs(page);
	const items = await jsonLd(page);
	expect(items.map((i) => i['@type']).sort()).toEqual(['ItemList', 'Organization', 'WebSite']);
	const org = items.find((i) => i['@type'] === 'Organization')!;
	expectAbsolute(org.logo.url);
	const list = items.find((i) => i['@type'] === 'ItemList')!;
	expect(list.itemListElement).toHaveLength(slugs.length);
	list.itemListElement.forEach((entry: Json, i: number) => {
		expect(entry.position).toBe(i + 1);
		expectAbsolute(entry.url);
		expect(entry.name).toBeTruthy();
		const slug = new URL(entry.url).pathname.slice(1);
		if (placeholders.includes(slug)) expect(entry.image).toBeUndefined();
		else expectAbsolute(entry.image);
	});
	expect(new Set(list.itemListElement.map((e: Json) => new URL(e.url).pathname.slice(1)))).toEqual(new Set(slugs));
});

test('rss feed is well-formed and lists every recipe', async ({ page, request }) => {
	const slugs = await recipeSlugs(page);
	const res = await request.get('/rss.xml');
	expect(res.status()).toBe(200);
	expect(res.headers()['content-type']).toContain('application/rss+xml');
	const xml = await res.text();
	// The browser's XML parser yields a parsererror element on malformed XML.
	const result = await page.evaluate((text) => {
		const doc = new DOMParser().parseFromString(text, 'application/xml');
		return {
			error: doc.querySelector('parsererror')?.textContent ?? null,
			items: [...doc.querySelectorAll('item')].map((item) => ({
				link: item.querySelector('link')?.textContent,
				title: item.querySelector('title')?.textContent,
				pubDate: item.querySelector('pubDate')?.textContent,
				description: item.querySelector('description')?.textContent
			}))
		};
	}, xml);
	expect(result.error).toBeNull();
	expect(result.items.map((i) => i.link).sort()).toEqual(slugs.map((s) => `${origin}/${s}`).sort());
	for (const item of result.items) {
		expect(item.title).toBeTruthy();
		expect(item.description).toBeTruthy();
		expect(Number.isNaN(Date.parse(item.pubDate!))).toBe(false);
	}
	for (const slug of placeholders) expect(xml).not.toContain(`/images/recipes/${slug}/`);
});

test('sitemap carries lastmod from dateModified', async ({ request }) => {
	const xml = await (await request.get('/sitemap.xml')).text();
	const entry = (slug: string) => new RegExp(`/${slug}</loc>\\s*<lastmod>(\\d{4}-\\d{2}-\\d{2})</lastmod>`).exec(xml)?.[1];
	// risotto was edited after it was published (2023-03-05 -> 2023-03-10).
	expect(entry('risotto')).toBe('2023-03-10');
	expect(entry('lasagne')).toMatch(isoDay);
	expect(xml.match(/<lastmod>/g)!.length).toBeGreaterThan(5);
});

test('logo files are served', async ({ request }) => {
	for (const file of ['/logo.png', '/logo.svg']) expect((await request.get(file)).status()).toBe(200);
});

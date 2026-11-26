import { expect, test, type Page } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';

declare global {
	interface Window {
		__shared: ShareData[];
		__copied: string[];
	}
}

const slugs = readdirSync('src/recipes')
	.filter((f) => f.endsWith('.ts'))
	.map((f) => readFileSync(`src/recipes/${f}`, 'utf8').match(/slug:\s*["']([^"']+)["']/)![1]);

const URL_OF = (slug: string) => `https://cookiebookie.dk/${slug}`;

/** Stub navigator.share (records payloads) and the clipboard (records text, or rejects when `clipboard` is false). */
async function stubApis(page: Page, { share, clipboard }: { share: boolean; clipboard: boolean }) {
	await page.addInitScript(
		({ share, clipboard }) => {
			window.__shared = [];
			window.__copied = [];
			Object.defineProperty(navigator, 'share', {
				configurable: true,
				value: share ? async (d: ShareData) => void window.__shared.push(d) : undefined
			});
			Object.defineProperty(navigator, 'clipboard', {
				configurable: true,
				value: clipboard
					? { writeText: async (t: string) => void window.__copied.push(t) }
					: { writeText: async () => Promise.reject(new DOMException('denied', 'NotAllowedError')) }
			});
		},
		{ share, clipboard }
	);
}

test.describe('share', () => {
	test('uses the native share sheet with title, text and canonical url', async ({ page }) => {
		await stubApis(page, { share: true, clipboard: true });
		await page.goto('/ristaffel');
		await page.getByTestId('share-button').click();

		const shared = await page.evaluate(() => window.__shared);
		expect(shared).toHaveLength(1);
		expect(shared[0].url).toBe(URL_OF('ristaffel'));
		expect(shared[0].title).toBe('Ristaffel');
		expect(shared[0].text).toContain('Ristaffel – ');
		expect(shared[0].text!.length).toBeGreaterThan('Ristaffel – '.length);
		await expect(page.getByTestId('share-popover')).toBeHidden();
	});

	test('native "Del indkøbslisten" shares scaled amounts, one ingredient per line', async ({ page }) => {
		await stubApis(page, { share: true, clipboard: true });
		await page.goto('/ristaffel');
		const more = page.getByRole('button', { name: 'Flere portioner' });
		await more.click();
		await more.click(); // 4 -> 6
		await page.getByTestId('share-list-inline').click();

		const shared = await page.evaluate(() => window.__shared);
		expect(shared).toHaveLength(1);
		const lines = shared[0].text!.split('\n');
		expect(lines[0]).toBe('Indkøbsliste: Ristaffel (6 portioner)');
		expect(lines).toContain('Kylling, 750 g');
	});

	test('falls back to a popover and the clipboard without navigator.share', async ({ page }) => {
		await stubApis(page, { share: false, clipboard: true });
		await page.goto('/ristaffel');
		await page.getByTestId('share-button').click();

		const popover = page.getByTestId('share-popover');
		await expect(popover).toBeVisible();
		const copy = page.getByTestId('copy-link');
		await expect(copy).toHaveText('Kopiér link');
		await copy.click();

		await expect(copy).toHaveText('Kopieret ✓');
		await expect(page.getByTestId('share-status')).toHaveText('Link kopieret');
		expect(await page.evaluate(() => window.__copied)).toEqual([URL_OF('ristaffel')]);
		// ...and goes back to normal.
		await expect(copy).toHaveText('Kopiér link', { timeout: 5000 });

		await expect(popover.getByRole('link', { name: /e-mail/i })).toHaveAttribute('href', /^mailto:/);
		await expect(popover.getByRole('link', { name: /sms/i })).toHaveAttribute('href', /^sms:/);
	});

	test('copies the shopping list with current amounts', async ({ page }) => {
		await stubApis(page, { share: false, clipboard: true });
		await page.goto('/ristaffel');
		await page.getByRole('button', { name: 'Flere portioner' }).click(); // 5
		await page.getByTestId('share-button').click();
		await page.getByTestId('copy-list').click();
		await expect(page.getByTestId('copy-list')).toContainText('Kopieret ✓');

		const [text] = await page.evaluate(() => window.__copied);
		expect(text.split('\n')[0]).toBe('Indkøbsliste: Ristaffel (5 portioner)');
		expect(text).toMatch(/^Kylling, 6\d\d g$|^Kylling, 625 g$/m);
	});

	test('shows a selected field when the clipboard is blocked', async ({ page }) => {
		await stubApis(page, { share: false, clipboard: false });
		await page.goto('/ristaffel');
		await page.getByTestId('share-button').click();
		await page.getByTestId('copy-link').click();

		const field = page.getByTestId('share-popover').locator('textarea');
		await expect(field).toBeVisible();
		await expect(field).toHaveValue(URL_OF('ristaffel'));
		await expect(field).toBeFocused();
	});

	test('Escape closes the popover and returns focus to the button', async ({ page }) => {
		await stubApis(page, { share: false, clipboard: true });
		await page.goto('/ristaffel');
		const button = page.getByTestId('share-button');
		await button.click();
		await expect(page.getByTestId('copy-link')).toBeFocused();
		await page.keyboard.press('Escape');
		await expect(page.getByTestId('share-popover')).toBeHidden();
		await expect(button).toBeFocused();
	});

	test('an aborted native share is not an error and opens nothing', async ({ page }) => {
		await page.addInitScript(() => {
			Object.defineProperty(navigator, 'share', {
				configurable: true,
				value: async () => Promise.reject(new DOMException('cancelled', 'AbortError'))
			});
		});
		await page.goto('/ristaffel');
		await page.getByTestId('share-button').click();
		await expect(page.getByTestId('share-popover')).toBeHidden();
	});
});

test.describe('print', () => {
	test('print stylesheet hides the chrome and shows two columns', async ({ page }) => {
		await page.goto('/ristaffel');
		await page.emulateMedia({ media: 'print' });

		await expect(page.locator('header.sticky')).toBeHidden();
		await expect(page.locator('footer')).toBeHidden();
		await expect(page.getByTestId('share-actions')).toBeHidden();
		await expect(page.locator('.scroll-progress')).toBeHidden();
		await expect(page.locator('nav[aria-label="Brødkrummer"]')).toBeHidden();
		await expect(page.locator('#ingredients')).toBeHidden(); // the screen list

		const sheet = page.locator('.print-sheet');
		await expect(sheet).toBeVisible();
		const ingredients = await sheet.locator('.ps-col-ingredients').boundingBox();
		const steps = await sheet.locator('.ps-col-steps').boundingBox();
		expect(ingredients && steps).toBeTruthy();
		// Side by side: the steps start to the right of the ingredients, at the same height.
		expect(steps!.x).toBeGreaterThan(ingredients!.x + ingredients!.width - 1);
		expect(Math.abs(steps!.y - ingredients!.y)).toBeLessThan(60);

		// Empty squares for a pen, one per ingredient and step.
		const recipeCounts = await sheet.locator('.ps-ingredients li').count();
		expect(recipeCounts).toBeGreaterThan(3);
		expect(await sheet.locator('.ps-box').count()).toBe(recipeCounts + (await sheet.locator('.ps-steps li').count()));

		// Photo (small), url and a QR code.
		const photo = await sheet.locator('.ps-photo').boundingBox();
		expect(photo!.width).toBeLessThan(260); // about 6 cm at 96 dpi = 227 px
		await expect(sheet.locator('.ps-qr path')).toHaveCount(1);
		await expect(sheet).toContainText('cookiebookie.dk/ristaffel');
	});

	test('print shows the current portion count and scaled amounts', async ({ page }) => {
		await page.goto('/ristaffel');
		const more = page.getByRole('button', { name: 'Flere portioner' });
		await more.click();
		await more.click(); // 6
		await page.emulateMedia({ media: 'print' });

		const sheet = page.locator('.print-sheet');
		await expect(sheet.locator('[data-print-portions]')).toHaveText('6 portioner');
		await expect(sheet.locator('.ps-ingredients li', { hasText: 'Kylling' })).toContainText('Kylling, 750 g');
	});

	test('the printout is identical in dark mode', async ({ page }) => {
		const shot = async (mode: 'light' | 'dark') => {
			await page.addInitScript((m) => localStorage.setItem('theme', m), mode);
			await page.emulateMedia({ media: 'print', colorScheme: mode });
			await page.goto('/ristaffel');
			await page.evaluate(() => document.fonts.ready);
			const colours = await page.evaluate(() => ({
				mode: document.documentElement.dataset.mode,
				bodyBg: getComputedStyle(document.body).backgroundColor,
				bodyImage: getComputedStyle(document.body).backgroundImage,
				title: getComputedStyle(document.querySelector('.ps-title')!).color
			}));
			return { colours, png: await page.screenshot({ fullPage: true }) };
		};
		const light = await shot('light');
		expect(light.colours.mode).toBe('light');
		const dark = await shot('dark');
		expect(dark.colours.mode).toBe('dark');

		expect(dark.colours.bodyBg).toBe('rgb(255, 255, 255)');
		expect(dark.colours.bodyImage).toBe('none');
		expect(dark.colours.title).toBe('rgb(0, 0, 0)');
		expect(dark.png.equals(light.png)).toBe(true);
	});

	test('the Udskriv button calls window.print', async ({ page }) => {
		await page.addInitScript(() => {
			(window as unknown as { __printed: number }).__printed = 0;
			window.print = () => void ((window as unknown as { __printed: number }).__printed += 1);
		});
		await page.goto('/ristaffel');
		await page.getByTestId('print-button').click();
		await expect.poll(() => page.evaluate(() => (window as unknown as { __printed: number }).__printed)).toBe(1);
	});

	test('the print photo is not downloaded on screen, and the Udskriv button loads it before printing', async ({ page }) => {
		const photoRequests: string[] = [];
		page.on('request', (r) => r.url().includes('/images/') && photoRequests.push(r.url()));
		await page.addInitScript(() => {
			(window as unknown as { __photoReady: boolean | null }).__photoReady = null;
			window.print = () => {
				const img = document.querySelector<HTMLImageElement>('.ps-photo');
				(window as unknown as { __photoReady: boolean }).__photoReady = !!img && img.complete && img.naturalWidth > 0;
			};
		});
		await page.goto('/lasagne');
		await page.waitForLoadState('networkidle');
		const printSrc = await page.locator('.ps-photo').getAttribute('src');
		expect(printSrc).toBeTruthy();
		expect(photoRequests.some((u) => u.endsWith(printSrc!))).toBe(false);

		await page.getByTestId('print-button').click();
		await expect.poll(() => page.evaluate(() => (window as unknown as { __photoReady: boolean | null }).__photoReady)).toBe(true);
	});

	test('every recipe has a generated QR code (run `npm run qr` after adding a recipe)', () => {
		const generated = readFileSync('src/lib/data/qr.generated.ts', 'utf8');
		for (const slug of slugs) expect(generated).toContain(`"${slug}":`);
	});

	for (const slug of slugs) {
		test(`${slug} fits on two A4 pages`, async ({ page }) => {
			await page.goto(`/${slug}`);
			await page.evaluate(() => document.fonts.ready);
			// The print photo is lazy and hidden on screen: show the print layout so it loads before the PDF is cut.
			await page.emulateMedia({ media: 'print' });
			await page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>('.ps-photo')].every((i) => i.complete));
			const pdf = await page.pdf({ format: 'A4', preferCSSPageSize: true, printBackground: false });
			// Chrome writes an uncompressed page tree: "/Count N" on the /Pages node.
			const pages = Math.max(0, ...[...pdf.toString('latin1').matchAll(/\/Count (\d+)/g)].map((m) => Number(m[1])));
			expect(pages).toBeGreaterThanOrEqual(1);
			expect(pages).toBeLessThanOrEqual(2);
		});
	}
});

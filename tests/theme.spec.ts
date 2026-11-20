import { expect, test } from '@playwright/test';

const toggle = (page: import('@playwright/test').Page) => page.getByTestId('theme-toggle');

for (const scheme of ['light', 'dark'] as const) {
	test(`defaults to the device (${scheme})`, async ({ browser }) => {
		const context = await browser.newContext({ colorScheme: scheme });
		const page = await context.newPage();
		await page.goto('/');
		await expect(page.locator('html')).toHaveAttribute('data-mode', scheme);
		expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe(scheme);
		await context.close();
	});
}

test('click toggles, label describes the action, choice survives reload, and can return to the device', async ({ browser }) => {
	const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'reduce' });
	const page = await context.newPage();
	await page.goto('/');
	await expect(toggle(page)).toHaveAccessibleName('Skift til mørk tilstand');
	const box = await toggle(page).boundingBox();
	expect(box!.width).toBeGreaterThanOrEqual(44);
	expect(box!.height).toBeGreaterThanOrEqual(44);

	await toggle(page).click();
	await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
	await expect(toggle(page)).toHaveAccessibleName('Skift til lys tilstand');
	expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');
	// Forced dark: only the dark theme-color tag applies.
	expect(await page.locator('meta[name="theme-color"][media="all"]').getAttribute('content')).toBe('#1b1612');

	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');

	// Back to following the device (emulated light).
	await page.getByTestId('theme-follow-device').click();
	await expect(page.locator('html')).toHaveAttribute('data-mode', 'light');
	expect(await page.evaluate(() => localStorage.getItem('theme'))).toBeNull();

	// The animated path (View Transition) ends in the same state.
	await context.close();
	const animated = await browser.newContext({ colorScheme: 'light' });
	const p2 = await animated.newPage();
	await p2.goto('/');
	await toggle(p2).click();
	await expect(p2.locator('html')).toHaveAttribute('data-mode', 'dark');
	await expect(p2.locator('html')).not.toHaveClass(/theme-vt/);
	await animated.close();
});

test('no flash: data-mode is set before first paint', async ({ browser }) => {
	const context = await browser.newContext({ colorScheme: 'light' });
	await context.addInitScript(() => {
		if (location.pathname === '/') localStorage.setItem('theme', 'dark');
	});
	const page = await context.newPage();
	// Record the mode at DOMContentLoaded, before hydration (onMount) can have run.
	await page.addInitScript(() => {
		document.addEventListener('DOMContentLoaded', () => {
			(window as any).__modeAtDcl = document.documentElement.dataset.mode;
		});
	});
	await page.goto('/');
	expect(await page.evaluate(() => (window as any).__modeAtDcl)).toBe('dark');
	await context.close();
});

test('a following-the-device page reacts to live scheme changes', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' });
	await page.goto('/');
	await expect(page.locator('html')).toHaveAttribute('data-mode', 'light');
	await page.emulateMedia({ colorScheme: 'dark' });
	await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
});

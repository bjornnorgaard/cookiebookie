import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * axe accessibility scan (WCAG 2.2 A/AA) across pages x colour schemes x viewports x UI states.
 *
 * Adding a state (consent notice, timer dock, cook mode, share menu, ...): append an entry to STATES below.
 * `setup` runs before navigation (seed storage, route mocks), `act` runs after the page loaded (click, tick, open).
 * Every entry is then scanned on every page it applies to, in light and dark, at phone and desktop width.
 *
 * Violations fail the test. A known-acceptable one needs an entry in ACCEPTED with a reason.
 */

interface PageCase {
	name: string;
	path: string;
	/** Page-specific state? Only scan states whose `pages` include this name (default: every page). */
	kind: 'home' | 'photo' | 'placeholder' | 'not-found';
}

const PAGES: PageCase[] = [
	{ name: 'home', path: '/', kind: 'home' },
	{ name: 'photo recipe', path: '/lasagne', kind: 'photo' },
	{ name: 'placeholder recipe', path: '/tomatsalat', kind: 'placeholder' },
	{ name: 'not found', path: '/missing-recipe', kind: 'not-found' }
];

interface State {
	name: string;
	/** Which page kinds this state exists on. */
	on: PageCase['kind'][];
	setup?: (page: Page) => Promise<void>;
	act?: (page: Page) => Promise<void>;
}

const STATES: State[] = [
	{ name: 'default', on: ['home', 'photo', 'placeholder', 'not-found'] },
	{
		// Header pill is visible once keep-awake is on (the preference is read from localStorage on mount).
		name: 'keep-awake on',
		on: ['photo', 'placeholder'],
		setup: async page => {
			await page.addInitScript(() => localStorage.setItem('keep_awake', '1'));
		},
		act: async page => {
			await expect(page.getByRole('button', { name: /Skærm tændt/ })).toBeVisible();
		}
	},
	{
		// Ticking step 2 ticks 1-2 and highlights step 3 as the next one.
		name: 'steps partly ticked',
		on: ['photo', 'placeholder'],
		act: async page => {
			// The placeholder recipe has a single step, so fall back to the first one.
			const step = page.locator((await page.locator('#step2 input').count()) ? '#step2 input' : '#step1 input');
			await step.check();
			await expect(step).toBeChecked();
		}
	},
	{
		name: 'ingredients partly ticked',
		on: ['photo'],
		act: async page => {
			await page.locator('#ingredients input[type="checkbox"]').first().check();
		}
	}
	// Later: { name: 'consent notice open', ... }, { name: 'timer dock', ... }, { name: 'cook mode', ... }, { name: 'share menu', ... }
];

const VIEWPORTS = [
	{ name: 'phone', width: 390, height: 844 },
	{ name: 'desktop', width: 1280, height: 900 }
];
const SCHEMES = ['light', 'dark'] as const;

/** Known-acceptable axe rule ids, each with the reason. Keep this empty if you can. */
const ACCEPTED: Record<string, string> = {};

test.describe('axe WCAG 2.2 A/AA', () => {
	for (const viewport of VIEWPORTS) {
		for (const scheme of SCHEMES) {
			test.describe(`${viewport.name} / ${scheme}`, () => {
				test.use({ colorScheme: scheme, viewport: { width: viewport.width, height: viewport.height } });

				for (const pageCase of PAGES) {
					for (const state of STATES.filter(s => s.on.includes(pageCase.kind))) {
						test(`${pageCase.name} / ${state.name}`, async ({ page }) => {
							await state.setup?.(page);
							await page.goto(pageCase.path);
							// Hydrated and entrance animations finished, so colours are final (contrast is measured live).
							await page.waitForLoadState('networkidle');
							await state.act?.(page);
							await page.waitForTimeout(500); // let fade/transition effects of the state settle
							await page.evaluate(() => document.getAnimations().forEach(a => { try { a.finish(); } catch { /* infinite animations (scroll timelines) */ } }));

							const results = await new AxeBuilder({ page })
								.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
								.disableRules(Object.keys(ACCEPTED))
								.analyze();

							const summary = results.violations.map(v => ({
								rule: v.id,
								impact: v.impact,
								help: v.help,
								nodes: v.nodes.map(n => n.target.join(' ') + ' :: ' + (n.failureSummary ?? '').replace(/\s+/g, ' ')).slice(0, 5)
							}));
							expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
						});
					}
				}
			});
		}
	}
});

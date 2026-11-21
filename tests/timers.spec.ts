import { expect, test, type Page } from '@playwright/test';

const T0 = new Date('2026-11-20T12:00:00Z');

/** Stub the alert APIs so the suite can see what would have happened. */
async function stubAlerts(page: Page, permission = 'default', wakeLock = false) {
	await page.addInitScript(
		({ perm, wake }) => {
			const w = window as any;
			w.__alerts = { chimes: 0, vibrations: [] as number[][], notifications: [] as string[], asked: 0 };
			class FakeAudio {
				currentTime = 0;
				destination = {};
				resume() {
					return Promise.resolve();
				}
				createOscillator() {
					w.__alerts.chimes++;
					return { type: '', frequency: {}, connect: (n: any) => n, start() {}, stop() {} };
				}
				createGain() {
					return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect: (n: any) => n };
				}
			}
			w.AudioContext = FakeAudio;
			navigator.vibrate = (p: any) => {
				w.__alerts.vibrations.push(p);
				return true;
			};
			class FakeNotification {
				static permission = perm;
				static requestPermission() {
					w.__alerts.asked++;
					FakeNotification.permission = 'granted';
					return Promise.resolve('granted');
				}
				constructor(title: string) {
					w.__alerts.notifications.push(title);
				}
			}
			w.Notification = FakeNotification;
			if (wake) {
				Object.defineProperty(navigator, 'wakeLock', {
					value: { request: () => Promise.resolve({ addEventListener() {}, release: () => Promise.resolve() }) },
					configurable: true
				});
			}
			// Keep the consent card out of the way.
			localStorage.setItem('consent', JSON.stringify({ analytics: false, decidedAt: new Date().toISOString(), version: 1 }));
		},
		{ perm: permission, wake: wakeLock }
	);
}

const alerts = (page: Page) => page.evaluate(() => (window as any).__alerts);
const dock = (page: Page) => page.getByRole('region', { name: 'Timere' });
const rows = (page: Page) => page.getByTestId('timer-row');

async function open(page: Page, slug = 'lasagne', permission = 'default', wakeLock = false) {
	await stubAlerts(page, permission, wakeLock);
	await page.clock.install({ time: T0 });
	await page.goto(`/${slug}`);
	await freeze(page);
}

/** Real time keeps flowing after install(); freeze it so only runFor() moves the clock. */
async function freeze(page: Page) {
	await page.clock.pauseAt(new Date(Date.now() + 1000));
}

test('a range gives two chips; steps without durations have none', async ({ page }) => {
	await open(page);
	await expect(page.locator('#step4').getByTestId('timer-start')).toHaveText([/Start 45 min/, /Start 60 min/]);
	await expect(page.locator('#step1').getByTestId('timer-start')).toHaveCount(0);
	await expect(dock(page)).toHaveCount(0);
});

test('start, count down, pause/resume, +1 and remove; the step is not auto-ticked', async ({ page }) => {
	await open(page);
	await page.locator('#step4').getByRole('button', { name: /Start 45 min, Simre/ }).click();
	await expect(rows(page)).toHaveCount(1);
	await expect(rows(page).first().locator('time')).toHaveText('45:00');
	await expect(page.locator('#step-check-3')).not.toBeChecked();
	await expect(page.getByTestId('timer-announcer')).toContainText('Timer startet: Simre, 45 min');

	await page.clock.runFor(30_000);
	await expect(rows(page).first().locator('time')).toHaveText('44:30');

	await rows(page).first().getByRole('button', { name: 'Pause Simre' }).click();
	await page.clock.runFor(120_000);
	await expect(rows(page).first().locator('time')).toHaveText('44:30');
	await rows(page).first().getByRole('button', { name: 'Genoptag Simre' }).click();
	await page.clock.runFor(10_000);
	await expect(rows(page).first().locator('time')).toHaveText('44:20');

	await rows(page).first().getByRole('button', { name: '+1 minut, Simre' }).click();
	await expect(rows(page).first().locator('time')).toHaveText('45:20');

	// The chip on the step mirrors the dock.
	await expect(page.locator('#step4').getByTestId('timer-chip')).toContainText('45:20');

	await rows(page).first().getByRole('button', { name: 'Fjern timer Simre' }).click();
	await expect(dock(page)).toHaveCount(0);
	await expect(page.locator('#step4').getByTestId('timer-start').first()).toBeVisible();
});

test('survives a reload with an absolute end time', async ({ page }) => {
	await open(page);
	await page.locator('#step4').getByRole('button', { name: /Start 45 min, Simre/ }).click();
	await page.clock.runFor(60_000);
	await page.reload();
	await expect(rows(page).first().locator('time')).toHaveText('44:00');
	await page.clock.runFor(600_000);
	await expect(rows(page).first().locator('time')).toHaveText('34:00');
});

test('finished while closed: restores as done with how long ago; drops after a day', async ({ page }) => {
	await open(page, 'camillas-kikgryde');
	// Write a timer that already ended while away, then reload so init marks it done without ringing.
	await page.evaluate(() => {
		const endsAt = Date.now() - 2 * 60_000;
		localStorage.setItem(
			'timers',
			JSON.stringify({
				v: 1,
				muted: false,
				list: [
					{
						id: 'away',
						key: 'camillas-kikgryde:1:10',
						recipeSlug: 'camillas-kikgryde',
						recipeTitle: 'Kikærtegryde',
						stepIndex: 1,
						stepTitle: 'Simre',
						label: 'Simre',
						totalMs: 10 * 60_000,
						endsAt,
						remainingMs: null,
						done: false,
						warned: true
					}
				]
			})
		);
	});
	await page.reload();
	await expect(rows(page).first()).toHaveAttribute('data-status', 'done');
	await expect(rows(page).first().locator('time')).toContainText(/for 2 min siden/);
	expect((await alerts(page)).chimes).toBe(0);

	await page.clock.runFor(3 * 60 * 60_000);
	await expect(rows(page).first().locator('time')).toContainText(/for 3 t\./);

	await page.clock.runFor(22 * 60 * 60_000);
	await expect(dock(page)).toHaveCount(0);
});

test('finish: chime three times, vibration, notification, title, done row; dismiss restores the title', async ({ page }) => {
	await open(page, 'camillas-kikgryde', 'granted');
	const title = await page.title();
	await page.locator('#step2').getByRole('button', { name: /Start 10 min, Simre/ }).click();
	await page.clock.runFor(9 * 60_000 + 5_000);
	await expect(page.getByTestId('timer-announcer')).toContainText('Simre: 1 minut tilbage');
	await expect(rows(page).first()).toHaveClass(/last/);
	expect((await alerts(page)).chimes).toBe(0);

	await page.clock.runFor(56_000);
	await expect(rows(page).first()).toHaveAttribute('data-status', 'done');
	await expect(rows(page).first()).toContainText('Færdig!');
	await expect(page).toHaveTitle('⏰ Færdig · Cookie Bookie');
	const a = await alerts(page);
	expect(a.chimes).toBe(6); // three chimes of two notes
	expect(a.vibrations).toHaveLength(1);
	expect(a.notifications).toEqual(['Simre er færdig']);
	await expect(page.getByTestId('timer-announcer')).toContainText('Simre er færdig');

	await page.clock.runFor(90_000);
	await expect(rows(page).first().locator('time')).toContainText(/for 1 min siden/);

	await rows(page).first().getByRole('button', { name: 'Fjern timer Simre' }).click();
	await expect(page).toHaveTitle(title);
});

test('mute silences the chime but not the visual alert', async ({ page }) => {
	await open(page, 'camillas-kikgryde');
	await page.locator('#step1').getByRole('button', { name: /Start 3 min, Steg/ }).click();
	await dock(page).getByRole('switch', { name: /Lyd/ }).click();
	await expect(dock(page).getByRole('switch', { name: /Lyd/ })).toHaveAttribute('aria-checked', 'false');
	await page.clock.runFor(181_000);
	await expect(rows(page).first()).toHaveAttribute('data-status', 'done');
	expect((await alerts(page)).chimes).toBe(0);
});

test('several timers, soonest first, max 3 rows then "+N mere"', async ({ page }) => {
	await open(page, 'brod');
	await page.locator('#step4').getByRole('button', { name: /Start 12 t\., Hævning/ }).click();
	await page.locator('#step7').getByRole('button', { name: /Start .*, Forvarm/ }).click();
	await page.locator('#step8').getByRole('button', { name: /Start .*, Bagning/ }).click();
	await page.locator('#step10').getByRole('button', { name: /Start .*, Afkøling/ }).click();
	await expect(rows(page)).toHaveCount(3);
	await expect(rows(page).first().locator('time')).toHaveText('30:00');
	await dock(page).getByRole('button', { name: '+1 mere' }).click();
	await expect(rows(page)).toHaveCount(4);
});

test('timers from another recipe keep running and show the recipe name; tapping scrolls to the step', async ({ page }) => {
	await open(page);
	await page.locator('#step4').getByRole('button', { name: /Start 45 min, Simre/ }).click();
	await page.getByRole('link', { name: 'Forside' }).first().click();
	await page.clock.runFor(1000); // client navigation and view transitions need clock ticks
	await expect(page).toHaveURL(/\/$/);
	await page.clock.runFor(60_000);
	await expect(rows(page)).toHaveCount(1);
	await expect(rows(page).first()).toContainText('Lasagne');
	await expect(rows(page).first().locator('time')).toHaveText('43:59');

	await rows(page).first().getByRole('link').click();
	await page.clock.runFor(1000);
	await expect(page).toHaveURL(/\/lasagne#step4$/);
	await expect(page.locator('#step4').getByTestId('timer-chip')).toBeVisible();
});

test('offers: notification explained once on first start, never on load; keep-awake offered', async ({ page }) => {
	await open(page, 'lasagne', 'default', true);
	expect((await alerts(page)).asked).toBe(0);
	await page.locator('#step4').getByRole('button', { name: /Start 45 min, Simre/ }).click();
	await expect(dock(page)).toContainText('Vil du have en besked');
	await expect(dock(page).getByRole('switch', { name: 'Hold skærmen tændt' })).toBeVisible();
	expect((await alerts(page)).asked).toBe(0);
	await dock(page).getByRole('button', { name: 'Ja tak' }).first().click();
	expect((await alerts(page)).asked).toBe(1);
	await dock(page).getByRole('switch', { name: 'Hold skærmen tændt' }).click();
	expect(await page.evaluate(() => localStorage.getItem('keep_awake'))).toBe('1');
});

test('a second tab does not ring again', async ({ context, page }) => {
	await open(page);
	await page.locator('#step4').getByRole('button', { name: /Start 45 min, Simre/ }).click();
	const other = await context.newPage();
	await stubAlerts(other);
	await other.clock.install({ time: T0 });
	await other.goto('/lasagne');
	await freeze(other);
	await expect(other.getByTestId('timer-row')).toHaveCount(1);
	await page.clock.runFor(45 * 60_000 + 2000);
	await expect(rows(page).first()).toHaveAttribute('data-status', 'done');
	await other.clock.runFor(45 * 60_000 + 2000);
	await expect(other.getByTestId('timer-row').first()).toHaveAttribute('data-status', 'done');
	const a = await alerts(page);
	const b = await alerts(other);
	expect(a.chimes + b.chimes).toBe(6);
});

const browser = typeof window !== 'undefined';

/**
 * Light / dark mode.
 *
 * - `pref`: the remembered choice (`localStorage["theme"]`); `system` when nothing is stored.
 * - `mode`: what is actually shown. Mirrors `<html data-mode>`, which the inline script in app.html sets before first paint.
 */
const KEY = 'theme';
const QUERY = '(prefers-color-scheme: dark)';

export type Pref = 'system' | 'light' | 'dark';
export type Mode = 'light' | 'dark';

export const theme = $state<{ pref: Pref; mode: Mode }>({ pref: 'system', mode: 'light' });

function systemMode(): Mode {
	return window.matchMedia(QUERY).matches ? 'dark' : 'light';
}

function readPref(): Pref {
	try {
		const value = localStorage.getItem(KEY);
		return value === 'light' || value === 'dark' ? value : 'system';
	} catch {
		return 'system';
	}
}

/** Write the resolved mode to <html> and point the browser chrome colour at the matching theme-color meta. */
function apply(mode: Mode) {
	document.documentElement.dataset.mode = mode;
	theme.mode = mode;
	for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
		if (meta.dataset.media === undefined) meta.dataset.media = meta.media;
		const own = meta.dataset.media.includes('dark') ? 'dark' : 'light';
		// Following the device: keep the original media queries. Forced: only the matching tag applies.
		meta.media = theme.pref === 'system' ? meta.dataset.media : own === mode ? 'all' : 'not all';
	}
}

function resolve(): Mode {
	return theme.pref === 'system' ? systemMode() : theme.pref;
}

export function initTheme() {
	if (!browser) return;
	theme.pref = readPref();
	apply(resolve());
	window.matchMedia(QUERY).addEventListener('change', () => {
		if (theme.pref === 'system') apply(systemMode());
	});
}

export function setPref(pref: Pref) {
	theme.pref = pref;
	try {
		if (pref === 'system') localStorage.removeItem(KEY);
		else localStorage.setItem(KEY, pref);
	} catch {
		// storage unavailable: the choice just lasts for this page view
	}
	apply(resolve());
}

/** Flip between light and dark with a circular reveal growing from (x, y). Instant under reduced motion. */
export function toggleTheme(x: number, y: number) {
	const next: Mode = theme.mode === 'dark' ? 'light' : 'dark';
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduced || !document.startViewTransition) return setPref(next);

	const root = document.documentElement;
	const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
	root.classList.add('theme-vt');
	const transition = document.startViewTransition(() => setPref(next));
	transition.ready
		.then(() =>
			root.animate(
				{ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
				{ duration: 550, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' }
			)
		)
		.catch(() => {});
	transition.finished.finally(() => root.classList.remove('theme-vt'));
}

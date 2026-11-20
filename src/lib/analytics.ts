/**
 * Google Analytics, loaded only after the visitor has said yes.
 * Nothing here runs (and nothing is requested from Google) before `loadAnalytics()` is called.
 */
export const GA_ID = 'G-ZT1Z6X8C7F';
const SCRIPT_ID = 'ga-script';
const disableKey = `ga-disable-${GA_ID}`;

type GaWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void } & Record<string, unknown>;

export function loadAnalytics() {
	if (typeof document === 'undefined') return;
	const w = window as unknown as GaWindow;
	w[disableKey] = false;
	if (document.getElementById(SCRIPT_ID)) return;

	w.dataLayer = w.dataLayer || [];
	w.gtag = function gtag() {
		// gtag.js expects the real `arguments` object, not an array.
		// eslint-disable-next-line prefer-rest-params
		w.dataLayer!.push(arguments);
	};
	w.gtag('js', new Date());
	w.gtag('config', GA_ID);

	const script = document.createElement('script');
	script.id = SCRIPT_ID;
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
	document.head.appendChild(script);
}

/** Stop sending, and remove the cookies Google set on this site. */
export function disableAnalytics() {
	if (typeof document === 'undefined') return;
	(window as unknown as GaWindow)[disableKey] = true;
	deleteGaCookies();
}

export function deleteGaCookies() {
	const names = document.cookie
		.split(';')
		.map((c) => c.split('=')[0].trim())
		.filter((n) => n === '_ga' || n.startsWith('_ga_') || n === '_gid' || n.startsWith('_gat'));
	const host = location.hostname.split('.');
	// GA sets cookies on the registrable domain, so try every parent domain as well as the host itself.
	const parents = host.map((_, i) => '.' + host.slice(i).join('.')).filter((d) => d.indexOf('.', 1) > 0);
	for (const name of names) {
		for (const domain of ['', ...parents]) {
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ''}`;
		}
	}
}

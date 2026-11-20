import { deleteGaCookies, disableAnalytics, loadAnalytics } from '#lib/analytics.ts';

/**
 * Analytics consent. Stored as `localStorage.consent = { analytics, decidedAt, version }`.
 * No stored choice (or an expired / old-version one) means `unknown`: the notice is shown and analytics stay off.
 */
const KEY = 'consent';
const VERSION = 1;
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // re-ask after 12 months

export type ConsentStatus = 'unknown' | 'granted' | 'denied';

export const consent = $state({
	status: 'unknown' as ConsentStatus,
	/** Storage has been read; before this the notice must not render. */
	ready: false,
	/** The notice card is on screen (first ask, or re-opened from the footer / privacy page). */
	open: false,
	/** Set right after a choice, for the aria-live confirmation. */
	justSaved: null as null | ConsentStatus,
	/** The browser sends Global Privacy Control, treated as "no" until the visitor chooses otherwise. */
	gpc: false
});

function read(): ConsentStatus {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return 'unknown';
		const v = JSON.parse(raw);
		if (v?.version !== VERSION || typeof v.analytics !== 'boolean') return 'unknown';
		if (Date.now() - new Date(v.decidedAt).getTime() > MAX_AGE_MS) return 'unknown';
		return v.analytics ? 'granted' : 'denied';
	} catch {
		return 'unknown';
	}
}

function write(analytics: boolean) {
	try {
		localStorage.setItem(KEY, JSON.stringify({ analytics, decidedAt: new Date().toISOString(), version: VERSION }));
	} catch {
		/* storage blocked: the choice lasts for this page view only */
	}
}

function apply() {
	if (consent.status === 'granted') loadAnalytics();
	else disableAnalytics();
}

/** Called once from the root layout on mount. */
export function initConsent() {
	if (consent.ready) return;
	consent.gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
	consent.status = read();
	if (consent.status === 'unknown' && consent.gpc) {
		// Global Privacy Control counts as "no", without asking.
		consent.status = 'denied';
		write(false);
	}
	consent.ready = true;
	apply();
}

export function setConsent(analytics: boolean) {
	consent.status = analytics ? 'granted' : 'denied';
	consent.justSaved = consent.status;
	write(analytics);
	apply();
	if (!analytics) deleteGaCookies();
	consent.open = false;
}

export function openConsent() {
	consent.justSaved = null;
	consent.open = true;
}

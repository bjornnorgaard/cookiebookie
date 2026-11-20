const browser = typeof window !== 'undefined';

/**
 * Keep-screen-on while cooking, via the Screen Wake Lock API.
 *
 * - `enabled`: the user's remembered preference (localStorage).
 * - `viewing`: a recipe page is open; the lock is only held then.
 * - `active`: the browser actually granted a lock right now.
 * Browsers drop the lock whenever the tab is hidden, so it is re-requested when the tab is visible again.
 */
const KEY = 'keep_awake';

export const wake = $state({ supported: false, enabled: false, viewing: false, active: false });

let sentinel: WakeLockSentinel | null = null;
let ready = false;

async function acquire() {
	if (!wake.supported || sentinel || document.visibilityState !== 'visible') return;
	try {
		const lock = await navigator.wakeLock.request('screen');
		sentinel = lock;
		wake.active = true;
		lock.addEventListener('release', () => {
			if (sentinel === lock) sentinel = null;
			wake.active = false;
		});
	} catch {
		wake.active = false; // denied (e.g. battery saver): the toggle simply shows as not active
	}
}

async function release() {
	const lock = sentinel;
	sentinel = null;
	wake.active = false;
	try {
		await lock?.release();
	} catch {
		/* already released */
	}
}

function sync() {
	if (wake.enabled && wake.viewing) void acquire();
	else void release();
}

export function initWake() {
	if (!browser || ready) return;
	ready = true;
	wake.supported = 'wakeLock' in navigator;
	try {
		wake.enabled = localStorage.getItem(KEY) === '1';
	} catch {
		/* storage unavailable: start off */
	}
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') sync();
	});
}

export function setKeepAwake(on: boolean) {
	wake.enabled = on;
	try {
		localStorage.setItem(KEY, on ? '1' : '0');
	} catch {
		/* ignore */
	}
	sync();
}

export function setViewingRecipe(on: boolean) {
	wake.viewing = on;
	sync();
}

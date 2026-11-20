import { LAST_MINUTE_MS, MINUTE, formatMinutes, remainingAt, type StepTimerState } from '#lib/timerMath.ts';
import { setKeepAwake, wake } from '#lib/stores/wakeLock.svelte.ts';

/**
 * Step timers. Several can run at once, they survive reloads and navigation, and they ring even when the tab is in the
 * background. Everything is derived from absolute end times (see timerMath.ts); the 1 s interval only refreshes `now`.
 *
 * Persistence: localStorage `timers` = { v, list, muted }. Other tabs pick changes up through the `storage` event. The tab
 * that first sees a timer end marks it `done` in storage before ringing, so other tabs only sync and stay quiet.
 */
const browser = typeof window !== 'undefined';
const KEY = 'timers';
const NOTIFY_KEY = 'timers_notify_asked';
const VERSION = 1;
export const TITLE_DONE = '⏰ Færdig · Cookie Bookie';

export const timerState = $state({
	list: [] as StepTimerState[],
	muted: false,
	/** Refreshed every second while there are timers; drives every displayed countdown. */
	now: Date.now(),
	/** Text for the dock's aria-live region: start, one minute left and done only. */
	announcement: '',
	/** One-line offers shown in the dock after the first timer starts. */
	askNotify: false,
	askAwake: false
});

let ready = false;
let interval: ReturnType<typeof setInterval> | undefined;
let timeout: ReturnType<typeof setTimeout> | undefined;
let audio: AudioContext | undefined;

export interface StartInput {
	recipeSlug: string;
	recipeTitle: string;
	stepIndex: number;
	stepTitle: string;
	label: string;
	minutes: number;
}

export const timerKey = (slug: string, stepIndex: number, minutes: number) => `${slug}:${stepIndex}:${minutes}`;

// ---- persistence -------------------------------------------------------------------------------------------------

function load(): { list: StepTimerState[]; muted: boolean } | null {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return { list: [], muted: false };
		const v = JSON.parse(raw);
		if (v?.v !== VERSION || !Array.isArray(v.list)) return null;
		return { list: v.list, muted: !!v.muted };
	} catch {
		return null;
	}
}

function persist() {
	try {
		localStorage.setItem(KEY, JSON.stringify({ v: VERSION, list: $state.snapshot(timerState.list), muted: timerState.muted }));
	} catch {
		/* storage unavailable: timers still work for this page view */
	}
}

function adopt(stored: { list: StepTimerState[]; muted: boolean }) {
	timerState.list = stored.list;
	timerState.muted = stored.muted;
}

// ---- lifecycle ---------------------------------------------------------------------------------------------------

export function initTimers() {
	if (!browser || ready) return;
	ready = true;
	const stored = load();
	if (stored) adopt(stored);
	// Timers that ended while the page was closed: show them as finished (no sound; there is no gesture to play it).
	let changed = false;
	for (const t of timerState.list) {
		if (!t.done && t.endsAt !== null && t.endsAt <= Date.now()) {
			t.done = true;
			t.endsAt = null;
			t.remainingMs = null;
			changed = true;
		}
	}
	if (changed) persist();

	window.addEventListener('storage', (e) => {
		if (e.key !== KEY) return;
		const next = load();
		if (next) adopt(next);
		schedule();
	});
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') tick();
	});
	tick();
	schedule();
}

/** Run a 1 s interval while anything is on screen, plus an exact timeout for the next ring. */
function schedule() {
	if (!browser) return;
	const any = timerState.list.length > 0;
	if (any && !interval) interval = setInterval(tick, 1000);
	if (!any && interval) {
		clearInterval(interval);
		interval = undefined;
	}
	clearTimeout(timeout);
	const next = timerState.list.filter((t) => t.endsAt !== null).map((t) => t.endsAt as number);
	if (next.length) timeout = setTimeout(tick, Math.max(0, Math.min(...next) - Date.now()) + 20);
}

function tick() {
	const now = Date.now();
	timerState.now = now;
	let changed = false;
	for (const t of timerState.list) {
		if (t.done || t.endsAt === null) continue;
		const left = t.endsAt - now;
		if (left <= 0) {
			// Another tab may have rung it already: check storage before making any noise.
			const stored = load()?.list.find((s) => s.id === t.id);
			if (stored?.done) {
				Object.assign(t, stored);
			} else {
				t.done = true;
				t.endsAt = null;
				t.remainingMs = null;
				persist();
				alarm(t);
			}
			changed = true;
		} else if (left <= LAST_MINUTE_MS && !t.warned && t.totalMs > LAST_MINUTE_MS) {
			t.warned = true;
			timerState.announcement = `${t.label}: 1 minut tilbage`;
			changed = true;
		}
	}
	if (changed) persist();
	schedule();
}

// ---- actions -----------------------------------------------------------------------------------------------------

export function startTimer(input: StartInput) {
	initTimers();
	const key = timerKey(input.recipeSlug, input.stepIndex, input.minutes);
	if (timerState.list.some((t) => t.key === key)) return;
	unlockAudio();
	const totalMs = input.minutes * MINUTE;
	const now = Date.now();
	timerState.now = now;
	const first = timerState.list.length === 0;
	timerState.list.push({
		id: globalThis.crypto?.randomUUID?.() ?? `${now}-${Math.random().toString(36).slice(2)}`,
		key,
		recipeSlug: input.recipeSlug,
		recipeTitle: input.recipeTitle,
		stepIndex: input.stepIndex,
		stepTitle: input.stepTitle,
		label: input.label,
		totalMs,
		endsAt: now + totalMs,
		remainingMs: null,
		done: false,
		warned: false
	});
	persist();
	timerState.announcement = `Timer startet: ${input.label}, ${formatMinutes(input.minutes)}`;
	if (first) offerExtras();
	schedule();
}

function offerExtras() {
	if ('Notification' in window && Notification.permission === 'default' && !flag(NOTIFY_KEY)) timerState.askNotify = true;
}

function flag(key: string): boolean {
	try {
		return localStorage.getItem(key) === '1';
	} catch {
		return false;
	}
}

export async function answerNotify(yes: boolean) {
	timerState.askNotify = false;
	try {
		localStorage.setItem(NOTIFY_KEY, '1');
	} catch {
		/* ignore */
	}
	if (yes) {
		try {
			await Notification.requestPermission();
		} catch {
			/* denied or unsupported: alarms still sound and the title changes */
		}
	}
}

export function answerAwake(yes: boolean) {
	timerState.askAwake = false;
	if (yes) setKeepAwake(true);
}

const find = (id: string) => timerState.list.find((t) => t.id === id);

export function pauseTimer(id: string) {
	const t = find(id);
	if (!t || t.done || t.endsAt === null) return;
	t.remainingMs = Math.max(0, t.endsAt - Date.now());
	t.endsAt = null;
	persist();
	schedule();
}

export function resumeTimer(id: string) {
	const t = find(id);
	if (!t || t.done || t.endsAt !== null) return;
	t.endsAt = Date.now() + (t.remainingMs ?? 0);
	t.remainingMs = null;
	persist();
	tick();
}

export function addMinute(id: string) {
	const t = find(id);
	if (!t || t.done) return;
	t.totalMs += MINUTE;
	if (t.endsAt !== null) t.endsAt += MINUTE;
	else t.remainingMs = (t.remainingMs ?? 0) + MINUTE;
	if (remainingAt(t, Date.now()) > LAST_MINUTE_MS) t.warned = false;
	timerState.now = Date.now();
	persist();
	schedule();
}

export function removeTimer(id: string) {
	timerState.list = timerState.list.filter((t) => t.id !== id);
	persist();
	schedule();
}

export function setMuted(muted: boolean) {
	timerState.muted = muted;
	persist();
}

// ---- alerts ------------------------------------------------------------------------------------------------------

function unlockAudio() {
	try {
		const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (!Ctx) return;
		audio ??= new Ctx();
		void audio.resume?.();
	} catch {
		/* no audio: the visual alert still works */
	}
}

/** Two soft two-note chimes, generated here so there are no audio files. */
function chime() {
	unlockAudio(); // a tab that did not start the timer has no context yet; allowed after any earlier interaction
	if (!audio) return;
	try {
		void audio.resume?.();
		const start = audio.currentTime + 0.05;
		[0, 0.9].forEach((offset) => {
			[659.25, 880].forEach((freq, i) => {
				const osc = audio!.createOscillator();
				const gain = audio!.createGain();
				const at = start + offset + i * 0.22;
				osc.type = 'sine';
				osc.frequency.value = freq;
				gain.gain.setValueAtTime(0.0001, at);
				gain.gain.exponentialRampToValueAtTime(0.25, at + 0.03);
				gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.6);
				osc.connect(gain).connect(audio!.destination);
				osc.start(at);
				osc.stop(at + 0.65);
			});
		});
	} catch {
		/* ignore */
	}
}

function alarm(t: StepTimerState) {
	timerState.announcement = `${t.label} er færdig`;
	if (!timerState.muted) chime();
	try {
		navigator.vibrate?.([300, 150, 300, 150, 300]);
	} catch {
		/* ignore */
	}
	try {
		if ('Notification' in window && Notification.permission === 'granted') {
			new Notification(`${t.label} er færdig`, { body: t.recipeTitle, tag: t.id });
		}
	} catch {
		/* some mobile browsers only allow notifications through a service worker */
	}
}

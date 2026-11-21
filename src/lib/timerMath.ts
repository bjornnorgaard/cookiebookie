/**
 * Pure helpers for step timers (no runes, no DOM), so they can be unit tested in Node and reused by cook mode.
 *
 * A timer never counts down a stored number. A running timer stores an absolute `endsAt` (epoch ms); a paused one stores
 * `remainingMs`. What to show is always computed from the clock, so throttled tabs and sleeping phones stay correct.
 */
export interface StepTimerState {
	id: string;
	/** `${recipeSlug}:${stepIndex}:${minutes}`; one live timer per chip. */
	key: string;
	recipeSlug: string;
	recipeTitle: string;
	stepIndex: number;
	stepTitle: string;
	label: string;
	totalMs: number;
	/**
	 * Absolute epoch ms when the timer rings (or rang). Kept after finish so we can show how long ago it
	 * expired; null only while paused. Legacy done rows may still have null.
	 */
	endsAt: number | null;
	/** Time left while paused; null while running or done. */
	remainingMs: number | null;
	done: boolean;
	/** The "1 minut tilbage" announcement has been made. */
	warned: boolean;
}

export const MINUTE = 60_000;
export const LAST_MINUTE_MS = MINUTE;
/** Finished timers older than this are dropped on load / tick (user is assumed to have moved on). */
export const DONE_KEEP_MS = 24 * 60 * MINUTE;

/** 2712000 -> "45:12", 3725000 -> "1:02:05". Rounds up to whole seconds so it never shows 00:00 before it is done. */
export function formatRemaining(ms: number): string {
	const total = Math.max(0, Math.ceil(ms / 1000));
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	const pad = (n: number) => String(n).padStart(2, '0');
	return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** 45 -> "45 min", 60 -> "60 min", 150 -> "2 t. 30 min", 720 -> "12 t.". */
export function formatMinutes(minutes: number): string {
	if (minutes < 120) return `${Math.round(minutes)} min`;
	const h = Math.floor(minutes / 60);
	const m = Math.round(minutes % 60);
	return [h ? `${h} t.` : '', m || !h ? `${m} min` : ''].filter(Boolean).join(' ');
}

/**
 * Relative Danish "ago" text for a finished timer. Under ~5 s → "Færdig!"; otherwise
 * "Færdig · for 3 min siden". Callers should prune past {@link DONE_KEEP_MS}.
 */
export function formatDoneAgo(finishedAt: number, now: number): string {
	const ago = Math.max(0, now - finishedAt);
	if (ago < 5_000) return 'Færdig!';
	const sec = Math.floor(ago / 1000);
	if (sec < 60) return `Færdig · for ${sec} sek siden`;
	const min = Math.floor(sec / 60);
	if (min < 60) return `Færdig · for ${min} min siden`;
	const h = Math.floor(min / 60);
	const m = min % 60;
	return m ? `Færdig · for ${h} t. ${m} min siden` : `Færdig · for ${h} t. siden`;
}

/** Epoch when a done timer finished; null if unknown (legacy) or still running/paused. */
export function finishedAt(t: StepTimerState): number | null {
	return t.done ? t.endsAt : null;
}

export function timerStatus(t: StepTimerState): 'running' | 'paused' | 'done' {
	return t.done ? 'done' : t.endsAt !== null ? 'running' : 'paused';
}

/** Milliseconds left at `now`, never negative. */
export function remainingAt(t: StepTimerState, now: number): number {
	if (t.done) return 0;
	if (t.endsAt !== null) return Math.max(0, t.endsAt - now);
	return Math.max(0, t.remainingMs ?? 0);
}

/** True when a finished timer is older than {@link DONE_KEEP_MS} and should be dropped. */
export function isStaleDone(t: StepTimerState, now: number): boolean {
	if (!t.done || t.endsAt === null) return false;
	return now - t.endsAt > DONE_KEEP_MS;
}

/** Elapsed share, 0..1. */
export function progressAt(t: StepTimerState, now: number): number {
	if (t.totalMs <= 0) return 1;
	return Math.min(1, Math.max(0, 1 - remainingAt(t, now) / t.totalMs));
}

export function isLastMinute(t: StepTimerState, now: number): boolean {
	return !t.done && remainingAt(t, now) <= LAST_MINUTE_MS;
}

/** The durations a step offers as chips: a range gives two (min and max). */
export function timerChoices(def: { minutes: number; maxMinutes?: number }): number[] {
	return def.maxMinutes && def.maxMinutes > def.minutes ? [def.minutes, def.maxMinutes] : [def.minutes];
}

import { expect, test } from '@playwright/test';
import {
	DONE_KEEP_MS,
	finishedAt,
	formatDoneAgo,
	formatMinutes,
	formatRemaining,
	isStaleDone,
	progressAt,
	remainingAt,
	timerChoices,
	timerStatus,
	type StepTimerState
} from '../src/lib/timerMath.ts';

const base: StepTimerState = {
	id: 'a', key: 'k', recipeSlug: 's', recipeTitle: 'S', stepIndex: 0, stepTitle: 'T', label: 'T',
	totalMs: 60_000, endsAt: null, remainingMs: null, done: false, warned: false
};

test('formatRemaining: mm:ss under an hour, h:mm:ss from an hour', () => {
	expect(formatRemaining(0)).toBe('00:00');
	expect(formatRemaining(-5000)).toBe('00:00');
	expect(formatRemaining(1)).toBe('00:01'); // rounds up, never 00:00 before it is done
	expect(formatRemaining(59_000)).toBe('00:59');
	expect(formatRemaining(45 * 60_000 + 12_000)).toBe('45:12');
	expect(formatRemaining(3_599_000)).toBe('59:59');
	expect(formatRemaining(3_600_000)).toBe('1:00:00');
	expect(formatRemaining(3_725_000)).toBe('1:02:05');
	expect(formatRemaining(24 * 3_600_000)).toBe('24:00:00');
});

test('formatMinutes', () => {
	expect(formatMinutes(45)).toBe('45 min');
	expect(formatMinutes(60)).toBe('60 min');
	expect(formatMinutes(150)).toBe('2 t. 30 min');
	expect(formatMinutes(720)).toBe('12 t.');
});

test('end-time maths: running, paused, done', () => {
	const running = { ...base, endsAt: 100_000 };
	expect(remainingAt(running, 70_000)).toBe(30_000);
	expect(remainingAt(running, 200_000)).toBe(0);
	expect(progressAt(running, 70_000)).toBeCloseTo(0.5);
	const paused = { ...base, remainingMs: 15_000 };
	expect(remainingAt(paused, 999_999)).toBe(15_000); // the clock does not matter while paused
	expect(timerStatus(running)).toBe('running');
	expect(timerStatus(paused)).toBe('paused');
	expect(timerStatus({ ...base, done: true })).toBe('done');
	expect(remainingAt({ ...base, done: true }, 0)).toBe(0);
});

test('timerChoices: a range gives two chips', () => {
	expect(timerChoices({ minutes: 45, maxMinutes: 60 })).toEqual([45, 60]);
	expect(timerChoices({ minutes: 30 })).toEqual([30]);
	expect(timerChoices({ minutes: 30, maxMinutes: 30 })).toEqual([30]);
});

test('formatDoneAgo and stale prune window', () => {
	const end = 1_000_000;
	expect(formatDoneAgo(end, end + 2_000)).toBe('Færdig!');
	expect(formatDoneAgo(end, end + 12_000)).toBe('Færdig · for 12 sek siden');
	expect(formatDoneAgo(end, end + 3 * 60_000)).toBe('Færdig · for 3 min siden');
	expect(formatDoneAgo(end, end + 2 * 60 * 60_000)).toBe('Færdig · for 2 t. siden');
	expect(formatDoneAgo(end, end + 2 * 60 * 60_000 + 15 * 60_000)).toBe('Færdig · for 2 t. 15 min siden');

	const done = { ...base, done: true, endsAt: end };
	expect(finishedAt(done)).toBe(end);
	expect(isStaleDone(done, end + DONE_KEEP_MS)).toBe(false);
	expect(isStaleDone(done, end + DONE_KEEP_MS + 1)).toBe(true);
	expect(isStaleDone({ ...base, done: true, endsAt: null }, end + DONE_KEEP_MS * 2)).toBe(false); // legacy: keep until dismissed
	expect(finishedAt(base)).toBeNull();
});

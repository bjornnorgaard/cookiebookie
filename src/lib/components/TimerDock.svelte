<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { setKeepAwake, wake } from '#lib/stores/wakeLock.svelte.ts';
	import { TITLE_DONE, addMinute, answerNotify, initTimers, pauseTimer, removeTimer, resumeTimer, setMuted, timerState } from '#lib/stores/timers.svelte.ts';
	import { finishedAt, formatDoneAgo, formatRemaining, isLastMinute, progressAt, remainingAt, timerStatus } from '#lib/timerMath.ts';

	const MAX_ROWS = 3;
	let expanded = $state(false);

	onMount(initTimers);

	// Finished first (most recently done on top), then running soonest-to-ring.
	const sorted = $derived(
		[...timerState.list].sort((a, b) => {
			const rank = (t: typeof a) => (t.done ? 0 : 1);
			if (rank(a) !== rank(b)) return rank(a) - rank(b);
			if (a.done && b.done) return (finishedAt(b) ?? 0) - (finishedAt(a) ?? 0);
			return remainingAt(a, timerState.now) - remainingAt(b, timerState.now);
		})
	);
	const visible = $derived(expanded ? sorted : sorted.slice(0, MAX_ROWS));
	const hidden = $derived(sorted.length - visible.length);
	const anyDone = $derived(timerState.list.some((t) => t.done));

	// Tab title while anything is finished; follows page navigation so it is not lost.
	$effect(() => {
		if (!anyDone) return;
		let base = document.title;
		const apply = () => {
			if (document.title !== TITLE_DONE) {
				base = document.title;
				document.title = TITLE_DONE;
			}
		};
		apply();
		const el = document.querySelector('title');
		const observer = new MutationObserver(apply);
		if (el) observer.observe(el, { childList: true, characterData: true, subtree: true });
		return () => {
			observer.disconnect();
			if (document.title === TITLE_DONE) document.title = base;
		};
	});

	const reduced = $derived(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
</script>

<!-- Always mounted so screen readers pick up the change. Only start, one minute left and done are announced. -->
<p class="sr-only" aria-live="polite" data-testid="timer-announcer">{timerState.announcement}</p>

{#if timerState.list.length > 0}
	<div class="dock" class:calm={reduced} role="region" aria-label="Timere" data-testid="timer-dock">
		<div class="inner">
			{#if timerState.askNotify}
				<div class="ask">
					<p>Vil du have en besked, når en timer er færdig, også hvis du er i en anden fane?</p>
					<button type="button" class="btn-sm" onclick={() => answerNotify(true)}>Ja tak</button>
					<button type="button" class="btn-sm quiet" onclick={() => answerNotify(false)}>Nej tak</button>
				</div>
			{/if}

			<ul class="rows">
				{#each visible as t (t.id)}
					{@const status = timerStatus(t)}
					{@const left = remainingAt(t, timerState.now)}
					{@const doneAt = finishedAt(t)}
					{@const doneLabel = status === 'done' ? (doneAt !== null ? formatDoneAgo(doneAt, timerState.now) : 'Færdig!') : null}
					<li class="row" class:done={status === 'done'} class:last={isLastMinute(t, timerState.now)} data-testid="timer-row" data-status={status}>
						<a class="name" href="/{t.recipeSlug}#step{t.stepIndex + 1}">
							<span class="label">{t.label}</span>
							<span class="sub">{t.recipeTitle} · trin {t.stepIndex + 1}</span>
						</a>
						<time
							class="remaining tabular-nums"
							datetime={status === 'done' && doneAt !== null ? new Date(doneAt).toISOString() : `PT${Math.ceil(left / 1000)}S`}
						>
							{#if status === 'done'}<Icon name="check" />{/if}
							{doneLabel ?? formatRemaining(left)}
						</time>
						{#if status !== 'done'}
							<button type="button" class="ctl" title="{status === 'running' ? 'Pause' : 'Genoptag'}" aria-label="{status === 'running' ? 'Pause' : 'Genoptag'} {t.label}" onclick={() => (status === 'running' ? pauseTimer(t.id) : resumeTimer(t.id))}>
								<Icon name={status === 'running' ? 'pause' : 'play'} size="1.15rem" />
							</button>
							<button type="button" class="ctl" title="Læg et minut til" aria-label="+1 minut, {t.label}" onclick={() => addMinute(t.id)}>+1</button>
						{/if}
						<button type="button" class="ctl" title="Fjern timer" aria-label="Fjern timer {t.label}" onclick={() => removeTimer(t.id)}><Icon name="close" size="1.15rem" /></button>
						<span class="bar" aria-hidden="true"><span style="width: {Math.round(progressAt(t, timerState.now) * 100)}%"></span></span>
					</li>
				{/each}
			</ul>

			{#if hidden > 0 || (expanded && sorted.length > MAX_ROWS)}
				<div class="more">
					{#if hidden > 0}
						<button type="button" class="btn-sm quiet" onclick={() => (expanded = true)}>+{hidden} mere</button>
					{:else}
						<button type="button" class="btn-sm quiet" onclick={() => (expanded = false)}>Vis færre</button>
					{/if}
				</div>
			{/if}

			<div class="opts">
				{#if wake.supported}
					<button type="button" class="opt" role="switch" aria-checked={wake.enabled} onclick={() => setKeepAwake(!wake.enabled)}>
						<span class="sw" aria-hidden="true"><span class="knob"></span></span>
						Hold skærmen tændt
					</button>
				{/if}
				<button type="button" class="opt" role="switch" aria-checked={!timerState.muted} onclick={() => setMuted(!timerState.muted)}>
					<span class="sw" aria-hidden="true"><span class="knob"></span></span>
					Lyd
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Phones: a strip under the sticky nav, in document flow so content is pushed down, and sticky with the header so timers stay visible. */
	.dock {
		position: relative; /* above the absolute header backdrop */
		border-top: 1px solid light-dark(color-mix(in oklab, var(--color-secondary-500) 35%, transparent), oklch(52% 0.03 70));
		/* Solid surface so it reads as its own strip, not part of the page behind the sticky header. */
		background: light-dark(oklch(99.5% 0.006 88), oklch(34% 0.018 60));
		color: light-dark(oklch(25% 0.02 55), oklch(96% 0.01 85));
		box-shadow: 0 10px 28px -18px rgb(0 0 0 / 0.45);
		max-height: min(42vh, 20rem);
		overflow-y: auto;
	}
	.inner {
		margin-inline: auto;
		max-width: 72rem; /* match header max-w-6xl */
		/* Horizontal padding lives on children so finished rows can paint edge-to-edge. */
		padding: 0;
	}
	/* sm and up: a floating card in the bottom-right corner, out of the header's flow so the header does not grow. */
	@media (min-width: 640px) {
		.dock {
			position: fixed;
			z-index: 70; /* above the progress bar (60) and consent card (40); inside the header's stacking context it still clears page content */
			right: max(0.75rem, env(safe-area-inset-right));
			bottom: max(0.75rem, env(safe-area-inset-bottom));
			width: 400px;
			max-width: calc(100vw - 1.5rem);
			max-height: 60vh;
			border: 1px solid light-dark(color-mix(in oklab, var(--color-secondary-500) 45%, transparent), oklch(52% 0.03 70));
			border-radius: 1.25rem;
			box-shadow: 0 24px 60px -12px rgb(0 0 0 / 0.55), 0 8px 20px -8px rgb(0 0 0 / 0.4);
			overflow: hidden; /* clip full-bleed done rows to the card's rounded corners */
		}
		.inner {
			max-width: none;
		}
	}
	.rows {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.row {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.5rem max(1rem, env(safe-area-inset-left)) 0.7rem max(1rem, env(safe-area-inset-right));
	}
	@media (min-width: 640px) {
		.row {
			padding-inline: 0.75rem;
		}
	}
	.name {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1;
		color: inherit;
		text-decoration: none;
	}
	.name:hover .label {
		text-decoration: underline;
	}
	.label {
		font-weight: 700;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.sub {
		font-size: 0.75rem;
		opacity: 0.7;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.remaining {
		font-family: var(--font-display, inherit);
		font-size: 1.25rem;
		font-weight: 600;
		padding: 0 0.25rem;
		flex: 0 1 auto;
		text-align: right;
	}
	.row.done .remaining {
		font-size: 0.95rem;
		line-height: 1.2;
		max-width: 12rem;
	}
	.ctl {
		min-width: 2.5rem;
		min-height: 2.5rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 700;
		cursor: pointer;
		color: inherit;
		background: color-mix(in oklab, currentColor 10%, transparent);
		display: inline-grid;
		place-items: center;
	}
	.ctl:hover {
		background: color-mix(in oklab, currentColor 20%, transparent);
	}
	.bar {
		position: absolute;
		left: max(1rem, env(safe-area-inset-left));
		right: max(1rem, env(safe-area-inset-right));
		bottom: 0.25rem;
		height: 3px;
		border-radius: 9999px;
		background: color-mix(in oklab, currentColor 12%, transparent);
		overflow: hidden;
	}
	@media (min-width: 640px) {
		.bar {
			left: 0.75rem;
			right: 0.75rem;
		}
	}
	.bar span {
		display: block;
		height: 100%;
		background: var(--color-secondary-500);
		transition: width 1s linear;
	}
	.row.last .bar span,
	.row.last .remaining {
		background: var(--color-warning-500);
	}
	.row.last .remaining {
		background: none;
		color: var(--color-warning-700-300, var(--color-warning-500));
	}
	.row.done .bar span {
		background: var(--color-success-500);
	}
	.row.done {
		/* Full-bleed within the dock: green wash reaches the card edges (and top corners when this is the first row). */
		background: color-mix(in oklab, var(--color-success-500) 18%, transparent);
		animation: pulse 1.6s ease-in-out infinite;
	}
	.row.done .bar {
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 0;
	}
	@keyframes pulse {
		50% {
			background: color-mix(in oklab, var(--color-success-500) 32%, transparent);
		}
	}
	.calm .row.done,
	.calm .bar span {
		animation: none;
		transition: none;
	}
	.ask {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem max(1rem, env(safe-area-inset-left)) 0.6rem max(1rem, env(safe-area-inset-right));
		font-size: 0.8125rem;
		border-bottom: 1px solid color-mix(in oklab, currentColor 12%, transparent);
	}
	@media (min-width: 640px) {
		.ask {
			padding-inline: 0.75rem;
		}
	}
	.ask p {
		margin: 0;
		flex: 1 1 14rem;
	}
	.more {
		display: flex;
		justify-content: center;
		padding: 0.25rem max(1rem, env(safe-area-inset-left)) 0.25rem max(1rem, env(safe-area-inset-right));
	}
	@media (min-width: 640px) {
		.more {
			padding-inline: 0.75rem;
		}
	}
	.opts {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.5rem max(1rem, env(safe-area-inset-left)) 0.65rem max(1rem, env(safe-area-inset-right));
	}
	@media (min-width: 640px) {
		.opts {
			padding-inline: 0.75rem;
		}
	}
	.opt {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 2.5rem;
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		color: inherit;
	}
	.sw {
		position: relative;
		flex: none;
		width: 2.25rem;
		height: 1.3rem;
		border-radius: 9999px;
		border: 2px solid color-mix(in oklab, currentColor 40%, transparent);
		transition: background-color 250ms, border-color 250ms;
	}
	.knob {
		position: absolute;
		top: 50%;
		left: 0.15rem;
		width: 0.7rem;
		height: 0.7rem;
		border-radius: 9999px;
		background: currentColor;
		transform: translateY(-50%);
		transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1), background-color 250ms;
	}
	.opt[aria-checked='true'] .sw {
		background: var(--color-secondary-500);
		border-color: var(--color-secondary-500);
	}
	.opt[aria-checked='true'] .knob {
		transform: translate(0.95rem, -50%);
		background: white;
	}
	.opt:focus-visible {
		outline: 2px solid var(--color-secondary-500);
		outline-offset: 2px;
		border-radius: 0.5rem;
	}
	.btn-sm {
		min-height: 2.25rem;
		padding: 0 0.8rem;
		border-radius: 9999px;
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		color: inherit;
		background: color-mix(in oklab, var(--color-secondary-500) 35%, transparent);
	}
	.btn-sm.quiet {
		background: transparent;
	}
	.btn-sm:hover {
		background: color-mix(in oklab, var(--color-secondary-500) 50%, transparent);
	}
	:is(.ctl, .btn-sm, .name):focus-visible {
		outline: 2px solid var(--color-secondary-500);
		outline-offset: 2px;
	}
	@media (prefers-reduced-motion: reduce) {
		.row.done {
			animation: none;
		}
		.bar span {
			transition: none;
		}
	}
</style>

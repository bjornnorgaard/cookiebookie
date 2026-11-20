<script lang="ts">
	import { onMount } from 'svelte';
	import { consent } from '#lib/stores/consent.svelte.ts';
	import { TITLE_DONE, addMinute, answerAwake, answerNotify, initTimers, pauseTimer, removeTimer, resumeTimer, setMuted, timerState } from '#lib/stores/timers.svelte.ts';
	import { formatRemaining, isLastMinute, progressAt, remainingAt, timerStatus } from '#lib/timerMath.ts';

	const MAX_ROWS = 3;
	let expanded = $state(false);

	onMount(initTimers);

	// Running first (soonest to ring on top), finished ones stay on top so they cannot be missed.
	const sorted = $derived(
		[...timerState.list].sort((a, b) => {
			const rank = (t: typeof a) => (t.done ? 0 : 1);
			return rank(a) - rank(b) || remainingAt(a, timerState.now) - remainingAt(b, timerState.now);
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
	<div class="dock panel" class:lifted={consent.open} class:calm={reduced} role="region" aria-label="Timere" data-testid="timer-dock" style="--panel-accent: var(--color-secondary-500); --panel-tint: 22%">
		{#if timerState.askNotify}
			<div class="ask">
				<p>Vil du have en besked, når en timer er færdig, også hvis du er i en anden fane?</p>
				<button type="button" class="btn-sm" onclick={() => answerNotify(true)}>Ja tak</button>
				<button type="button" class="btn-sm quiet" onclick={() => answerNotify(false)}>Nej tak</button>
			</div>
		{/if}
		{#if timerState.askAwake}
			<div class="ask">
				<p>Skal skærmen holdes tændt, mens du venter?</p>
				<button type="button" class="btn-sm" onclick={() => answerAwake(true)}>Ja tak</button>
				<button type="button" class="btn-sm quiet" onclick={() => answerAwake(false)}>Nej tak</button>
			</div>
		{/if}

		<ul class="rows">
			{#each visible as t (t.id)}
				{@const status = timerStatus(t)}
				{@const left = remainingAt(t, timerState.now)}
				<li class="row" class:done={status === 'done'} class:last={isLastMinute(t, timerState.now)} data-testid="timer-row" data-status={status}>
					<a class="name" href="/{t.recipeSlug}#step{t.stepIndex + 1}">
						<span class="label">{t.label}</span>
						<span class="sub">{t.recipeTitle} · trin {t.stepIndex + 1}</span>
					</a>
					<time class="remaining tabular-nums" datetime="PT{Math.ceil(left / 1000)}S">
						{status === 'done' ? 'Færdig!' : formatRemaining(left)}
					</time>
					{#if status !== 'done'}
						<button type="button" class="ctl" aria-label="{status === 'running' ? 'Pause' : 'Genoptag'} {t.label}" onclick={() => (status === 'running' ? pauseTimer(t.id) : resumeTimer(t.id))}>
							<span aria-hidden="true">{status === 'running' ? '⏸' : '▶'}</span>
						</button>
						<button type="button" class="ctl" aria-label="Læg et minut til {t.label}" onclick={() => addMinute(t.id)}>+1</button>
					{/if}
					<button type="button" class="ctl" aria-label="Fjern timer {t.label}" onclick={() => removeTimer(t.id)}><span aria-hidden="true">✕</span></button>
					<span class="bar" aria-hidden="true"><span style="width: {Math.round(progressAt(t, timerState.now) * 100)}%"></span></span>
				</li>
			{/each}
		</ul>

		<div class="foot">
			{#if hidden > 0}
				<button type="button" class="btn-sm quiet" onclick={() => (expanded = true)}>+{hidden} mere</button>
			{:else if expanded && sorted.length > MAX_ROWS}
				<button type="button" class="btn-sm quiet" onclick={() => (expanded = false)}>Vis færre</button>
			{/if}
			<button type="button" class="btn-sm quiet mute" role="switch" aria-checked={!timerState.muted} onclick={() => setMuted(!timerState.muted)}>
				<span aria-hidden="true">{timerState.muted ? '🔇' : '🔔'}</span>
				Lyd {timerState.muted ? 'fra' : 'til'}
			</button>
		</div>
	</div>
{/if}

<style>
	.dock {
		position: fixed;
		z-index: 45; /* above the consent card (40), below the sticky header (50) */
		left: max(0.75rem, env(safe-area-inset-left));
		right: max(0.75rem, env(safe-area-inset-right));
		bottom: max(0.75rem, env(safe-area-inset-bottom));
		padding: 0.5rem 0.75rem;
		border-radius: 1.25rem;
		max-height: 60vh;
		overflow-y: auto;
		backdrop-filter: blur(10px);
	}
	@media (min-width: 640px) {
		.dock {
			left: auto;
			width: 400px;
		}
	}
	/* The consent card owns the bottom edge on phones; sit above it while it is open. */
	@media (max-width: 639px) {
		.dock.lifted {
			bottom: calc(max(0.75rem, env(safe-area-inset-bottom)) + 12rem);
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
		padding: 0.5rem 0 0.7rem;
	}
	.row + .row {
		border-top: 1px solid color-mix(in oklab, currentColor 12%, transparent);
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
	}
	.ctl:hover {
		background: color-mix(in oklab, currentColor 20%, transparent);
	}
	.bar {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0.25rem;
		height: 3px;
		border-radius: 9999px;
		background: color-mix(in oklab, currentColor 12%, transparent);
		overflow: hidden;
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
		background: color-mix(in oklab, var(--color-success-500) 18%, transparent);
		border-radius: 0.75rem;
		padding-inline: 0.5rem;
		animation: pulse 1.6s ease-in-out infinite;
	}
	.row.done .remaining::before {
		content: '✓ ';
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
		padding: 0.4rem 0 0.6rem;
		font-size: 0.8125rem;
		border-bottom: 1px solid color-mix(in oklab, currentColor 12%, transparent);
	}
	.ask p {
		margin: 0;
		flex: 1 1 14rem;
	}
	.foot {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
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
	.mute {
		margin-left: auto;
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

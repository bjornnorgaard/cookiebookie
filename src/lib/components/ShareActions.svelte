<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Recipe } from '#lib/types/recipe.ts';
	import { siteUrl } from '#lib/constants/site.ts';
	import { formatAmount } from '#lib/scale.ts';
	import { getPortions } from '#lib/stores/portions.svelte.ts';

	let { recipe }: { recipe: Recipe } = $props();
	const portions = getPortions();

	const url = $derived(`${siteUrl}/${recipe.slug}`);
	const text = $derived(`${recipe.title} – ${recipe.shortDesc}`);
	// Plain text, one ingredient per line, at the portion count on screen.
	const listText = $derived(
		[
			`Indkøbsliste: ${recipe.title} (${portions.count} ${portions.count === 1 ? 'portion' : 'portioner'})`,
			'',
			...recipe.ingredients.map((i) => {
				const amount = formatAmount(i, portions.scaling);
				return amount ? `${i.name}, ${amount}` : i.name;
			}),
			'',
			url
		].join('\n')
	);

	let canShare = $state(false);
	let open = $state(false);
	let status = $state(''); // announced to screen readers
	let copied = $state<'link' | 'list' | null>(null);
	let manual = $state<{ label: string; value: string } | null>(null); // last-resort: a selected field
	let copiedTimer: ReturnType<typeof setTimeout> | undefined;

	let trigger: HTMLButtonElement | undefined = $state();
	let popover: HTMLDivElement | undefined = $state();
	let manualField: HTMLTextAreaElement | undefined = $state();

	onMount(() => {
		canShare = typeof navigator.share === 'function';
		return () => clearTimeout(copiedTimer);
	});

	// Analytics only exists once the visitor has accepted it (see analytics.ts); otherwise this is a no-op.
	function track(name: string, params: Record<string, string> = {}) {
		(window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', name, { recipe: recipe.slug, ...params });
	}

	async function nativeShare(data: ShareData, method: string): Promise<boolean> {
		try {
			await navigator.share(data);
			track('share', { method });
			return true;
		} catch (e) {
			if ((e as DOMException)?.name === 'AbortError') return true; // the user closed the sheet: not an error
			return false;
		}
	}

	async function onShare() {
		if (open) return close(false);
		if (typeof navigator.share === 'function' && (await nativeShare({ title: recipe.title, text, url }, 'native'))) return;
		openPopover();
	}

	async function openPopover() {
		open = true;
		manual = null;
		await tick();
		popover?.querySelector<HTMLElement>('button, a')?.focus();
	}

	function close(restoreFocus = true) {
		open = false;
		manual = null;
		if (restoreFocus) trigger?.focus();
	}

	async function copy(kind: 'link' | 'list') {
		const value = kind === 'link' ? url : listText;
		try {
			if (!navigator.clipboard?.writeText) throw new Error('no clipboard');
			await navigator.clipboard.writeText(value);
			manual = null;
			copied = kind;
			status = kind === 'link' ? 'Link kopieret' : 'Indkøbslisten er kopieret';
			track('share', { method: `copy-${kind}` });
			clearTimeout(copiedTimer);
			copiedTimer = setTimeout(() => {
				copied = null;
				status = '';
			}, 2200);
		} catch {
			// Old browsers / blocked clipboard: show the text selected so Ctrl/Cmd+C does the rest.
			manual = { label: kind === 'link' ? 'Link' : 'Indkøbsliste', value };
			status = 'Markeret. Tryk Ctrl+C eller Cmd+C for at kopiere';
			await tick();
			manualField?.focus();
			manualField?.select();
		}
	}

	async function shareList() {
		if (typeof navigator.share === 'function' && (await nativeShare({ title: `Indkøbsliste: ${recipe.title}`, text: listText }, 'list'))) return;
		await copy('list');
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			e.stopPropagation();
			close();
		}
	}

	function onFocusOut(e: FocusEvent) {
		const next = e.relatedTarget as Node | null;
		if (open && next && !(e.currentTarget as HTMLElement).contains(next)) close(false);
	}

	function onPrint() {
		track('print');
		window.print();
	}

	const mailto = $derived(`mailto:?subject=${encodeURIComponent(recipe.title)}&body=${encodeURIComponent(`${text}\n${url}`)}`);
	const sms = $derived(`sms:?&body=${encodeURIComponent(`${text} ${url}`)}`);
</script>

<svelte:window onclick={(e) => open && !(e.target as HTMLElement).closest('.share-actions') && close(false)} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="share-actions relative mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-3" onkeydown={onKeydown} onfocusout={onFocusOut} data-testid="share-actions">
	<button
		type="button"
		class="btn preset-tonal gap-2"
		bind:this={trigger}
		onclick={onShare}
		aria-haspopup={canShare ? undefined : 'dialog'}
		aria-expanded={canShare ? undefined : open}
		data-testid="share-button"
	>
		<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 15V3M8 7l4-4 4 4" />
		</svg>
		Del
	</button>
	<button type="button" class="btn preset-tonal gap-2" onclick={onPrint} data-testid="print-button">
		<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M7 9V3h10v6M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M7 14h10v7H7z" />
		</svg>
		Udskriv
	</button>
	{#if canShare}
		<button type="button" class="share-link" onclick={shareList} data-testid="share-list-inline">Del indkøbslisten</button>
	{/if}

	{#if open}
		<div
			bind:this={popover}
			class="panel absolute left-1/2 top-full z-30 mt-3 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl p-3 text-left shadow-xl"
			style="--panel-accent: var(--color-primary-500)"
			role="dialog"
			aria-label="Del opskriften"
			data-testid="share-popover"
		>
			<ul class="m-0 flex list-none flex-col gap-1 p-0">
				<li>
					<button type="button" class="menu-item" onclick={() => copy('link')} data-testid="copy-link">
						<span>{copied === 'link' ? 'Kopieret ✓' : 'Kopiér link'}</span>
					</button>
				</li>
				<li>
					<button type="button" class="menu-item" onclick={() => copy('list')} data-testid="copy-list">
						<span>{copied === 'list' ? 'Kopieret ✓' : 'Del indkøbslisten'}</span>
						<small class="opacity-60">kopierer med mængder til {portions.count}</small>
					</button>
				</li>
				<li><a class="menu-item" href={mailto}>Send på e-mail</a></li>
				<li><a class="menu-item" href={sms}>Send som sms</a></li>
			</ul>

			{#if manual}
				<label class="mt-3 block text-sm">
					<span class="mb-1 block font-semibold">{manual.label}: kopiér herfra</span>
					<textarea bind:this={manualField} readonly rows={manual.value.includes('\n') ? 5 : 2} class="textarea w-full text-sm" value={manual.value} onfocus={(e) => e.currentTarget.select()}></textarea>
				</label>
			{/if}
		</div>
	{/if}

	<span class="sr-only" role="status" aria-live="polite" data-testid="share-status">{status}</span>
</div>

<style>
	.menu-item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
		padding: 0.6rem 0.8rem;
		border-radius: 0.75rem;
		font-weight: 600;
		text-align: left;
		cursor: pointer;
		text-decoration: none;
		transition: background-color 200ms;
	}
	.menu-item:hover,
	.menu-item:focus-visible {
		background: color-mix(in oklab, var(--color-primary-500) 18%, transparent);
	}
	.menu-item small {
		font-weight: 400;
	}
	.share-link {
		font-size: 0.875rem;
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}
</style>

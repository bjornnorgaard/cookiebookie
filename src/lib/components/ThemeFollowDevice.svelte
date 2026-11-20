<script lang="ts">
	import { setPref, theme } from '#lib/stores/theme.svelte.ts';

	const following = $derived(theme.pref === 'system');
</script>

<!-- The way back from a forced light/dark choice to "follow the device". -->
<button
	type="button"
	class="rounded-full px-3 py-2 text-sm underline-offset-4 hover:underline disabled:no-underline"
	disabled={following}
	onclick={() => setPref('system')}
	data-testid="theme-follow-device"
>
	Tema: {following ? 'Følg enheden' : theme.pref === 'dark' ? 'Mørkt' : 'Lyst'}{following ? '' : ' (følg enheden)'}
</button>

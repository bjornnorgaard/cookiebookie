<script lang="ts">
	import { page } from '$app/state';
	import Head from '#lib/components/Head.svelte';
	import MainContent from '#lib/components/MainContent.svelte';

	const status = $derived(page.status);
	const isNotFound = $derived(status === 404);
</script>

<Head
	noindex={isNotFound}
	titleOverride={isNotFound ? 'Side ikke fundet | Cookie Bookie' : undefined}
	descriptionOverride={isNotFound
		? 'Siden du leder efter findes ikke. Gå tilbage til forsiden og find en opskrift i stedet.'
		: undefined}
/>

<MainContent title="Du er vist faret vild" width="narrow">
	<img
		class="reveal aspect-[7/3] w-full rounded-3xl object-cover shadow-2xl"
		style="--i:1"
		src="/images/not-found.jpg"
		fetchpriority="high"
		loading="eager"
		alt="Du er faret vild"
		height="300"
		width="700"
	/>

	<div class="reveal flex flex-col items-center gap-4 py-8 text-center" style="--i:2">
		<h2 class="m-0 font-display text-2xl font-semibold">Det skal nok gå.</h2>

		<p class="max-w-xl">
			Jeg har naturligvis forudset, at du ville gå ud hvor du ikke kunne bunde. Har endda lavet en lille knap til dig.
			Så kan du komme tilbage i sikkerhed.
		</p>

		<a href="/" class="btn my-4 preset-filled-primary-500 no-underline transition duration-300 hover:scale-105">Gå til Forsiden</a>
	</div>
</MainContent>

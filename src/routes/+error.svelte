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

<MainContent title="Du er vist faret vild">
	<img
		class="rounded-lg drop-shadow-lg aspect-[7/3] w-full object-cover"
		src="/images/not-found.jpg"
		fetchpriority="high"
		loading="eager"
		alt="Du er faret vild"
		height="300"
		width="700"
	/>

	<div class="flex flex-col py-4 gap-4 items-center text-center">
		<h3 class="m-0">Det skal nok gå.</h3>

		<p>
			Jeg har naturligvis forudset, at du ville gå ud hvor du ikke kunne bunde. Har endda lavet en
			lille knap til dig. Så kan du komme tilbage i sikkerhed.
		</p>

		<a href="/" class="no-underline btn my-4 preset-filled-primary-500">Gå til Forsiden</a>
	</div>
</MainContent>

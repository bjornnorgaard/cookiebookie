<script lang="ts">
    import ContentNarrow from "$lib/components/ContentNarrow.svelte";
    import {picsumHost} from "$lib/constants/picsum.js";
</script>

<ContentNarrow title="Du er vist faret vild">
    <img class="rounded-lg drop-shadow-lg"
         src={`${picsumHost}/id/404//1400/600`} alt="havet der støder mod store klipper"
         height="300" width="700">

    <div class="flex flex-col items-center text-center">
        <h3 class="m-0">Det skal nok gå</h3>

        <p>Jeg har naturligvis forudset, at du ville gå ud hvor du ikke kunne bunde.
            Har endda lavet en lille knap til dig. Så kan du komme tilbage i sikkerhed.</p>

        <a href="/" class="no-underline btn btn-primary btn-wide">Gå til Forsiden</a>
    </div>
</ContentNarrow>

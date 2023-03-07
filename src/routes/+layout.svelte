<script lang="ts">
    import "../app.css";
    import NavigationTop from "$lib/components/NavigationTop.svelte";
    import { FooterLink } from "../lib/types/footer";

    const footerLinks: FooterLink[] = [
        {href: "https://github.com/bjornnorgaard/cookiebookie", svg: "/icons/github.svg", alt: "github logo",},
        {href: "https://www.linkedin.com/in/bjorn-norgaard", svg: "/icons/linkedin.svg", alt: "linkedin logo",},
        {href: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", svg: "/icons/youtube.svg", alt: "youtube logo",},
    ];
</script>

<NavigationTop homeLabel="Cookie Bookie" homeRoute="/">
    <slot/>
</NavigationTop>

<footer class="pb-8 bg-neutral-content sm:px-8">
    <div class="m-auto flex max-w-screen-sm flex-col justify-between gap-4 text-center sm:flex-row sm:px-8 sm:py-4 sm:text-left">
        <div>
            <p>Recipes by Bear<br/>Rimelige opskrifter siden 2023</p>
        </div>
        <div class="flex items-end justify-center gap-4 sm:justify-end">
            {#each footerLinks as link}
                <a href={link.href} rel="nofollow">
                    <img width="24" height="24" src={link.svg} alt={link.alt}>
                </a>
            {/each}
        </div>
    </div>
</footer>

<script lang="ts">
    import type { FooterLink } from "../types/footer";

    const links: FooterLink[] = [
        {href: "https://github.com/bjornnorgaard/cookiebookie", svg: "/icons/github.svg", alt: "github logo",},
        {href: "https://www.linkedin.com/in/bjorn-norgaard", svg: "/icons/linkedin.svg", alt: "linkedin logo",},
        {href: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", svg: "/icons/youtube.svg", alt: "youtube logo",},
    ];
</script>

<footer class="pb-8 bg-neutral-content sm:px-8">
    <div class="m-auto flex max-w-screen-sm flex-col justify-between gap-4 text-center sm:flex-row sm:px-8 sm:py-4 sm:text-left">
        <div>
            <p>Recipes by Bear<br/>Providing unreliable cooking advice since 2023</p>
        </div>
        <div class="flex items-end justify-center gap-4 sm:justify-end">
            {#each links as link}
                <a href={link.href}>
                    <img width="24" height="24" src={link.svg} alt={link.alt}>
                </a>
            {/each}
        </div>
    </div>
</footer>

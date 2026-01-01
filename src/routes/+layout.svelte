<script lang="ts">
    import "../app.css";

    interface Props {
        children?: import('svelte').Snippet;
    }

    let {children}: Props = $props();

    const footerLinks = [
        {href: "https://github.com/bjornnorgaard/cookiebookie", svg: "/icons/github.svg", alt: "github"},
        {href: "https://www.linkedin.com/in/bjorn-norgaard", svg: "/icons/linkedin.svg", alt: "linkedin"},
        {href: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", svg: "/icons/youtube.svg", alt: "youtube"},
    ];
</script>

<header>
    <nav class="p-4">
        <a class="text-2xl" href="/">Cookie Bookie</a>
    </nav>
</header>

<main>
    {@render children?.()}
</main>

<footer class="pb-8 sm:px-8">
    <div class="m-auto flex max-w-screen-sm flex-col justify-between gap-4 text-center sm:flex-row sm:px-8 sm:py-4 sm:text-left">
        <div>
            <p>Opskrifter by Bear<br/>Rimelige opskrifter siden 2023</p>
        </div>
        <div class="flex items-end justify-center gap-4 sm:justify-end">
            {#each footerLinks as link}
                <a href={link.href} rel="noopener noreferrer nofollow external" target="_blank">
                    <img src={link.svg} alt={link.alt}
                         title={link.alt}
                         fetchpriority="high"
                         class="dark:invert"
                         width="24" height="24">
                </a>
            {/each}
        </div>
    </div>
</footer>

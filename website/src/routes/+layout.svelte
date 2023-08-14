<script lang="ts">
    import "../app.css";

    const footerLinks = [
        { href: "https://github.com/bjornnorgaard/cookiebookie", svg: "/icons/github.svg", alt: "github" },
        { href: "https://www.linkedin.com/in/bjorn-norgaard", svg: "/icons/linkedin.svg", alt: "linkedin" },
        { href: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", svg: "/icons/youtube.svg", alt: "youtube" },
    ];
</script>

<nav class="flex justify-between navbar">
    <a class="text-xl normal-case btn btn-ghost" href="/">Cookie Bookie</a>
</nav>

<slot/>

<footer class="pb-8 sm:px-8">
    <div class="m-auto flex max-w-screen-sm flex-col justify-between gap-4 text-center sm:flex-row sm:px-8 sm:py-4 sm:text-left">
        <div>
            <p>Opskrifter by Bear<br/>Rimelige opskrifter siden 2023</p>
        </div>
        <div class="flex items-end justify-center gap-4 sm:justify-end">
            {#each footerLinks as link}
                <a href={link.href} rel="noopener noreferrer nofollow external" target="_blank">
                    <img src={link.svg} alt={link.alt}
                         title={link.alt} loading="eager"
                         width="24" height="24">
                </a>
            {/each}
        </div>
    </div>
</footer>

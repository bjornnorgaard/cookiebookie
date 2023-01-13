<script lang="ts">
    import "../app.css";
    import NavigationTop from "$lib/components/NavigationTop.svelte";
</script>

<svelte:head>
    <title>Cookie Boogie</title>
</svelte:head>

<NavigationTop homeLabel="Cookie Boogie" homeRoute="/">
    <slot/>
</NavigationTop>

<footer class="pb-8 bg-neutral-content sm:px-8">
    <div class="m-auto flex max-w-screen-sm flex-col justify-between gap-4 text-center sm:flex-row sm:px-8 sm:py-4 sm:text-left">
        <div>
            <p>Recipes by Bear<br/>Providing unreliable cooking advice since 2023</p>
        </div>
        <div class="flex items-center justify-center gap-4 sm:justify-end">
            <a href="https://github.com/bjornnorgaard/cookieboogie">
                <img width="24" height="24" src="/icons/github.svg" alt="github logo">
            </a>
            <a href="https://www.linkedin.com/in/bjorn-norgaard">
                <img width="24" height="24" src="/icons/linkedin.svg" alt="linkedin logo">
            </a>
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
                <img width="24" height="24" src="/icons/youtube.svg" alt="youtube logo">
            </a>
        </div>
    </div>
</footer>

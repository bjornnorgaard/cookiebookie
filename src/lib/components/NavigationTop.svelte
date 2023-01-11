<script lang="ts">
	import { page } from "$app/stores";
	import type { NavLink, NavSubLink } from "../types/navigation";

	export let homeLabel = "Fuuuuck 🔥";
	export let homeRoute = "/";
	export let routes: NavLink[] = [];
	export let subRoutes: NavSubLink[] = [];
</script>

<div class="navbar flex justify-between">
	<div class="">
		<div class="dropdown" class:hidden={!routes.length}>
			<div class="btn btn-ghost sm:hidden" tabindex="-1">
				<svg
					class="h-5 w-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M4 6h16M4 12h8m-8 6h16"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
					/>
				</svg>
			</div>
			<ul
				class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
				tabindex="-1"
			>
				{#each routes as r}
					<li>
						<a
							href={r.route}
							class={$page.url.pathname === r.route
								? "ml-1 bg-neutral text-neutral-content"
								: "ml-1"}>{r.label}</a
						>
					</li>
				{/each}
				{#each subRoutes as sr}
					<li tabindex="-1">
						<div>
							{sr.label}
							<svg
								class="fill-current"
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
							>
								<path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
							</svg>
						</div>
						<ul class="p-2 bg-neutral-content">
							{#each sr.routes as r}
								<li><a href={r.route}>{r.label}</a></li>
							{/each}
						</ul>
					</li>
				{/each}
			</ul>
		</div>
		<a class="btn btn-ghost normal-case text-xl" href={homeRoute}>{homeLabel}</a>
	</div>
	<div class="hidden sm:flex">
		<ul class="menu menu-horizontal px-1">
			{#each routes as r}
				<li>
					<a
						href={r.route}
						class={$page.url.pathname === r.route ? "ml-1 bg-neutral text-neutral-content" : "ml-1"}
						>{r.label}</a
					>
				</li>
			{/each}
			{#each subRoutes as sr}
				<li tabindex="-1">
					<div>
						{sr.label}
						<svg
							class="fill-current"
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
						>
							<path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
						</svg>
					</div>
					<ul class="p-2 bg-neutral-content">
						{#each sr.routes as r}
							<li><a href={r.route}>{r.label}</a></li>
						{/each}
					</ul>
				</li>
			{/each}
		</ul>
	</div>
</div>

<div class=" min-h-content">
	<slot />
</div>

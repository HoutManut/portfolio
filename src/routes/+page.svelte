<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import ProjectEntry from '$lib/components/ProjectEntry.svelte';
	import Scramble from '$lib/components/Scramble.svelte';
	import { allProjects } from '$lib/content';
	import { site } from '$lib/site';
	import * as m from '$lib/paraglide/messages';
	import { getLocaleForUrl } from '$lib/paraglide/runtime';

	const currentLocale = $derived(getLocaleForUrl(page.url));

	/**
	 * Projects expand in place — there are no per-project routes — so the hash
	 * carries which one is open. That keeps a single project linkable and
	 * forwardable, which is the whole point for the hiring audience.
	 */
	let openSlug = $state<string | null>(null);

	const projects = $derived(allProjects());

	onMount(() => {
		const slug = decodeURIComponent(location.hash.slice(1));
		if (slug && projects.some((entry) => entry.meta.slug === slug)) {
			openSlug = slug;
		}
	});

	function setOpen(slug: string, open: boolean) {
		openSlug = open ? slug : openSlug === slug ? null : openSlug;
		// replaceState, not pushState: expanding a card is not a navigation.
		const hash = openSlug ? `#${encodeURIComponent(openSlug)}` : '';
		history.replaceState(history.state, '', `${location.pathname}${location.search}${hash}`);
	}

	const span = $derived.by(() => {
		const years = projects.map((entry) => entry.meta.year);
		return years.length > 0 ? `${Math.min(...years)}–${Math.max(...years)}` : '—';
	});
</script>

<svelte:head>
	<title>{m.pageTitleWork({ name: site.name, role: m.siteRole() })}</title>
	<meta name="description" content={m.siteTagline()} />
</svelte:head>

<div class="showing-head">
	<h1><Scramble text={m.workHeading()} locale={currentLocale} /></h1>
	<p class="count legend">
		{projects.length === 1
			? m.workCountOne({ n: projects.length })
			: m.workCountOther({ n: projects.length })} ·
		<span class="num">{span}</span>
	</p>
</div>

<section aria-label={m.workHeading()}>
	{#each projects as entry, index (entry.meta.slug)}
		<ProjectEntry
			{entry}
			{index}
			open={openSlug === entry.meta.slug}
			onOpenChange={(open: boolean) => setOpen(entry.meta.slug, open)}
		/>
	{/each}
</section>

<style>
	.showing-head {
		align-items: baseline;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-4);
		justify-content: space-between;
		/* The rail used to hold this gap open; the work opens the sheet now. */
		margin: var(--space-6) 0 var(--space-4);
	}

	@media (max-width: 46rem) {
		.showing-head {
			margin-top: var(--space-4);
		}
	}

	h1 {
		font-size: var(--text-lg);
		font-variation-settings:
			'MONO' 1,
			'CASL' 0,
			'wght' 600;
		letter-spacing: 0.02em;
		margin: 0;
	}

	.count {
		margin: 0;
	}

	section {
		border-bottom: 1px solid var(--rule);
	}
</style>

<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Scramble from '$lib/components/Scramble.svelte';
	import { allPosts } from '$lib/content';
	import { localePath } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import { getLocaleForUrl } from '$lib/paraglide/runtime';
	import { site } from '$lib/site';

	const posts = allPosts();

	const currentLocale = $derived(getLocaleForUrl(page.url));
</script>

<svelte:head>
	<title>{m.writingMetaTitle({ name: site.name })}</title>
	<meta name="description" content={m.writingMetaDescription({ name: site.name })} />
</svelte:head>

<div class="showing-head">
	<h1><Scramble text={m.writingHeading()} locale={currentLocale} /></h1>
	<p class="count legend">
		{posts.length === 1
			? m.writingCountOne({ n: posts.length })
			: m.writingCountOther({ n: posts.length })}
	</p>
</div>

{#if posts.length === 0}
	<p class="empty">{m.writingEmpty()}</p>
{:else}
	<ul class="posts">
		{#each posts as { meta } (meta.slug)}
			<li>
				<a class="title" href={localePath(resolve('/writing/[slug]', { slug: meta.slug }))}
					>{meta.title}</a
				>
				<time class="num" datetime={meta.date}>{meta.date}</time>
				<p class="line">{meta.summary}</p>
				{#if meta.tags.length > 0}
					<p class="tags legend">{meta.tags.join(' · ')}</p>
				{/if}
			</li>
		{/each}
	</ul>
{/if}

<style>
	.showing-head {
		align-items: baseline;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-4);
		justify-content: space-between;
		/* The rail used to hold this gap open; the writing opens the sheet now. */
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

	.posts {
		border-bottom: 1px solid var(--rule);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.posts li {
		border-top: 1px solid var(--rule);
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		padding: calc(var(--space-3) + var(--d) * var(--space-3)) 0;
	}

	/* Same band as the work titles: the writing is work too, and outranks the close. */
	.title {
		/*
		 * 4.6vw, not 4vw: the multiplier bottoms out at 0.85 (SKIM), so the vw base
		 * must clear the 3.6vw close by that factor — below ~4.24vw the close
		 * outranks the work in the middle of the viewport range.
		 */
		font-size: calc(clamp(1.5rem, 4.6vw, 4.1rem) * (0.85 + var(--d) * 0.25));
		font-variation-settings:
			'MONO' var(--mono),
			'CASL' var(--casl),
			'wght' calc(480 + var(--d) * 220);
		letter-spacing: -0.035em;
		line-height: 1;
		text-decoration: none;
		text-wrap: balance;
	}

	.title:hover {
		color: var(--acid);
	}

	time {
		color: var(--muted);
		font-size: var(--text-sm);
		padding-top: 0.35rem;
	}

	.line {
		color: var(--muted);
		grid-column: 1 / -1;
		margin: calc(var(--show-summary) * var(--space-2)) 0 0;
		max-height: calc(var(--show-summary) * 9rem);
		max-width: var(--measure);
		opacity: var(--show-summary);
		overflow: hidden;
	}

	.tags {
		grid-column: 1 / -1;
		margin: calc(var(--show-facts) * var(--space-2)) 0 0;
		max-height: calc(var(--show-facts) * 3rem);
		opacity: var(--show-facts);
		overflow: hidden;
	}

	.empty {
		color: var(--muted);
		margin-top: var(--space-4);
	}
</style>

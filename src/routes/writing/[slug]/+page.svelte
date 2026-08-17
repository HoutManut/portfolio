<script lang="ts">
	import { resolve } from '$app/paths';
	import Marginalia from '$lib/components/Marginalia.svelte';
	import Prose from '$lib/components/Prose.svelte';
	import { localePath } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import { site } from '$lib/site';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const meta = $derived(data.post.meta);
	const headings = $derived(data.post.headings);
</script>

<svelte:head>
	<title>{m.postMetaTitle({ title: meta.title, name: site.name })}</title>
	<meta name="description" content={meta.summary} />
</svelte:head>

<article>
	<header>
		<h1>{meta.title}</h1>
	</header>

	<div class="body">
		<!-- The text-setting page of the specimen: dense reading never happens on the field. -->
		<Prose html={data.post.html} />

		<!-- Marginalia on the field beside the plate, running its full length. -->
		<Marginalia {headings}>
			<dl>
				<dt class="legend">{m.marginaliaPublished()}</dt>
				<dd><time class="num" datetime={meta.date}>{meta.date}</time></dd>
				{#if meta.tags.length > 0}
					<dt class="legend">{m.marginaliaTags()}</dt>
					<dd>{meta.tags.join(' · ')}</dd>
				{/if}
			</dl>
			<p class="back"><a href={localePath(resolve('/writing'))}>{m.writingAllWriting()}</a></p>
		</Marginalia>
	</div>
</article>

<style>
	header {
		margin: var(--space-6) 0 var(--space-4);
		max-width: var(--measure);
	}

	h1 {
		font-size: clamp(1.9rem, 4vw + 0.6rem, 3.25rem);
		font-variation-settings:
			'MONO' var(--mono),
			'CASL' var(--casl),
			'wght' 620;
		letter-spacing: -0.035em;
		margin: 0 0 var(--space-3);
	}

	.body {
		display: grid;
		gap: var(--space-5);
		/* The plate column is sized here, not by its content: the Canvas pass takes
		   the plate out of flow, so nothing is left inside to measure. */
		grid-template-columns: minmax(0, var(--plate-width)) minmax(11rem, 16rem);
		justify-content: start;
	}

	/* Marginalia owns the column; these style what this page puts in it. */
	dl {
		display: grid;
		gap: var(--space-1) var(--space-3);
		grid-template-columns: auto 1fr;
		margin: 0;
	}

	dt {
		padding-top: 0.28em;
	}

	dd {
		font-size: var(--text-sm);
		margin: 0;
	}

	.back {
		margin: var(--space-4) 0 0;
	}

	.back a {
		font-size: var(--text-micro);
		font-variation-settings:
			'MONO' 1,
			'CASL' 0,
			'wght' 500;
		letter-spacing: var(--tracking-legend);
		text-transform: var(--case-legend);
	}

	@media (max-width: 60rem) {
		.body {
			grid-template-columns: 1fr;
			gap: var(--space-4);
		}
	}
</style>

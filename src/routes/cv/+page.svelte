<script lang="ts">
	import { asset } from '$app/paths';
	import Marginalia from '$lib/components/Marginalia.svelte';
	import Prose from '$lib/components/Prose.svelte';
	import { cvEntry } from '$lib/content';
	import * as m from '$lib/paraglide/messages';
	import { site } from '$lib/site';

	const { meta, html, headings } = cvEntry();
</script>

<svelte:head>
	<title>{m.cvMetaTitle({ name: site.name })}</title>
	<meta name="description" content={m.cvMetaDescription({ name: meta.name })} />
</svelte:head>

<header>
	<h1>{meta.name}</h1>
</header>

<div class="body">
	<!-- The text-setting page of the specimen; the PDF keeps its own plain print rendition. -->
	<Prose {html} class="cv" />

	<!-- Marginalia on the field beside the plate, running its full length. -->
	<Marginalia {headings}>
		<dl>
			<dt class="legend">{m.cvUpdated()}</dt>
			<dd><time class="num" datetime={meta.updated}>{meta.updated}</time></dd>
			<dt class="legend">{m.source()}</dt>
			<dd>{m.cvSourceNotePre()}<code>content/cv.typ</code>{m.cvSourceNotePost()}</dd>
		</dl>

		<!-- Same content/cv.typ that produced this page, compiled to the paged target. -->
		<a class="download" href={asset('/cv.pdf')} download>
			{m.cvDownloadPdf()}
			<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
				<line x1="6" y1="0.5" x2="6" y2="9" />
				<polyline points="2.5,5.5 6,9 9.5,5.5" />
				<line x1="1" y1="11.5" x2="11" y2="11.5" />
			</svg>
		</a>
	</Marginalia>
</div>

<style>
	header {
		margin: var(--space-6) 0 var(--space-4);
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
		margin: 0 0 var(--space-4);
	}

	dt {
		padding-top: 0.28em;
	}

	dd {
		font-size: var(--text-sm);
		margin: 0;
	}

	code {
		font-size: 0.95em;
		font-variation-settings:
			'MONO' 1,
			'CASL' 0;
	}

	h1 {
		font-size: clamp(2rem, 5vw + 0.5rem, 3.75rem);
		font-variation-settings:
			'MONO' var(--mono),
			'CASL' var(--casl),
			'wght' 660;
		letter-spacing: -0.04em;
		line-height: 0.95;
		margin: 0;
	}

	.download {
		align-items: center;
		border: 1px solid var(--rule);
		display: inline-flex;
		font-size: var(--text-micro);
		font-variation-settings:
			'MONO' 1,
			'CASL' 0,
			'wght' 500;
		gap: var(--space-2);
		letter-spacing: var(--tracking-legend);
		padding: var(--space-2) var(--space-3);
		text-decoration: none;
		text-transform: var(--case-legend);
		transition:
			background-color 140ms var(--ease),
			color 140ms var(--ease),
			border-color 140ms var(--ease);
	}

	.download:hover {
		background: var(--acid);
		border-color: var(--acid);
		color: var(--ink);
	}

	.download svg {
		fill: none;
		height: 11px;
		stroke: currentColor;
		stroke-width: 1.25;
		width: 11px;
	}

	@media (max-width: 60rem) {
		.body {
			grid-template-columns: 1fr;
			gap: var(--space-4);
		}
	}
</style>

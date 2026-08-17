<script lang="ts">
	import { onMount } from 'svelte';
	import Prose from './Prose.svelte';
	import RetroDither from '$lib/components/canvasui/RetroDither.svelte';
	import { figureFor } from '$lib/figures';
	import { motion, watchMotionPreference } from '$lib/motion.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Entry, ProjectMeta } from '$lib/content';

	/**
	 * One project, set as a specimen showing: the figure cell, the title at
	 * display scale, and the metadata as the cell's caption.
	 *
	 * Native <details> on purpose: keyboard operation and the announced
	 * expanded state come from the browser, and the disclosure still works with
	 * JavaScript disabled. The page owns which one is open (see
	 * routes/+page.svelte) so a single project stays linkable via the hash.
	 *
	 * The DETAIL axis (see AxisRail.svelte) scales this row and reveals its
	 * caption lines continuously — it never opens or closes the disclosure, so
	 * the hash and aria-expanded keep meaning one thing.
	 */
	let {
		entry,
		index,
		open = false,
		onOpenChange
	}: {
		entry: Entry<ProjectMeta>;
		/** Position in the sorted index; the figure's catalogue number. */
		index: number;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	} = $props();

	const meta = $derived(entry.meta);
	const figure = $derived(figureFor(meta.slug));
	const figNumber = $derived(String(index + 1).padStart(2, '0'));

	/*
	 * The cell is put through a halftone screen — the way a press renders a
	 * figure. It runs over whatever the cell holds: the pending hatch now, a real
	 * screenshot once one lands. Client-only and motion-gated for the same reason
	 * as Ground: the effect is a rAF loop that the CSS reduced-motion rule cannot
	 * reach. Without it the cell is exactly the state the site shipped with.
	 */
	let mounted = $state(false);
	const screened = $derived(mounted && !motion.reduced);

	/** --field and --paper as the 0–1 triples the shader wants. */
	const FIELD: [number, number, number] = [28 / 255, 34 / 255, 200 / 255];
	const PAPER: [number, number, number] = [241 / 255, 239 / 255, 230 / 255];

	/**
	 * A press runs a different screen ruling per plate, so the slug picks one.
	 * Every figure then carries its own grain at the same viewing distance
	 * rather than four identical dot patterns down the page. The band is narrow
	 * on purpose: this differentiates, it does not become four effects.
	 */
	function screenFor(slug: string): { pixelSize: number; levels: number } {
		let hash = 0;
		for (let i = 0; i < slug.length; i += 1) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
		return { pixelSize: 4 + (hash % 4), levels: 3 + ((hash >>> 5) % 3) };
	}

	const screen = $derived(screenFor(meta.slug));

	onMount(() => {
		watchMotionPreference();
		mounted = true;
	});

	function onToggle(event: Event & { currentTarget: HTMLDetailsElement }) {
		onOpenChange?.(event.currentTarget.open);
	}
</script>

{#snippet stackList(items: { name: string; url?: string }[])}
	<span class="stack-list">
		{#each items as item, i (item.name)}
			{#if i > 0}<span aria-hidden="true">{' · '}</span>{/if}
			{#if item.url}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- absolute off-site URL from frontmatter -->
				<a href={item.url} class="stack-link">{item.name}</a>
			{:else}
				{item.name}
			{/if}
		{/each}
	</span>
{/snippet}

<details class="entry" {open} ontoggle={onToggle}>
	<summary id={meta.slug}>
		<span class="figure">
			<span class="cell" class:pending={!figure}>
				{#snippet plate()}
					{#if figure}
						<img src={figure} alt="" width="1600" height="1000" loading="lazy" />
					{:else}
						<span class="hatch"><span class="legend">{m.projectFigPending()}</span></span>
					{/if}
				{/snippet}

				{#if screened}
					<RetroDither
						class="screen"
						pattern="halftone"
						pixelSize={screen.pixelSize}
						levels={screen.levels}
						radius={0.5}
						softness={1}
						followSpeed={2.4}
						strength={0.8}
						baseStrength={0.4}
						contrast={0.9}
						colorize={0.05}
						darkColor={FIELD}
						lightColor={PAPER}
						trail={0}
						degauss={0}
						scanlines={0}
					>
						{@render plate()}
					</RetroDither>
				{:else}
					{@render plate()}
				{/if}
			</span>

			<!--
				The one per-project mark the DETAIL axis never gates: the summary and
				the facts interpolate away under SKIM, this stays. It sits under the
				cell rather than inside it because .cell is what the halftone screen
				captures, and 11px tracked legend text run through a dither is a
				legibility defect.
			-->
			<span class="figcap legend">
				<span class="num">{m.projectFig({ n: figNumber })}</span>
				<span class="kind">{meta.kind}</span>
			</span>
		</span>

		<span class="showing">
			<span class="title">{meta.title}</span>
			<span class="line">{meta.summary}</span>
			<span class="facts">
				<span class="fact"><span class="legend">{m.projectStatus()}</span> {meta.status}</span>
				{#if meta.stack.length > 0}
					<span class="fact"
						><span class="legend">{m.projectStack()}</span> {@render stackList(meta.stack)}</span
					>
				{/if}
			</span>
		</span>

		<span class="index">
			<span class="year num">{meta.year}</span>
			{#if meta.placeholder}
				<span class="badge">{m.projectSeedBadge()}</span>
			{/if}
			<svg class="disclose" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
				<line x1="0.5" y1="6" x2="11.5" y2="6" />
				<line class="stem" x1="6" y1="0.5" x2="6" y2="11.5" />
			</svg>
		</span>
	</summary>

	<div class="body">
		<!--
			The text-setting page; the caption beside it stays on the field, as in the
			sheet. The Canvas pass runs only while the entry is on show — see `fx` in
			Prose.svelte.
		-->
		<Prose html={entry.html} fx={open} />

		<aside class="caption">
			<dl>
				<dt class="legend">{m.projectStatus()}</dt>
				<dd>{meta.status}</dd>
				<dt class="legend">{m.projectYear()}</dt>
				<dd class="num">{meta.year}</dd>
				{#if meta.stack.length > 0}
					<dt class="legend">{m.projectStack()}</dt>
					<dd>{@render stackList(meta.stack)}</dd>
				{/if}
			</dl>

			{#if meta.live || meta.repo}
				<!-- eslint-disable svelte/no-navigation-without-resolve -- absolute off-site URLs from frontmatter -->
				<p class="links">
					{#if meta.live}
						<a href={meta.live}>
							{m.projectLiveSite()}
							<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
								<line x1="1" y1="11" x2="11" y2="1" />
								<polyline points="4,1 11,1 11,8" />
							</svg>
						</a>
					{/if}
					{#if meta.repo}
						<a href={meta.repo}>
							{m.source()}
							<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
								<line x1="1" y1="11" x2="11" y2="1" />
								<polyline points="4,1 11,1 11,8" />
							</svg>
						</a>
					{/if}
				</p>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{/if}
		</aside>
	</div>
</details>

<style>
	.entry {
		border-top: 1px solid var(--rule);
	}

	/*
	 * The disclosure is one gesture, so it gets one duration: the stem below runs
	 * at 220ms and the body it discloses used to appear instantly beneath it. The
	 * keyword interpolation comes from `interpolate-size: allow-keywords` in
	 * app.css; content-visibility is a discrete property and needs allow-discrete
	 * to hold the body visible for the length of the close.
	 *
	 * Chromium animates it, Firefox and Safari snap — which is the state this
	 * shipped in, so there is nothing to fall back to.
	 */
	.entry::details-content {
		block-size: 0;
		overflow: hidden;
		transition:
			block-size 220ms var(--ease),
			content-visibility 220ms allow-discrete;
	}

	.entry[open]::details-content {
		block-size: auto;
	}

	summary {
		align-items: start;
		cursor: pointer;
		display: grid;
		/* The figure cell is a glyph cell: it grows with the DETAIL axis. */
		grid-template-columns: calc(4.5rem + var(--d) * 7.5rem) minmax(0, 1fr) auto;
		gap: var(--space-4);
		list-style: none;
		padding: calc(var(--space-3) + var(--d) * var(--space-3)) 0;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary:focus-visible {
		outline: 2px solid var(--acid);
		outline-offset: 4px;
	}

	/* -- the figure cell --------------------------------------------------- */

	/* The plate and its caption are one column: the cell, then the legend under it. */
	.figure {
		display: grid;
		gap: var(--space-2);
		min-width: 0;
	}

	/*
	 * Wraps to two lines in the narrow column and sits on one in the wide one —
	 * a caption, not a label that must be kept on a single line.
	 */
	.figcap {
		display: flex;
		flex-wrap: wrap;
		gap: 0 0.6em;
	}

	/*
	 * Paper over muted: the kind is the distinction a visitor reads at a glance,
	 * the number is only the register it is filed under. No new colour — this is
	 * the same two-step the sheet uses everywhere between a value and its label.
	 */
	.figcap .kind {
		color: var(--paper);
		overflow-wrap: anywhere;
	}

	.cell {
		aspect-ratio: 16 / 10;
		border: 1px solid var(--rule);
		display: grid;
		overflow: hidden;
		place-items: center;
		transition: border-color 160ms var(--ease);
	}

	.entry:hover .cell {
		border-color: var(--rule-strong);
	}

	.cell img {
		display: block;
		height: auto;
		max-height: 100%;
		max-width: 100%;
		object-fit: contain;
		width: auto;
	}

	/* The screen fills the cell; without it the plate sits there directly. */
	.cell :global(.screen) {
		height: 100%;
		width: 100%;
	}

	/*
	 * A designed pending state, not a grey box: the specimen's empty cell. The
	 * hatch lives here rather than on .cell so it is inside what the halftone
	 * screen reads — the shader captures its own subtree, and a background on the
	 * cell would sit outside it.
	 */
	.hatch {
		background-color: var(--field);
		background-image: repeating-linear-gradient(
			-45deg,
			transparent 0 5px,
			color-mix(in srgb, var(--rule) 55%, transparent) 5px 6px
		);
		display: grid;
		height: 100%;
		place-items: center;
		width: 100%;
	}

	.cell.pending .legend {
		background: var(--field);
		font-size: 0.5625rem;
		letter-spacing: var(--tracking-legend);
		padding: 0.25em 0.4em;
		text-align: center;
	}

	/* -- the showing ------------------------------------------------------- */

	.showing {
		display: grid;
		min-width: 0;
	}

	/*
	 * The largest type on the sheet is the work, at every axis instance. Nothing
	 * else on the page — wordmark or contact — may outrank it; that is the whole
	 * answer to a specimen's habit of being about the face instead of the work.
	 */
	.title {
		font-size: calc(clamp(1.5rem, 4.6vw, 4.1rem) * (0.85 + var(--d) * 0.25));
		font-variation-settings:
			'MONO' var(--mono),
			'CASL' var(--casl),
			'wght' calc(480 + var(--d) * 220);
		letter-spacing: -0.035em;
		line-height: 0.98;
		text-wrap: balance;
	}

	.entry:hover .title {
		color: var(--acid);
	}

	/*
	 * The caption lines interpolate open with the DETAIL axis rather than
	 * switching at a threshold — one input remaps every row on the page at once.
	 */
	.line {
		color: var(--muted);
		font-size: var(--text-base);
		margin-top: calc(var(--show-summary) * var(--space-2));
		/* Tall enough for a four-line summary at 390px — the axis reveals, it never truncates. */
		max-height: calc(var(--show-summary) * 9rem);
		opacity: var(--show-summary);
		overflow: hidden;
	}

	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-4);
		margin-top: calc(var(--show-facts) * var(--space-3));
		max-height: calc(var(--show-facts) * 7rem);
		opacity: var(--show-facts);
		overflow: hidden;
	}

	.fact {
		align-items: baseline;
		display: flex;
		font-size: var(--text-sm);
		gap: var(--space-2);
		min-width: 0;
	}

	.fact .legend {
		display: inline;
		flex: 0 0 auto;
		white-space: nowrap;
	}

	.stack-list {
		flex: 1 1 auto;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	/* Stack entries with a source link get an underline; plain names don't. */
	:global(.stack-link) {
		color: inherit;
		text-decoration-color: var(--muted);
		text-underline-offset: 0.15em;
		transition: color 140ms var(--ease);
	}

	:global(.stack-link:hover) {
		color: var(--acid);
	}

	/* -- the index column -------------------------------------------------- */

	.index {
		align-items: center;
		display: flex;
		gap: var(--space-3);
		padding-top: 0.35rem;
	}

	.year {
		color: var(--muted);
		font-size: var(--text-sm);
	}

	.badge {
		border: 1px solid var(--acid);
		color: var(--acid);
		font-size: 0.5625rem;
		font-variation-settings:
			'MONO' 1,
			'CASL' 0,
			'wght' 600;
		letter-spacing: var(--tracking-legend);
		padding: 0.15em 0.4em;
		text-transform: var(--case-legend);
	}

	.disclose {
		height: 14px;
		overflow: visible;
		stroke: var(--muted);
		stroke-width: 1.25;
		width: 14px;
	}

	.entry:hover .disclose {
		stroke: var(--acid);
	}

	.disclose .stem {
		transform-origin: 50% 50%;
		transition: transform 220ms var(--ease);
	}

	.entry[open] .disclose .stem {
		transform: scaleY(0);
	}

	/* -- the opened body --------------------------------------------------- */

	.body {
		display: grid;
		gap: var(--space-5);
		/* The plate column is sized here, not by its content: the Canvas pass takes
		   the plate out of flow, so nothing is left inside to measure. */
		grid-template-columns: minmax(0, var(--plate-width)) minmax(11rem, 16rem);
		justify-content: start;
		margin-bottom: var(--space-5);
	}

	/* First baseline meets the plate's first line of text, not the plate's top edge. */
	.caption {
		padding-top: var(--plate-pad);
	}

	.caption dl {
		display: grid;
		gap: var(--space-1) var(--space-3);
		grid-template-columns: auto 1fr;
		margin: 0;
	}

	.caption dt {
		padding-top: 0.28em;
	}

	.caption dd {
		font-size: var(--text-sm);
		margin: 0;
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin: var(--space-4) 0 0;
	}

	.links a {
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

	.links a:hover {
		background: var(--acid);
		border-color: var(--acid);
		color: var(--ink);
	}

	.links svg {
		fill: none;
		height: 9px;
		stroke: currentColor;
		stroke-width: 1.25;
		width: 9px;
	}

	@media (max-width: 46rem) {
		summary {
			grid-template-columns: calc(4rem + var(--d) * 2.5rem) minmax(0, 1fr);
			gap: var(--space-3);
			padding: var(--space-3) 0;
		}

		.index {
			grid-column: 2;
			padding-top: var(--space-2);
		}

		.title {
			font-size: calc(clamp(1.5rem, 7vw, 2.25rem) * (0.85 + var(--d) * 0.2));
		}

		/* Wrapped descriptions and stack values must grow naturally on narrow screens. */
		.line,
		.facts {
			max-height: none;
			overflow: visible;
		}

		.cell.pending .legend {
			font-size: 0.5rem;
			padding: 0.2em 0.25em;
		}

		.body {
			gap: var(--space-4);
			grid-template-columns: 1fr;
		}

		.caption {
			order: -1;
			padding-top: 0;
		}

		/* The caption repeats status/stack (plus year) right below the summary once
		   open, so the preview row would sit almost flush against its own repeat. */
		.entry[open] .facts {
			display: none;
		}
	}
</style>

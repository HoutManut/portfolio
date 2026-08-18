<script lang="ts">
	/**
	 * Renders a Typst-compiled body as a text-setting page.
	 *
	 * The HTML is generated at build time from a .typ file in this repo by
	 * scripts/build-content.ts — it is not user input, and there is no runtime
	 * path that can reach {@html} with anything else.
	 *
	 * Typst emits `= Heading` as <h2>, so the page <h1> stays with the route and
	 * heading order is correct without post-processing.
	 *
	 * This is the only {@html} site in the repo — cv, writing posts and project
	 * entries all render through it — so the Cloth pass applied here is the pass
	 * applied to every Typst-compiled element on the site.
	 *
	 * The plate is set here rather than by the routes. The pass has to run over
	 * the whole page — paper and margins included — or it renders as a
	 * measure-wide panel floating inside an untouched cream border, which is the
	 * one arrangement that reads as a mistake. The routes hand over a body; this
	 * decides what page it is set on.
	 *
	 * Gated like Ground: without JavaScript, or under `prefers-reduced-motion:
	 * reduce`, the same markup renders unwrapped instead of paying for a live
	 * WebGL context and full-height backing store to draw a fabric that never
	 * moves.
	 *
	 * `fx` is the second gate, for callers that keep a body in the DOM while it is
	 * not on show. A closed <details> does not stop the pass on its own: the
	 * html-in-canvas path lifts the body into `<canvas layoutsubtree>`, which
	 * escapes the disclosure's hiding, so all four project entries would hold a
	 * live WebGL context and a full-height backing store for content nobody is
	 * reading — alongside Ground's and every figure cell's. Contexts are a capped
	 * resource; when the cap is hit the browser drops the oldest, and the oldest
	 * here is the ground.
	 */
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import Cloth from '$lib/components/canvasui/Cloth.svelte';
	import { motion, watchMotionPreference } from '$lib/motion.svelte';

	let {
		html,
		class: className = '',
		fx = true
	}: { html: string; class?: string; fx?: boolean } = $props();

	/**
	 * Typst content is compiled once, offline, with no notion of a deploy base
	 * path — `#link("/")` always emits a site-root-relative `href="/"`. Rewrite
	 * those at render time rather than re-authoring content per deploy target.
	 * `(?!\/)` skips protocol-relative `href="//…"` external links.
	 */
	const content = $derived(base ? html.replaceAll(/href="\/(?!\/)/g, `href="${base}/`) : html);

	let mounted = $state(false);
	const enabled = $derived(fx && mounted && !motion.reduced);

	onMount(() => {
		watchMotionPreference();
		mounted = true;
	});

	/*
	 * backing="auto" samples the computed background-colour up the ancestor
	 * chain from the content, which resolves to --paper via .plate — the fabric
	 * stays the plate's own colour instead of a colour restated here that would
	 * drift from --paper under a palette change.
	 *
	 * Every other size here (amplitude, drape, brushSize, cornerRadius,
	 * perspective) is a constant CSS-pixel value, not a fraction of the
	 * content's own measured height — unlike Canvas's `radius`, so `fit="flow"`
	 * needs no accompanying `radiusPx`-style override. See canvasui/README.md.
	 */
</script>

{#snippet plate()}
	<div class="plate">
		<div class="prose {className}">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time content, see above -->
			{@html content}
		</div>
	</div>
{/snippet}

{#if enabled}
	<Cloth
		class="prose-fx"
		fit="flow"
		wind={0.25}
		speed={0.15}
		amplitude={10}
		drape={40}
		brush={1}
		brushSize={110}
		damping={1.1}
		light={0.9}
		sheen={0.1}
		shadow={0.3}
		cornerRadius={0}
		perspective={2000}
		pin="top"
		backing="auto"
	>
		{@render plate()}
	</Cloth>
{:else}
	{@render plate()}
{/if}

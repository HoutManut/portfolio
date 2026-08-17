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
	 * entries all render through it — so the Canvas pass applied here is the pass
	 * applied to every Typst-compiled element on the site.
	 *
	 * The plate is set here rather than by the routes. The pass has to run over
	 * the whole page — paper and margins included — or it renders as a
	 * measure-wide panel floating inside an untouched cream border, which is the
	 * one arrangement that reads as a mistake. The routes hand over a body; this
	 * decides what page it is set on.
	 *
	 * Gated like Ground: Canvas's own reduced-motion handling only skips the intro
	 * and pins the brush to the cursor, it does not stop the rAF loop, so a true
	 * stop has to happen at the mount. Without JavaScript, or under
	 * `prefers-reduced-motion: reduce`, the same markup renders unwrapped.
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
	import Canvas from '$lib/components/canvasui/Canvas.svelte';
	import { motion, watchMotionPreference } from '$lib/motion.svelte';

	let {
		html,
		class: className = '',
		fx = true
	}: { html: string; class?: string; fx?: boolean } = $props();

	let mounted = $state(false);
	const enabled = $derived(fx && mounted && !motion.reduced);

	onMount(() => {
		watchMotionPreference();
		mounted = true;
	});

	/*
	 * The paper the pass warms towards, matching --paper so the plate keeps its
	 * own colour instead of being washed to a grey slab. tintStrength is what
	 * decides how far the painting is pulled off the page underneath it; the
	 * playground's 0.9 over a cream plate flattens the whole measure. Held low,
	 * with the weave and the screen down to a tooth rather than a pattern, what
	 * lands is paper that takes the brush — not a filter over the reading.
	 */
	const TINT: [number, number, number] = [241 / 255, 239 / 255, 230 / 255];

	/*
	 * Canvas's `radius` is a fraction of the content's own measured height, so
	 * one fraction reads as wildly different brush sizes across bodies of very
	 * different lengths — too small on a short project entry, right on a long
	 * one like the Typst writeup. `radiusPx` (a canvasui/Canvas.svelte LOCAL
	 * PATCH) fixes the brush to a constant CSS-pixel size instead, computed from
	 * the actual measured height once it lands. ~260px is that longer body's
	 * brush size at the previous 0.05 fraction — the size to keep everywhere.
	 * `radius` still governs the instant before the first measurement.
	 */
	const RADIUS_PX = 260;
</script>

{#snippet plate()}
	<div class="plate">
		<div class="prose {className}">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time content, see above -->
			{@html html}
		</div>
	</div>
{/snippet}

{#if enabled}
	<Canvas
		class="prose-fx"
		fit="flow"
		threadSize={2}
		threadWidth={0.15}
		texture={0.75}
		tintStrength={0.25}
		grain={0.7}
		halftone={0.08}
		dotSize={3.5}
		strength={0.25}
		relief={0.15}
		gloss={0.35}
		bristle={0.25}
		dry={3.9}
		radius={0.05}
		radiusPx={RADIUS_PX}
		followSpeed={5}
		tint={TINT}
	>
		{@render plate()}
	</Canvas>
{:else}
	{@render plate()}
{/if}

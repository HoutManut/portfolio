<script lang="ts">
	/**
	 * The field itself, asciified.
	 *
	 * The page background lives here rather than on `body`: this layer *is* the
	 * ultramarine ground, and Asciify reads it. That is what makes the effect
	 * workable at all. Asciify is a filter, not a generator — every cell it does
	 * not select outputs transparent, so whatever it wraps stays visible
	 * underneath. Wrapping the whole page therefore asciifies the work and makes it
	 * unreadable; wrapping a synthetic pattern leaves that pattern on show. A plain
	 * blue plate is the one source that is meant to be seen and has nothing to give
	 * away, so the visitor sees plain blue plus characters, and the content sits on
	 * top untouched at z-index 1.
	 *
	 * Coverage is a per-cell stochastic dither, not a soft edge:
	 *   apply = step(hash21(cell), mask)
	 * so baseStrength 0.1 scatters roughly one cell in ten across the open field,
	 * and the lens breaks up into loose glyphs at its rim instead of ending on a
	 * clean circle.
	 *
	 * Motion is the lens and only the lens. Asciify's rAF loop parks itself once
	 * the pointer settles, and the shader re-uploads just its pointer uniforms per
	 * frame — an option animated after construction is never re-sent, so nothing
	 * else in this component can be made to move.
	 *
	 * Decoration throughout: behind everything, aria-hidden, never takes a pointer
	 * event, and absent under reduced motion or without JavaScript, where the flat
	 * field on `html` shows through unchanged.
	 */
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Asciify from '$lib/components/canvasui/Asciify.svelte';
	import { axes } from '$lib/axes.svelte';
	import { motion, watchMotionPreference } from '$lib/motion.svelte';
	import { theme, paletteOf } from '$lib/theme.svelte';

	let mounted = $state(false);
	const enabled = $derived(mounted && !motion.reduced);

	onMount(() => {
		watchMotionPreference();
		mounted = true;
	});

	/*
	 * The DETAIL axis sets the screen ruling — coarse cells at SKIM, fine at FULL,
	 * so the dial that governs row density also governs how finely the ground is
	 * resolved. Quantised to whole steps because a scale change rebuilds the glyph
	 * atlas, which must not happen on every frame of a drag.
	 */
	const scale = $derived(Math.round(3 - axes.detail / 1000));

	/*
	 * The backing reference, deliberately darker than --field rather than equal to
	 * it. Glyph colour is uBg + (pixel - uBg) / max(|lumDelta|, 0.2). Against a
	 * field-coloured backing the field would have zero delta and every glyph would
	 * come back exactly field-coloured — invisible, which is what a plain source
	 * rendered before.
	 *
	 * A fixed darken ratio isn't enough: the shader almost always sits in the
	 * clamp (delta < 0.2), so the glyph colour comes out to field * (5 - 4k) for
	 * backing = field * k — a straight multiple of the field. Palette C's field
	 * is both darker overall AND has its energy spread across G and B rather than
	 * concentrated in one channel the way the ultramarine original is, so the
	 * same k that reads as a periwinkle tint on #1c22c8 clips two channels to
	 * white on #08495e and comes back a bright cyan flash instead.
	 *
	 * So k is solved per palette to land the *output luminance* at the same
	 * target every time — 0.716, what k=0.357 against the original field
	 * produces — rather than at a fixed ratio of the input. Near-black fields
	 * (E/F) can't reach that target within the 5x ceiling the clamp imposes and
	 * just amplify at the max instead, which is the dim-but-fine look already in
	 * place for them.
	 */
	const TARGET_OUTPUT_LUM = 0.716;

	function hexToRgb01(hex: string): [number, number, number] {
		const n = parseInt(hex.slice(1), 16);
		return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
	}

	function luminance([r, g, b]: [number, number, number]): number {
		return 0.299 * r + 0.587 * g + 0.114 * b;
	}

	function backingFor(fieldHex: string): [number, number, number] {
		const field = hexToRgb01(fieldHex);
		const fieldLum = Math.max(luminance(field), 0.0001);
		const multiplier = Math.min(5, Math.max(1, TARGET_OUTPUT_LUM / fieldLum));
		const k = (5 - multiplier) / 4;
		return field.map((c) => c * k) as [number, number, number];
	}

	const BACKING = $derived(backingFor(paletteOf(theme.id).field));
</script>

{#if enabled}
	<div class="ground js-only" aria-hidden="true" transition:fade={{ duration: 600 }}>
		<Asciify
			class="ground-fx"
			radius={0.4}
			softness={0.7}
			{scale}
			spacing={1}
			backgroundOpacity={0}
			contrast={0.5}
			brightness={0.1}
			invert={0}
			glow={0.55}
			aberration={0.75}
			strength={0.9}
			baseStrength={0.05}
			followSpeed={3}
			charset="ascii"
			background={BACKING}
			trackPointerOn="window"
			protectText={false}
		>
			<div class="field"></div>
		</Asciify>
	</div>
{/if}

<style>
	.ground {
		inset: 0;
		/* Faint on purpose: a mark on the ground, never a second thing to look at. */
		opacity: 0.45;
		overflow: hidden;
		pointer-events: none;
		position: fixed;
		z-index: 0;
	}

	/*
	 * Asciify binds its pointer listeners to its own wrapper by default, which a
	 * pointer-events: none layer never receives — the lens would never move and the
	 * loop would render one frame and park. trackPointerOn="window" (a local patch,
	 * see canvasui/README.md) is what lets this layer stay click-through and still
	 * follow the cursor.
	 */
	.ground :global(.ground-fx) {
		height: 100%;
		pointer-events: none;
		width: 100%;
	}

	/*
	 * The page ground, moved off body so the shader can read it.
	 *
	 * Deliberately NOT called .plate. Svelte's scoping adds a hash but does not stop
	 * app.css's global `.plate` from matching too, and that rule carries
	 * `width: calc(68ch + 2 * padding)` for the paper reading plate — which silently
	 * clipped this layer to 798px and cut the effect off mid-viewport.
	 *
	 * Flat, with no grain or pattern. That is a deliberate trade and it costs glyph
	 * variety: the glyph index is int(amount * 10) off the cell's luminance, so a
	 * perfectly even blue puts every cell on the same rung and the whole field
	 * resolves to one repeated character. The alternative is texture in the source,
	 * and since unselected cells output transparent, any such texture is visible on
	 * the page as grain or dots. A clean background with one mark beats a varied one
	 * over a mottled ground, so the single glyph is the accepted outcome.
	 */
	.field {
		background: var(--field);
		height: 100%;
		inset: 0;
		position: absolute;
		width: 100%;
	}
</style>

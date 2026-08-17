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
	 * rendered before. This dark blue puts the delta under the 0.2 clamp, so it is
	 * amplified about 5x and the glyphs land on a light periwinkle: lighter blue
	 * drawn out of the blue that is already there. It is never painted —
	 * backgroundOpacity 0 gives alpha to glyph pixels only.
	 */
	const BACKING: [number, number, number] = [10 / 255, 12 / 255, 72 / 255];
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
			contrast={1}
			brightness={0.3}
			invert={0}
			glow={0.55}
			aberration={0.75}
			strength={1}
			baseStrength={0.1}
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

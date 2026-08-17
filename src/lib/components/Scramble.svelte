<script lang="ts">
	/**
	 * A string that decodes into its new wording when the locale changes.
	 *
	 * The component renders `displayed`, never `text`. That is the whole trick:
	 * the destination string has no path to the DOM except through a frame of
	 * this animation, so there is no window in which the new locale's wording —
	 * or its fallback face, which `unicode-range` picks per glyph — can paint
	 * before the decode starts. It also means Svelte keeps ownership of the text
	 * node; writing `textContent` from an effect would swap that node out and
	 * silently orphan every later update (see `set_text` in svelte/internal).
	 *
	 * Renders its own span so a call site keeps its element, classes and
	 * attributes exactly as they were. `text-transform`, `letter-spacing` and
	 * `font-variation-settings` all inherit into it.
	 */
	import { onMount, untrack } from 'svelte';

	import { motion } from '$lib/motion.svelte';
	import { createScrambleRun, easeOutQuart, readCase, type TextCase } from '$lib/scramble';

	interface Props {
		/** The settled string, in the current locale. */
		text: string;
		/** The current locale — picks the glyph pool and the segmenter's rules. */
		locale: string;
		duration?: number;
		tickMs?: number;
	}

	let { text, locale, duration = 1100, tickMs = 55 }: Props = $props();

	let el: HTMLSpanElement;
	// The initial value on purpose: from here on `displayed` is driven by the
	// animation, and later `text` changes reach it only through a run.
	let displayed = $state(untrack(() => text));

	/** What `displayed` is settling on: the last `text` this component acted on. */
	let target = untrack(() => text);
	/**
	 * The two lang-dependent properties, as they stand with nothing frozen: the
	 * `text-transform` and the `letter-spacing` this element inherits from its
	 * call site. Both are governed by --case-legend and --tracking-legend, which
	 * :lang(ja)/:lang(km) zeroes (app.css), and both are declared on the *parent*
	 * — `.legend`, `.view` — so they are already resolved by the time they reach
	 * this span and cannot be re-read for a different locale from here.
	 *
	 * So they are recorded instead: on mount, and again on every settle. That
	 * record is the *source* locale's pair when a run starts, at which point the
	 * cascade is showing the destination's — the layout flips <html lang> in a
	 * pre-effect, ahead of this component's effect and of any paint.
	 */
	let restingCase: TextCase = 'none';
	let restingTracking = 0;
	let frame = 0;

	/** `letter-spacing` computes to `normal` rather than a length when untracked. */
	function trackingPx(value: string): number {
		return value === 'normal' ? 0 : parseFloat(value) || 0;
	}

	/** Reads the pair the cascade is currently offering, with any freeze lifted. */
	function readResting() {
		el.style.textTransform = '';
		el.style.letterSpacing = '';
		const computed = getComputedStyle(el);
		return {
			textCase: readCase(computed.textTransform),
			tracking: trackingPx(computed.letterSpacing)
		};
	}

	function settle(value: string) {
		frame = 0;
		displayed = value;
		// Hand case and tracking back to the cascade — on a string it will render
		// exactly as the last frame did — and take the new locale's pair on record
		// for whichever switch comes next.
		const resting = readResting();
		restingCase = resting.textCase;
		restingTracking = resting.tracking;
		el.removeAttribute('lang');
	}

	function start(next: string, loc: string) {
		if (next === target) return;
		if (frame) cancelAnimationFrame(frame);
		target = next;

		if (motion.reduced) {
			settle(next);
			return;
		}

		const from = displayed;
		const fromCase = restingCase;
		const fromTracking = restingTracking;
		// What the cascade has already moved to, since <html lang> is flipped by
		// the time this runs.
		const { textCase: toCase, tracking: toTracking } = readResting();

		// The element carries the destination language for the whole run: it is
		// true of the text about to be on screen, and it keeps the two frozen
		// properties from being read as a mismatch by anything else.
		el.lang = loc;
		el.style.textTransform = 'none';
		el.style.letterSpacing = `${fromTracking}px`;

		const run = createScrambleRun({
			from,
			to: next,
			locale: loc,
			fromCase,
			toCase,
			duration,
			tickMs
		});

		// Frame zero, synchronously — the source string with its leading character
		// already coming apart, in the source locale's case and tracking. Leaving
		// the first write to the rAF callback would gamble on that callback
		// running before the next paint, and losing that gamble is one frame of
		// the source string with its case and tracking already snapped to the
		// destination's, which is the flash this freeze exists to prevent.
		displayed = run.frameAt(0);

		const startedAt = performance.now();

		const step = (now: number) => {
			const elapsed = now - startedAt;
			if (elapsed >= run.duration) {
				settle(next);
				return;
			}
			displayed = run.frameAt(elapsed);
			// Tracking rides the run's clock so the metrics resolve with the glyphs
			// instead of snapping at the click, but eased rather than linear: it
			// clears most of the distance early and settles, so the words stop
			// shifting under the eye well before the decode finishes.
			const p = easeOutQuart(run.progressAt(elapsed));
			el.style.letterSpacing = `${fromTracking + (toTracking - fromTracking) * p}px`;
			frame = requestAnimationFrame(step);
		};
		frame = requestAnimationFrame(step);
	}

	// Declared before the run effect below so the resting pair is on record
	// before any locale switch can ask for it.
	onMount(() => {
		const resting = readResting();
		restingCase = resting.textCase;
		restingTracking = resting.tracking;
		return () => {
			if (frame) cancelAnimationFrame(frame);
		};
	});

	$effect(() => {
		const next = text;
		const loc = locale;
		// `start` reads and writes `displayed`; untracked so this effect depends
		// on the props alone and never re-enters itself.
		untrack(() => start(next, loc));
	});
</script>

<span bind:this={el}>{displayed}</span>

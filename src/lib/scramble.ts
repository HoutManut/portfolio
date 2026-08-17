/**
 * A one-shot "decode" effect: a string cycles through random glyphs on its way
 * from one locale's wording to another's, eased in rhythm but linear in length.
 *
 * This module computes frames; it never touches the DOM. `Scramble.svelte`
 * drives it and renders the result through Svelte state, which is the only way
 * the two can share an element — writing `textContent` from here would replace
 * the text node Svelte holds a reference to and orphan every later update.
 *
 * Grapheme-safe by construction — it segments with Intl.Segmenter rather than
 * indexing the string, so a combining Khmer cluster (a base consonant plus its
 * subscript or vowel mark) is scrambled or revealed as one unit and never
 * split mid-cluster into broken partial glyphs.
 */

const SCRAMBLE_POOLS: Record<string, readonly string[]> = {
	en: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
	ja: [
		...'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン'
	],
	km: [...'កខគឃងចឆជឈញដឋឌឍណតថទធនបផពភមយរលវសហឡអឣឤឥឦឧឩឪឫឬឭឮឯឰឱឲឳ']
};

const LETTER = /\p{L}/u;

/**
 * The `text-transform` values this site actually sets — `--case-legend` is
 * `uppercase` on Latin and `none` under :lang(ja)/:lang(km) (see app.css). The
 * other two are here so an unexpected computed value degrades to `none` rather
 * than throwing.
 */
export type TextCase = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

export function readCase(computed: string): TextCase {
	return computed === 'uppercase' || computed === 'lowercase' || computed === 'capitalize'
		? computed
		: 'none';
}

/**
 * Applied in JS during a run, with inline `text-transform: none` on the
 * element, so the case on screen is decided by which string a position is
 * currently showing rather than by whichever locale the cascade has reached.
 * Flipping `:lang()` mid-animation would otherwise re-case the source glyphs
 * that are still visible, or leave settled destination glyphs in the source
 * locale's case until the very last frame.
 */
function applyCase(text: string, textCase: TextCase, locale: string): string {
	switch (textCase) {
		case 'uppercase':
			return text.toLocaleUpperCase(locale);
		case 'lowercase':
			return text.toLocaleLowerCase(locale);
		case 'capitalize':
			return text.replace(
				/(^|\s)(\S)/gu,
				(_, lead: string, first: string) => lead + first.toLocaleUpperCase(locale)
			);
		default:
			return text;
	}
}

function graphemes(text: string, locale: string): string[] {
	if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
		const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' });
		return [...segmenter.segment(text)].map((part) => part.segment);
	}
	// Segmenter is unavailable: fall back to code points, still cluster-safer
	// than UTF-16 indexing (surrogate pairs stay intact; combining marks may not).
	return [...text];
}

function randomGlyph(pool: readonly string[]): string {
	return pool[(Math.random() * pool.length) | 0];
}

function clamp01(t: number): number {
	return t < 0 ? 0 : t > 1 ? 1 : t;
}

/**
 * For the metrics that travel alongside a run — the legend tracking — rather
 * than for the run itself, whose length and lock schedules are deliberately
 * linear. Tracking is the one property whose change is felt as the words moving
 * under the eye, so it gets most of the way across in the first third and
 * decelerates into place: 82% done at a third of the run, 94% at half.
 */
export function easeOutQuart(t: number): number {
	return 1 - (1 - clamp01(t)) ** 4;
}

export interface ScrambleOptions {
	/** The string on screen when the run starts. */
	from: string;
	/** The string it must settle on. */
	to: string;
	/** Destination locale — picks the glyph pool and the segmenter's rules. */
	locale: string;
	/** Computed `text-transform` for `from`'s locale, captured before the switch. */
	fromCase?: TextCase;
	/** Computed `text-transform` for `to`'s locale. */
	toCase?: TextCase;
	duration?: number;
	/** Reroll interval for unsettled characters: every frame reads as static noise, ~18fps as deliberate cycling. */
	tickMs?: number;
}

export interface ScrambleRun {
	readonly duration: number;
	/** The string to display `elapsed` ms in. Call with a non-decreasing `elapsed`. */
	frameAt(elapsed: number): string;
	/**
	 * 0 → 1 across the scramble window, the same linear ramp the length follows.
	 * Anything else that has to travel between the two locales' values — the
	 * legend tracking, which :lang(ja)/:lang(km) zeroes — rides this rather than
	 * a clock of its own, so the metrics move with the glyphs.
	 */
	progressAt(elapsed: number): number;
}

/**
 * Builds a run from `from` to `to`.
 *
 * Three schedules, deliberately separated:
 *
 * - **Length** is a straight linear ramp from `from`'s grapheme count to `to`'s
 *   across the whole run, and it is the sole authority on what renders:
 *   positions at or past the current visible length draw nothing. A string
 *   grows and shrinks at a constant rate in both directions.
 * - **Dissolve time** is when a position stops showing its real `from` glyph and
 *   starts cycling. It sweeps left to right across the front of the run, so the
 *   effect reads as string A coming apart and recomposing as string B rather
 *   than noise materializing with A simply gone — and, unlike a hold applied to
 *   every character at once, the first character is already moving on frame one.
 *   A switch answers the click immediately instead of sitting still first.
 * - **Lock time** decides only *which* glyph a visible position shows — its own
 *   real character or a reroll from the pool. It is staggered linearly across
 *   the run and jittered around that point so the characters read as settling
 *   independently rather than as one mechanical sweep. Because length is decided
 *   elsewhere, the jitter can never make the string's length wobble.
 */
export function createScrambleRun({
	from,
	to,
	locale,
	fromCase = 'none',
	toCase = 'none',
	duration = 1100,
	tickMs = 55
}: ScrambleOptions): ScrambleRun {
	const glyphs = graphemes(applyCase(to, toCase, locale), locale);
	const fromGlyphs = graphemes(applyCase(from, fromCase, locale), locale);
	const pool = (SCRAMBLE_POOLS[locale] ?? SCRAMBLE_POOLS.en).map((g) =>
		applyCase(g, toCase, locale)
	);

	const n = Math.max(glyphs.length, fromGlyphs.length);
	const scramblable = Array.from({ length: n }, (_, i) =>
		LETTER.test(glyphs[i] ?? fromGlyphs[i] ?? '')
	);

	const slot = duration / Math.max(1, n);

	/**
	 * How long the dissolve front takes to cross the whole string. Short next to
	 * the run: the point is that A comes apart, not that the reader waits out a
	 * transition before the decode starts.
	 */
	const dissolveWindow = duration * 0.35;
	const dissolveSlot = dissolveWindow / Math.max(1, n);

	const dissolveAt = Array.from({ length: n }, (_, i) => {
		const base = dissolveWindow * (i / n);
		return Math.max(0, base + (Math.random() - 0.5) * dissolveSlot);
	});

	// Linear, not eased: the stagger sets the rhythm, and the length ramp below
	// runs at a constant rate — an eased lock schedule would read as one against
	// the other. Floored past its own dissolve so no position settles on the
	// destination glyph before it has been seen to come apart.
	const lockAt = Array.from({ length: n }, (_, i) => {
		const base = duration * ((i + 1) / n);
		const jittered = base + (Math.random() - 0.5) * slot;
		return Math.min(duration, Math.max(dissolveAt[i] + dissolveSlot, jittered));
	});

	/** The run as 0 → 1. */
	function progressAt(elapsed: number): number {
		return clamp01(elapsed / duration);
	}

	/** Linear interpolation between the two grapheme counts. */
	function visibleLength(elapsed: number): number {
		return Math.round(
			fromGlyphs.length + (glyphs.length - fromGlyphs.length) * progressAt(elapsed)
		);
	}

	let current: string[] = Array.from({ length: n }, (_, i) =>
		i < fromGlyphs.length ? fromGlyphs[i] : ''
	);
	let lastTick = -Infinity;

	return {
		duration,
		progressAt,
		frameAt(elapsed: number): string {
			const visible = visibleLength(elapsed);
			const dueTick = elapsed - lastTick >= tickMs;
			if (dueTick) lastTick = elapsed;

			// A position that has only just come into view arrives empty; give it a
			// glyph on this frame rather than waiting for the next tick, or the
			// string grows in visible steps instead of at a constant rate.
			const reroll = (glyph: string) => (dueTick || glyph === '' ? randomGlyph(pool) : glyph);

			current = current.map((glyph, i) => {
				if (i >= visible) return '';
				// The dissolve comes first, punctuation included: a position that
				// exists in `from` shows its real glyph until the front reaches it,
				// rather than snapping to `to`'s character there on frame one.
				if (elapsed < dissolveAt[i] && fromGlyphs[i] !== undefined) return fromGlyphs[i];

				const settled = glyphs[i];
				// Past the end of `to`: this position is on its way out, and only the
				// length ramp decides when. Locking it to "" early would shorten the
				// string ahead of the ramp and break the constant rate.
				if (settled === undefined) return scramblable[i] ? reroll(glyph) : (fromGlyphs[i] ?? '');

				if (!scramblable[i] || elapsed >= lockAt[i]) return settled;
				return reroll(glyph);
			});

			return current.join('');
		}
	};
}

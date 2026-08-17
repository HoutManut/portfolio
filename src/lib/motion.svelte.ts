/**
 * Whether the visitor has asked for less motion, as reactive state.
 *
 * app.css carries a global prefers-reduced-motion rule, but it is CSS: it
 * collapses transition and animation durations and cannot reach a
 * requestAnimationFrame loop. The Canvas UI effects run on rAF and only make
 * their pointer easing instant under the same query — they keep rendering. So
 * anything canvas-driven has to consult this and decline to mount, which is what
 * Ground.svelte and the figure cells do.
 *
 * Module-level so every consumer shares one MediaQueryList rather than
 * registering a listener per instance.
 */
const QUERY = '(prefers-reduced-motion: reduce)';

export const motion = $state({
	/** Starts false so the server render and the first client frame agree. */
	reduced: false
});

let started = false;

/** Idempotent: safe to call from every component that cares. */
export function watchMotionPreference() {
	if (started || typeof window === 'undefined') return;
	started = true;
	const query = window.matchMedia(QUERY);
	motion.reduced = query.matches;
	query.addEventListener('change', () => (motion.reduced = query.matches));
}

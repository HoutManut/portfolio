/**
 * Makes `m.*()` reactive.
 *
 * Paraglide's message functions read the locale through `getLocale()`, a plain
 * closure over `window.location` with nothing in Svelte's dependency graph
 * behind it. A template that calls `m.foo()` therefore evaluates once and never
 * again: before this, only strings hand-wrapped in a `$derived` that touched a
 * reactive URL updated after a client-side locale switch, and every other one —
 * the entry counts, the CV's "Updated", every label in ProjectEntry and the
 * axis rail — stayed at whichever locale was current on first mount.
 *
 * Pointing `getLocale()` at a rune turns each of those calls into a reactive
 * read, so the effect that owns the expression re-runs on a switch. One
 * override reaches every message in the app.
 *
 * Client only, and that guard is load-bearing rather than defensive:
 * hooks.server.ts resolves a locale per request through `paraglideMiddleware`,
 * and a module-level override would hand every concurrent prerender whichever
 * locale wrote last.
 */
import { browser } from '$app/environment';

import { getLocale, overwriteGetLocale, type Locale } from '$lib/paraglide/runtime';

/**
 * Seeded from the untouched `getLocale()`, whose `url` strategy reads the same
 * pathname the server rendered from, so the first client value matches the
 * markup being hydrated.
 */
const state = $state({ current: browser ? getLocale() : ('en' as Locale) });

if (browser) overwriteGetLocale(() => state.current);

/** The active locale, as a reactive read. */
export function currentLocale(): Locale {
	return state.current;
}

/**
 * Call from the root layout as the URL changes. Also carries the locale onto
 * `<html lang>`, which is what drives the :lang(ja)/:lang(km) overrides of
 * --case-legend and --tracking-legend in app.css.
 */
export function setLocale(locale: Locale): void {
	if (state.current === locale) return;
	state.current = locale;
	if (browser) document.documentElement.lang = locale;
}

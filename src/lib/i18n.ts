import { localizeHref } from '$lib/paraglide/runtime';

/** Keeps an in-site link within the current locale (e.g. `/writing` → `/ja/writing`). */
export function localePath(path: string): string {
	return localizeHref(path);
}

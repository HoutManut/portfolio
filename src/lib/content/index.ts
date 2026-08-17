/**
 * Typed access to the committed bundles in src/lib/generated/.
 *
 * The bundles were validated against schema.ts at build time by
 * scripts/build-content.ts, so the casts here restore the types that the JSON
 * import erases rather than asserting anything unchecked. Nothing runs at
 * request time — every route that uses this is prerendered.
 *
 * Every collection carries entries from every locale that has a source file
 * (see slugAndLocaleOf in scripts/build-content.ts). The functions here pick
 * one locale's entry per slug and fall back to `en` when a translation
 * doesn't exist yet — so a route can always render, even for a slug that has
 * no content/*.{locale}.typ counterpart.
 */

import projectsBundle from '$lib/generated/projects.json';
import writingBundle from '$lib/generated/writing.json';
import cvBundle from '$lib/generated/cv.json';

import { getLocale } from '$lib/paraglide/runtime';
import type { Bundle, CvMeta, Entry, PostMeta, ProjectMeta } from './schema.ts';

export type {
	CvMeta,
	Entry,
	Heading,
	PostMeta,
	ProjectMeta,
	ProjectStatus,
	StackItem
} from './schema.ts';

const projects = projectsBundle as unknown as Bundle<ProjectMeta>;
const writing = writingBundle as unknown as Bundle<PostMeta>;
const cv = cvBundle as unknown as Bundle<CvMeta>;

const BASE_LOCALE = 'en';

/**
 * Every `en` entry, in bundle order (already sorted by compareProjects /
 * comparePosts), with the `locale`-tagged entry substituted in per slug when
 * one exists. Fallback never changes which items exist or their order — only
 * which language body renders.
 */
function withFallback<M extends { slug: string }>(
	entries: readonly Entry<M>[],
	locale: string
): Entry<M>[] {
	if (locale === BASE_LOCALE) return entries.filter((entry) => entry.locale === BASE_LOCALE);
	const bySlug = new Map(
		entries.filter((entry) => entry.locale === locale).map((entry) => [entry.meta.slug, entry])
	);
	return entries
		.filter((entry) => entry.locale === BASE_LOCALE)
		.map((entry) => bySlug.get(entry.meta.slug) ?? entry);
}

/** Every project, ordered (see `compareProjects`), localized with `en` fallback. */
export function allProjects(locale: string = getLocale()): Entry<ProjectMeta>[] {
	return withFallback(projects.entries, locale);
}

/** Published posts only, newest first, localized with `en` fallback. Drafts never make it into the bundle. */
export function allPosts(locale: string = getLocale()): Entry<PostMeta>[] {
	return withFallback(writing.entries, locale);
}

/** The CV, from the same source file as static/cv.pdf, localized with `en` fallback. */
export function cvEntry(locale: string = getLocale()): Entry<CvMeta> {
	return cv.entries.find((entry) => entry.locale === locale) ?? cv.entries[0];
}

export function postBySlug(
	slug: string,
	locale: string = getLocale()
): Entry<PostMeta> | undefined {
	return allPosts(locale).find((entry) => entry.meta.slug === slug);
}

/** Slugs for `entries()` in the dynamic post route, so prerendering never relies on link crawling. */
export function postSlugs(): string[] {
	return withFallback(writing.entries, BASE_LOCALE).map((entry) => entry.meta.slug);
}

/** True when any seed content is still unreplaced — used to show the build banner. */
export const hasPlaceholders: boolean =
	projects.entries.some((entry) => entry.meta.placeholder) ||
	writing.entries.some((entry) => entry.meta.placeholder) ||
	Boolean(cv.entries[0]?.meta.placeholder);

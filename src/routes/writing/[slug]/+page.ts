import { error } from '@sveltejs/kit';
import { postBySlug, postSlugs } from '$lib/content';
import { getLocale } from '$lib/paraglide/runtime';
import type { EntryGenerator, PageLoad } from './$types';

/**
 * Prerender every published post explicitly. Relying on the crawler would mean
 * an unlinked post silently disappearing from the build. Slugs are locale-
 * invariant (derived from the `en` set — see postSlugs in $lib/content), so
 * this list is the same for every locale variant of the route.
 */
export const entries: EntryGenerator = () => postSlugs().map((slug) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const post = postBySlug(params.slug, getLocale());
	if (!post) error(404, `No post named "${params.slug}"`);
	return { post };
};

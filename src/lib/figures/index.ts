/**
 * Project figures, by slug.
 *
 * Drop `graphify.png` (or .jpg / .webp / .avif) in this directory and the
 * matching project's specimen cell picks it up at build time — no frontmatter
 * field, no schema change, no content rebuild. Until a file exists the cell
 * renders its pending state, which is a designed state rather than a gap.
 *
 * Vite resolves and fingerprints these at build time; nothing runs at request
 * time.
 */
const files = import.meta.glob('./*.{png,jpg,jpeg,webp,avif}', {
	eager: true,
	query: '?url',
	import: 'default'
}) as Record<string, string>;

const bySlug: Record<string, string> = Object.fromEntries(
	Object.entries(files).map(([path, url]) => [path.replace(/^\.\/|\.[a-z]+$/g, ''), url])
);

export function figureFor(slug: string): string | undefined {
	return bySlug[slug];
}

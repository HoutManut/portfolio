/**
 * The typed boundary between Typst and the site.
 *
 * Frontmatter arrives as untyped JSON from `typst eval`, so this is the one
 * place where runtime validation earns its keep: scripts/build-content.ts
 * validates every entry here and refuses to write a bundle that would break a
 * route. Everything downstream consumes typed data.
 *
 * Hand-written on purpose — the scaffolding has no runtime dependencies.
 */

export type ProjectStatus = 'shipped' | 'archived' | 'wip';

/**
 * What the artifact *is*, as opposed to what it does. It sets the figure
 * caption on the index, which is the one per-project mark that is never gated
 * by the DETAIL axis — so it is the distinction that survives the fast skim.
 * A closed set on purpose: a seventh kind is a deliberate edit, not a typo.
 */
export type ProjectKind = 'cli' | 'library' | 'graph' | 'bot' | 'site' | 'service' | 'application';

/** One stack entry. `url` is optional — a plain name renders as text, not a link. */
export interface StackItem {
	name: string;
	url?: string;
}

export interface ProjectMeta {
	slug: string;
	title: string;
	year: number;
	summary: string;
	kind: ProjectKind;
	stack: StackItem[];
	live?: string;
	repo?: string;
	status: ProjectStatus;
	/** Manual sort key; lower first. Falls back to `year` descending. */
	order?: number;
	/** Seed content awaiting real material. Renders a visible badge. */
	placeholder?: boolean;
}

export interface PostMeta {
	slug: string;
	title: string;
	/** ISO `YYYY-MM-DD`. */
	date: string;
	summary: string;
	tags: string[];
	/** Drafts are dropped at build time and never reach the bundle. */
	draft?: boolean;
	placeholder?: boolean;
}

export interface CvMeta {
	title: string;
	name: string;
	email: string;
	/** ISO `YYYY-MM-DD`. */
	updated: string;
	placeholder?: boolean;
}

/**
 * A section mark: one `<h2>` from the compiled body and the id the build gave
 * it. Typst emits bare headings, so the anchors are generated in
 * scripts/build-content.ts and travel in the bundle rather than being parsed
 * out of the HTML at render.
 */
export interface Heading {
	id: string;
	text: string;
}

/** One compiled source file: validated frontmatter, its HTML body, its sections. */
export interface Entry<M> {
	meta: M;
	html: string;
	/** In document order. Drives the margin index on the read surfaces. */
	headings: Heading[];
	/**
	 * The locale this file was compiled from — `en` for `foo.typ`, `ja` for
	 * `foo.ja.typ`. Lets a bundle carry every locale's entries and have the
	 * reader (src/lib/content/index.ts) fall back to `en` per slug.
	 */
	locale: string;
}

/**
 * A generated bundle. `manifest` maps each contributing source path to a
 * sha256 of its bytes so `npm run prebuild` can detect stale output without
 * needing the Typst binary present.
 */
export interface Bundle<M> {
	typstVersion: string;
	manifest: Record<string, string>;
	entries: Entry<M>[];
}

export class ContentError extends Error {
	constructor(source: string, message: string) {
		super(`${source}: ${message}`);
		this.name = 'ContentError';
	}
}

/* -------------------------------------------------------------------------- */
/* field readers                                                              */
/* -------------------------------------------------------------------------- */

type Raw = Record<string, unknown>;

function asRecord(value: unknown, source: string): Raw {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new ContentError(source, 'frontmatter must be a dictionary');
	}
	return value as Raw;
}

/** Typst's `none` arrives as `null`; treat it as absent. */
function absent(value: unknown): boolean {
	return value === undefined || value === null;
}

function str(raw: Raw, key: string, source: string): string {
	const value = raw[key];
	if (typeof value !== 'string' || value.trim() === '') {
		throw new ContentError(source, `\`${key}\` must be a non-empty string`);
	}
	return value;
}

function optStr(raw: Raw, key: string, source: string): string | undefined {
	if (absent(raw[key])) return undefined;
	return str(raw, key, source);
}

function num(raw: Raw, key: string, source: string): number {
	const value = raw[key];
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new ContentError(source, `\`${key}\` must be a number`);
	}
	return value;
}

function optNum(raw: Raw, key: string, source: string): number | undefined {
	if (absent(raw[key])) return undefined;
	return num(raw, key, source);
}

function optBool(raw: Raw, key: string, source: string): boolean | undefined {
	const value = raw[key];
	if (absent(value)) return undefined;
	if (typeof value !== 'boolean') {
		throw new ContentError(source, `\`${key}\` must be true or false`);
	}
	return value;
}

function strArray(raw: Raw, key: string, source: string): string[] {
	const value = raw[key];
	if (absent(value)) return [];
	if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
		throw new ContentError(source, `\`${key}\` must be an array of strings`);
	}
	return value as string[];
}

/**
 * `stack` entries are either a bare string (`"Python"`) or a dict with an
 * optional source link (`(name: "Python", url: "https://...")`) — Typst
 * tuples can mix both forms freely.
 */
function stackArray(raw: Raw, key: string, source: string): StackItem[] {
	const value = raw[key];
	if (absent(value)) return [];
	if (!Array.isArray(value)) {
		throw new ContentError(source, `\`${key}\` must be an array`);
	}
	return value.map((item, i) => {
		if (typeof item === 'string') {
			if (item.trim() === '') {
				throw new ContentError(source, `\`${key}[${i}]\` must be a non-empty string`);
			}
			return { name: item };
		}
		const itemRaw = asRecord(item, source);
		const name = str(itemRaw, 'name', source);
		const itemUrl = url(itemRaw, 'url', source);
		return itemUrl === undefined ? { name } : { name, url: itemUrl };
	});
}

function oneOf<T extends string>(raw: Raw, key: string, allowed: readonly T[], source: string): T {
	const value = raw[key];
	if (typeof value !== 'string' || !allowed.includes(value as T)) {
		throw new ContentError(source, `\`${key}\` must be one of ${allowed.join(', ')}`);
	}
	return value as T;
}

function isoDate(raw: Raw, key: string, source: string): string {
	const value = str(raw, key, source);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
		throw new ContentError(source, `\`${key}\` must be an ISO date, e.g. 2026-08-16`);
	}
	return value;
}

function url(raw: Raw, key: string, source: string): string | undefined {
	const value = optStr(raw, key, source);
	if (value === undefined) return undefined;
	if (!/^https?:\/\//.test(value)) {
		throw new ContentError(source, `\`${key}\` must be an http(s) URL`);
	}
	return value;
}

/* -------------------------------------------------------------------------- */
/* parsers                                                                    */
/* -------------------------------------------------------------------------- */

const PROJECT_STATUSES = ['shipped', 'archived', 'wip'] as const;
const PROJECT_KINDS = ['cli', 'library', 'graph', 'bot', 'site', 'service', 'application'] as const;

export function parseProjectMeta(value: unknown, slug: string, source: string): ProjectMeta {
	const raw = asRecord(value, source);
	return {
		slug: optStr(raw, 'slug', source) ?? slug,
		title: str(raw, 'title', source),
		year: num(raw, 'year', source),
		summary: str(raw, 'summary', source),
		kind: oneOf(raw, 'kind', PROJECT_KINDS, source),
		stack: stackArray(raw, 'stack', source),
		live: url(raw, 'live', source),
		repo: url(raw, 'repo', source),
		status: oneOf(raw, 'status', PROJECT_STATUSES, source),
		order: optNum(raw, 'order', source),
		placeholder: optBool(raw, 'placeholder', source)
	};
}

export function parsePostMeta(value: unknown, slug: string, source: string): PostMeta {
	const raw = asRecord(value, source);
	return {
		slug: optStr(raw, 'slug', source) ?? slug,
		title: str(raw, 'title', source),
		date: isoDate(raw, 'date', source),
		summary: str(raw, 'summary', source),
		tags: strArray(raw, 'tags', source),
		draft: optBool(raw, 'draft', source),
		placeholder: optBool(raw, 'placeholder', source)
	};
}

export function parseCvMeta(value: unknown, source: string): CvMeta {
	const raw = asRecord(value, source);
	return {
		title: str(raw, 'title', source),
		name: str(raw, 'name', source),
		email: str(raw, 'email', source),
		updated: isoDate(raw, 'updated', source),
		placeholder: optBool(raw, 'placeholder', source)
	};
}

/* -------------------------------------------------------------------------- */
/* ordering                                                                   */
/* -------------------------------------------------------------------------- */

/** Explicit `order` wins; otherwise newest project first, title as tiebreak. */
export function compareProjects(a: ProjectMeta, b: ProjectMeta): number {
	if (a.order !== undefined || b.order !== undefined) {
		return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
	}
	if (a.year !== b.year) return b.year - a.year;
	return a.title.localeCompare(b.title);
}

/** Newest post first. */
export function comparePosts(a: PostMeta, b: PostMeta): number {
	if (a.date !== b.date) return a.date < b.date ? 1 : -1;
	return a.title.localeCompare(b.title);
}

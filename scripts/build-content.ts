/**
 * Compiles content/**\/*.typ into committed JSON bundles under
 * src/lib/generated/, and content/cv.typ into static/cv.pdf.
 *
 *   node scripts/build-content.ts           # compile (needs the typst binary)
 *   node scripts/build-content.ts --check   # staleness check only (no typst)
 *
 * The generated files are committed on purpose: `npm run build` must succeed on
 * a host that has never heard of Typst. The --check mode runs in `prebuild` and
 * compares source hashes against the manifest inside each bundle, so a forgotten
 * `npm run content` fails the build instead of shipping stale HTML.
 *
 * Run with plain `node` — Node 26 strips the types itself, no build step.
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
	compareProjects,
	comparePosts,
	ContentError,
	parseCvMeta,
	parsePostMeta,
	parseProjectMeta,
	type Bundle,
	type CvMeta,
	type Entry,
	type Heading,
	type PostMeta,
	type ProjectMeta
} from '../src/lib/content/schema.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');
const GENERATED = join(ROOT, 'src', 'lib', 'generated');
const STATIC = join(ROOT, 'static');

/**
 * Sentinel colour -> token class. Mirrors content/typst/theme.tmTheme.
 * Typst hardcodes token colours inline, which cannot follow a light/dark
 * theme, so the sentinels get swapped for classes that ride CSS variables.
 */
const TOKEN_CLASSES: Record<string, string> = {
	'#f00001': 'tok-keyword',
	'#f00002': 'tok-type',
	'#f00003': 'tok-function',
	'#f00004': 'tok-string',
	'#f00005': 'tok-comment',
	'#f00006': 'tok-constant',
	'#f00007': 'tok-variable',
	'#f00008': 'tok-punct',
	'#f00009': 'tok-tag'
};

/* -------------------------------------------------------------------------- */
/* typst                                                                      */
/* -------------------------------------------------------------------------- */

function pinnedTypstVersion(): string {
	const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
	const pinned = pkg?.contentTools?.typst;
	if (typeof pinned !== 'string') {
		throw new Error('package.json is missing `contentTools.typst` (the pinned Typst version)');
	}
	return pinned;
}

function assertTypstVersion(pinned: string): void {
	let reported: string;
	try {
		reported = execFileSync('typst', ['--version'], { encoding: 'utf8' });
	} catch {
		throw new Error(
			`typst not found on PATH. Install ${pinned} (https://github.com/typst/typst/releases), ` +
				'or skip content compilation — the committed bundles in src/lib/generated/ are enough to build the site.'
		);
	}
	const found = reported.match(/\d+\.\d+\.\d+/)?.[0];
	if (found !== pinned) {
		throw new Error(
			`typst ${found ?? reported.trim()} found, but this project pins ${pinned}. ` +
				'HTML export is an experimental Typst feature and its output changes between releases. ' +
				'Install the pinned version, or bump `contentTools.typst` in package.json and re-verify the output.'
		);
	}
}

/**
 * Every HTML compile emits the same "html export is under active development"
 * warning, so stderr is captured and only replayed when the command fails.
 */
function typst(args: string[]): string {
	try {
		return execFileSync('typst', args, {
			encoding: 'utf8',
			maxBuffer: 64 * 1024 * 1024,
			stdio: ['ignore', 'pipe', 'pipe']
		});
	} catch (error) {
		const stderr = (error as { stderr?: string }).stderr;
		throw new Error(`typst ${args[0]} failed\n\n${stderr?.trim() ?? String(error)}`, {
			cause: error
		});
	}
}

/** Reads the `<meta>` frontmatter without rendering the document. */
function readFrontmatter(file: string): unknown {
	const json = typst([
		'eval',
		'query(<meta>).map(it => it.value)',
		'--in',
		file,
		'--root',
		ROOT,
		'--format',
		'json'
	]);
	const values = JSON.parse(json);
	if (!Array.isArray(values) || values.length === 0) {
		throw new ContentError(rel(file), 'no `#meta(...)` frontmatter found');
	}
	if (values.length > 1) {
		throw new ContentError(rel(file), `expected one #meta(...) block, found ${values.length}`);
	}
	return values[0];
}

function compileHtml(file: string): string {
	const raw = typst([
		'compile',
		'--features',
		'html',
		'--format',
		'html',
		'--root',
		ROOT,
		file,
		'-'
	]);
	captureHeadStyle(raw);
	return raw;
}

/* -------------------------------------------------------------------------- */
/* html post-processing                                                       */
/* -------------------------------------------------------------------------- */

/** Keeps the body only — the page shell is SvelteKit's job. */
function extractBody(html: string, source: string): string {
	const start = html.indexOf('<body>');
	const end = html.lastIndexOf('</body>');
	if (start === -1 || end === -1) {
		throw new ContentError(source, 'typst produced no <body> — did the compile actually succeed?');
	}
	return html.slice(start + '<body>'.length, end).trim();
}

/**
 * Typst ships MathML alignment CSS in <head>, and only as much of it as the
 * document needs. Keep the largest block seen across all documents so the
 * generated stylesheet covers every post, and stay in sync with the pinned
 * Typst rather than hand-copying it.
 */
let mathCss = '';

function captureHeadStyle(html: string): void {
	const match = html.match(/<style>([\s\S]*?)<\/style>/);
	const style = match ? match[1].trim() : '';
	if (style.length > mathCss.length) mathCss = style;
}

function rewriteTokenColors(html: string, source: string): string {
	const rewritten = html.replace(
		/ style="color: (#[0-9a-f]{6})"/g,
		(whole: string, hex: string) => {
			const cls = TOKEN_CLASSES[hex];
			if (!cls) {
				throw new ContentError(
					source,
					`unmapped syntax colour ${hex}. Add it to TOKEN_CLASSES in scripts/build-content.ts ` +
						'and to content/typst/theme.tmTheme, or remove the scope from the theme.'
				);
			}
			return ` class="${cls}"`;
		}
	);
	if (rewritten.includes('style="color:')) {
		throw new ContentError(source, 'inline colours survived the rewrite — theming would break');
	}
	return rewritten;
}

function slugifyHeading(text: string): string {
	const slug = text
		.normalize('NFKD')
		// Decomposed accents, so "Über" anchors as "uber" rather than "u-ber".
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return slug === '' ? 'section' : slug;
}

/**
 * Gives every `<h2>` a stable id and collects the section marks alongside it.
 *
 * Typst emits bare `<h2>Text</h2>`, so a read surface has nothing to anchor a
 * margin index to. The ids are minted here rather than at render for the same
 * reason the rest of the HTML is: they land in the committed bundle, the
 * prerendered output is identical on every host, and renaming a heading shows up
 * as a reviewable diff instead of changing a link silently.
 */
function anchorHeadings(html: string): { html: string; headings: Heading[] } {
	const headings: Heading[] = [];
	const used = new Map<string, number>();

	const rewritten = html.replace(
		/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g,
		(whole: string, attrs: string | undefined, inner: string) => {
			// A heading may carry inline markup; the anchor text is the reading text.
			const text = inner
				.replace(/<[^>]+>/g, '')
				.replace(/\s+/g, ' ')
				.trim();

			const base = slugifyHeading(text);
			const seen = used.get(base) ?? 0;
			used.set(base, seen + 1);
			const id = seen === 0 ? base : `${base}-${seen + 1}`;

			headings.push({ id, text });
			return `<h2 id="${id}"${attrs ?? ''}>${inner}</h2>`;
		}
	);

	return { html: rewritten, headings };
}

/* -------------------------------------------------------------------------- */
/* manifest                                                                   */
/* -------------------------------------------------------------------------- */

function rel(file: string): string {
	return relative(ROOT, file).split('\\').join('/');
}

function sha256(file: string): string {
	return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function typstFiles(dir: string): string[] {
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((name) => name.endsWith('.typ'))
		.sort()
		.map((name) => join(dir, name));
}

/**
 * Shared sources every bundle depends on — a change here invalidates all
 * output. The pinned Typst version is tracked separately as `typstVersion`;
 * package.json itself is deliberately not hashed, or every dependency bump
 * would report the content as stale.
 */
function sharedSources(): string[] {
	return [...typstFiles(join(CONTENT, 'typst')), join(CONTENT, 'typst', 'theme.tmTheme')].filter(
		existsSync
	);
}

function manifestFor(files: string[]): Record<string, string> {
	const manifest: Record<string, string> = {};
	for (const file of [...sharedSources(), ...files].sort()) {
		manifest[rel(file)] = sha256(file);
	}
	return manifest;
}

/* -------------------------------------------------------------------------- */
/* collections                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Kept in sync by hand with `locales` in project.inlang/settings.json — this
 * script runs standalone via `node scripts/build-content.ts`, before Vite (and
 * so before the Paraglide plugin) has generated src/lib/paraglide, so it
 * cannot import the locale list from there without a chicken-and-egg ordering
 * problem against `prebuild`.
 */
const CONTENT_LOCALES = ['ja', 'km'];

/**
 * `foo.typ` is the `en` (base) source. `foo.ja.typ` is the `ja` translation of
 * the same slug — a sibling file, not a different entry, so the fallback in
 * src/lib/content/index.ts can find it by (slug, locale).
 */
function slugAndLocaleOf(file: string): { slug: string; locale: string } {
	const base = file
		.split('/')
		.pop()!
		.replace(/\.typ$/, '');
	const dot = base.lastIndexOf('.');
	if (dot !== -1) {
		const suffix = base.slice(dot + 1);
		if (CONTENT_LOCALES.includes(suffix)) {
			return { slug: base.slice(0, dot), locale: suffix };
		}
	}
	return { slug: base, locale: 'en' };
}

function writeBundle<M>(name: string, bundle: Bundle<M>): void {
	mkdirSync(GENERATED, { recursive: true });
	writeFileSync(join(GENERATED, `${name}.json`), JSON.stringify(bundle, null, '\t') + '\n');
}

function buildProjects(typstVersion: string): number {
	const files = typstFiles(join(CONTENT, 'projects'));
	const entries: Entry<ProjectMeta>[] = files.map((file) => {
		const source = rel(file);
		const { slug, locale } = slugAndLocaleOf(file);
		const meta = parseProjectMeta(readFrontmatter(file), slug, source);
		const html = rewriteTokenColors(extractBody(compileHtml(file), source), source);
		/*
		 * Not anchored, and the marks stay empty. Every project body renders into
		 * the same document on the index, so per-file ids would collide the moment
		 * two projects both had a "How it works" — and an id minted from a heading
		 * could collide with a project slug, which the index already uses as its
		 * expansion hash. A project body is one screen; it has no margin index.
		 */
		return { meta, html, headings: [], locale };
	});
	entries.sort((a, b) => compareProjects(a.meta, b.meta));
	writeBundle<ProjectMeta>('projects', { typstVersion, manifest: manifestFor(files), entries });
	return entries.length;
}

function buildWriting(typstVersion: string): { published: number; drafts: number } {
	const files = typstFiles(join(CONTENT, 'writing'));
	const all: Entry<PostMeta>[] = files.map((file) => {
		const source = rel(file);
		const { slug, locale } = slugAndLocaleOf(file);
		const meta = parsePostMeta(readFrontmatter(file), slug, source);
		const body = rewriteTokenColors(extractBody(compileHtml(file), source), source);
		const { html, headings } = anchorHeadings(body);
		return { meta, html, headings, locale };
	});

	// Drafts never reach the bundle: the build is the publish step.
	const entries = all.filter((entry) => !entry.meta.draft);
	entries.sort((a, b) => comparePosts(a.meta, b.meta));

	// The manifest still covers drafts, so un-drafting one is detected as stale.
	writeBundle<PostMeta>('writing', { typstVersion, manifest: manifestFor(files), entries });
	return { published: entries.length, drafts: all.length - entries.length };
}

function buildCv(typstVersion: string): void {
	const file = join(CONTENT, 'cv.typ');
	const source = rel(file);
	if (!existsSync(file)) throw new Error('content/cv.typ is missing');

	const raw = compileHtml(file);
	const meta: CvMeta = parseCvMeta(readFrontmatter(file), source);
	const { html, headings } = anchorHeadings(rewriteTokenColors(extractBody(raw, source), source));
	writeBundle<CvMeta>('cv', {
		typstVersion,
		manifest: manifestFor([file]),
		entries: [{ meta, html, headings, locale: 'en' }]
	});

	// Same source, paged target — this is the whole point of the pipeline.
	mkdirSync(STATIC, { recursive: true });
	typst(['compile', '--root', ROOT, file, join(STATIC, 'cv.pdf')]);
}

function writeMathCss(typstVersion: string): void {
	// Reachable before any bundle is written on a clean checkout with no content.
	mkdirSync(GENERATED, { recursive: true });
	writeFileSync(
		join(GENERATED, 'typst-math.css'),
		`/* Generated by scripts/build-content.ts from Typst ${typstVersion}. Do not edit. */\n` +
			`${mathCss}\n`
	);
}

/* -------------------------------------------------------------------------- */
/* modes                                                                      */
/* -------------------------------------------------------------------------- */

function check(): void {
	if (!existsSync(CONTENT)) {
		console.log('content/ not present — skipping the staleness check.');
		return;
	}
	const bundles = ['projects', 'writing', 'cv'];
	const pinned = pinnedTypstVersion();
	const stale: string[] = [];

	for (const name of bundles) {
		const path = join(GENERATED, `${name}.json`);
		if (!existsSync(path)) {
			stale.push(`src/lib/generated/${name}.json is missing`);
			continue;
		}
		const bundle: Bundle<unknown> = JSON.parse(readFileSync(path, 'utf8'));
		if (bundle.typstVersion !== pinned) {
			stale.push(`${name}.json was built with Typst ${bundle.typstVersion}, pin is ${pinned}`);
		}
		for (const [file, hash] of Object.entries(bundle.manifest ?? {})) {
			const abs = join(ROOT, file);
			if (!existsSync(abs)) stale.push(`${file} was deleted (${name}.json)`);
			else if (sha256(abs) !== hash) stale.push(`${file} changed (${name}.json)`);
		}
	}

	// A brand-new source file appears in no manifest at all.
	const known = new Set<string>();
	for (const name of bundles) {
		const path = join(GENERATED, `${name}.json`);
		if (!existsSync(path)) continue;
		const bundle: Bundle<unknown> = JSON.parse(readFileSync(path, 'utf8'));
		for (const file of Object.keys(bundle.manifest ?? {})) known.add(file);
	}
	for (const file of [
		...typstFiles(join(CONTENT, 'projects')),
		...typstFiles(join(CONTENT, 'writing'))
	]) {
		if (!known.has(rel(file))) stale.push(`${rel(file)} is new`);
	}

	if (stale.length > 0) {
		console.error('Generated content is out of date:');
		for (const line of stale) console.error(`  - ${line}`);
		console.error('\nRun `npm run content` and commit the result.');
		process.exit(1);
	}
	console.log('Generated content is up to date.');
}

function build(): void {
	const pinned = pinnedTypstVersion();
	assertTypstVersion(pinned);

	const projects = buildProjects(pinned);
	const writing = buildWriting(pinned);
	buildCv(pinned);
	writeMathCss(pinned);

	console.log(
		`Compiled ${projects} project(s), ${writing.published} post(s)` +
			`${writing.drafts > 0 ? ` (${writing.drafts} draft skipped)` : ''}, and the CV (HTML + PDF).`
	);
}

try {
	if (process.argv.includes('--check')) check();
	else build();
} catch (error) {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
}

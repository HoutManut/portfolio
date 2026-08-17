# portfolio

Personal site — SvelteKit + TypeScript, fully prerendered, content authored in
[Typst](https://typst.app).

Product truth lives in [PRODUCT.md](PRODUCT.md); the visual world lives in
[DESIGN.md](DESIGN.md).

## Commands

| Command                 | Does                                                                              |
| ----------------------- | --------------------------------------------------------------------------------- |
| `npm run dev`           | Dev server                                                                        |
| `npm run content`       | Compile `content/**/*.typ` → `src/lib/generated/` + `static/cv.pdf` (needs Typst) |
| `npm run content:check` | Verify the committed output matches the sources (no Typst needed)                 |
| `npm run build`         | Static build into `build/` (runs the check first)                                 |
| `npm run check`         | `svelte-check`                                                                    |
| `npm run lint`          | Prettier + ESLint                                                                 |

## How content works

Every essay, every project, and the CV is a `.typ` file under `content/`.
`npm run content` compiles each one twice-over — frontmatter via `typst eval`,
body via Typst's HTML export — validates the frontmatter against
[`src/lib/content/schema.ts`](src/lib/content/schema.ts), and writes JSON
bundles to `src/lib/generated/`.

**Those bundles are committed** — `src/lib/generated/` and `static/cv.pdf` must be
tracked in git, not ignored, or a deploy has no content to build from.
`npm run build` never invokes Typst, so the site
builds on any host — no binary to install in CI, and content changes show up as
reviewable diffs. `prebuild` compares sha256 hashes of the sources against the
manifest inside each bundle, so a forgotten `npm run content` fails the build
instead of shipping stale HTML.

### Writing a post

```typst
#import "../typst/lib.typ": doc, meta
#show: doc

#meta((
  title: "…",
  date: "2026-08-16",      // ISO, validated
  summary: "…",
  tags: ("typst",),
  draft: false,
))

Body starts here. `= Heading` becomes an `<h2>`.
```

The filename is the slug. Run `npm run content` and commit the result.

Projects are the same shape under `content/projects/` with
`year` / `kind` / `stack` / `status` / `live` / `repo`. `kind` is one of
`cli` / `library` / `graph` / `bot` / `site` / `service` and sets the figure
caption on the index, which is the mark that tells rows apart at a glance — see
[`schema.ts`](src/lib/content/schema.ts) for the exact fields; the build fails
loudly on a bad one.

### The CV

`content/cv.typ` compiles to **both** `static/cv.pdf` and the `/cv` page. That is
the point of the pipeline: the downloaded PDF and the page a visitor reads cannot
drift apart. `content/typst/paged.typ` holds the print-only rules.

### Typst caveats worth knowing

- **HTML export is experimental.** It needs `--features html` and its output
  changes between releases, so the version is pinned in `package.json`
  (`contentTools.typst`). The build refuses to run against a different one.
  Bumping it means re-checking the output.
- **Layout content is dropped on the HTML target.** A `rect`, a diagram, anything
  laid out simply vanishes unless wrapped: `#frame(rect(...))` (from `lib.typ`)
  emits inline SVG on the web and draws normally in the PDF.
- **`h(1fr)` has no HTML meaning.** Use `#spread[left][right]` instead.
- **Math is fine** — it exports as native MathML, and Typst's own alignment CSS is
  regenerated into `src/lib/generated/typst-math.css` on every content build.
- **Syntax colours are rewritten.** Typst hardcodes them inline, which cannot
  follow a colour scheme. `content/typst/theme.tmTheme` paints each scope with a
  sentinel hex and the build swaps those for `.tok-*` classes. Adding a scope to
  the theme means adding its sentinel to `TOKEN_CLASSES` in
  `scripts/build-content.ts` — the build fails on an unmapped colour.

## Structure

```
content/          authored .typ sources (+ typst/ shared rules)
scripts/          build-content.ts — the only thing that runs Typst
src/lib/content/  schema.ts (types + validators), index.ts (typed accessors)
src/lib/generated/  committed build output — do not edit by hand
src/lib/figures/  project screenshots, picked up by slug (see above)
src/routes/       / (work, inline expand) · /writing · /writing/[slug] · /cv
static/fonts/     the Recursive variable subsets the design runs on
```

Projects expand in place on the index rather than getting their own routes; the
open one is tracked in the URL hash so a single project can still be linked.

## Replacement list

Everything below is seed content. While any of it remains, the site shows a
banner saying so (`hasPlaceholders` in `src/lib/content/index.ts`).

- [ ] `content/projects/graphify.typ` — real body, real `live` / `repo` URLs
- [ ] `content/projects/second-project.typ` — replace entirely
- [ ] `content/projects/third-project.typ` — replace entirely
- [ ] `content/writing/authoring-in-typst.typ` — rewrite in your own voice or delete
- [ ] `content/writing/draft-example.typ` — fixture proving drafts are excluded; delete when done with it
- [ ] `content/cv.typ` — **every role, date, and school is invented structure**
- [ ] `src/lib/site.ts` — tagline and profile URLs
- [ ] `static/robots.txt`, favicon
- [ ] `src/lib/figures/` — one screenshot per project, named for the slug
      (`graphify.png`). Until a file exists the project's specimen cell renders
      its `FIG. PENDING` state. No schema change and no content rebuild needed —
      drop the file in and it appears.

No employer names, metrics, testimonials, or client logos were invented — those
blanks are left empty on purpose and must be filled with real material.

## The design

`src/app.css` is the visual world, not a placeholder. It is documented in
[DESIGN.md](DESIGN.md); the direction contract it was built against is an HTML
comment at the top of `<body>` in [`src/app.html`](src/app.html) and ships in the
built pages.

Two things there are load-bearing and easy to break:

- **`--detail`, `--mono` and `--casl` are registered custom properties**
  (`@property`). Registration is what lets the preset buttons interpolate
  instead of snapping. Reading them from a plain `var()` fallback silently
  disables the whole axis system.
- **The typeface carries the design.** `static/fonts/` holds the two latin
  subsets of [Recursive](https://recursive.design) (OFL, licence alongside).
  Every axis the site drives — `MONO`, `CASL`, `wght`, `slnt`, `CRSV` — lives in
  those files; the `wght`-only builds will not work.

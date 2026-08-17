# Writing in content/

Every file here compiles to **two** targets: HTML (the site) and PDF (via
`paged.typ`, currently only `cv.typ`). Anything you write is read by both a
browser and a PDF viewer. Most content should render fine in both — this file
is about the content that shouldn't.

## Block content to one target

Use `only-html` / `only-pdf` from `typst/lib.typ` whenever something makes
sense on one target but not the other:

```typst
#import "typst/lib.typ": doc, meta, only-html, only-pdf

#only-html[
  See the #link("/")[work index] for the full list with live links.
]

#only-pdf[
  = Hout Manut
  #link("mailto:huotmanut00@gmail.com")
]
```

**Rule of thumb: site-relative navigation belongs in `only-html`.** A link like
`#link("/")[...]` or `#link("/writing")[...]` resolves fine in a browser
because it's on the same origin. In a PDF it's just a broken relative path —
the reader has no site to navigate to, and most PDF viewers won't even make it
clickable. Anything that assumes "you're currently on this website" (nav links,
"see the other projects above", hash-based project links) should be
`only-html`.

The inverse also applies: PDF-only furniture — a title block, a mailto link
for a recruiter, print-specific contact info — should be `only-pdf`, since the
web page already gets its `<h1>` and header from the Svelte layout.

**Known instance to fix:** `content/cv.typ:38` — `See the #link("/")[work
index]` is currently *not* wrapped in `only-html`, so it ships into
`static/cv.pdf` as a dead link. Wrap it before that file leaves placeholder
status.

## Other target-split primitives (from `typst/lib.typ`)

- `#frame(...)` — wraps laid-out content (rects, diagrams) so it survives HTML
  export as inline SVG. Without it, layout content is silently dropped on the
  web target.
- `#spread[left][right]` — target-aware `h(1fr)`; use instead of `h(1fr)`
  directly, which has no HTML meaning and silently collapses.

## Things that look like site-wide rules but are per-file

- External links (`mailto:`, `https://...`) are fine unwrapped — they resolve
  the same on both targets.
- `draft: true` in frontmatter excludes a `writing/` post from the build
  entirely (no route, no PDF concern). Doesn't apply to `cv.typ` or
  `projects/`.

## Writing project pages (`content/projects/*.typ`)

Projects have no dedicated route. `ProjectEntry.svelte` expands the body
in place on `/` inside a `<details>` — no scroll cap, `block-size: auto`, no
"read more" truncation. That has two consequences for how you write:

- **Whatever length you write, the homepage renders in full.** A long project
  body makes the homepage itself long once opened — there's no separate page
  to escape to. Keep it to what a hiring reader will actually read inline: a
  few short paragraphs, not an essay. If it's getting essay-length, that's a
  sign it belongs in `content/writing/` instead, with the project entry linking
  out via `live/repo`.
- **`meta.summary` is shown collapsed, before any click.** It's clamped to
  ~4 lines at mobile width (`.line` in `ProjectEntry.svelte`, `max-height:
  9rem`) — text past that is clipped by `overflow: hidden`, not scrollable.
  Write it as 1–2 sentences that stand alone.
- **Body text sets at 68ch (`--measure`)**, same column width as a
  `/writing/[slug]` post and the CV — regardless of viewport, so don't write
  expecting a wide canvas.

General flow, following the existing pattern (`projects/graphify.typ`):

1. Opening paragraph, no heading — what the thing is and the problem it
   answers. This is the part most likely to actually get read.
2. `= How it works` — the mechanism, one level of "how", not full
   implementation detail.
3. A closing section on what it's good for / what it enables — optional,
   skip if the opening paragraph already said it.

Don't invent a `= Overview` heading before the opening paragraph — the title
and figure already do that job in the collapsed row; a heading immediately
inside the open body is redundant with what's already on screen.

---

Uncertain whether something is nav-shaped (→ `only-html`) or content-shaped
(→ both targets, unwrapped)? Ask rather than guessing — it's a one-line
decision but wrong in either direction ships either a dead PDF link or a
missing web feature.

---
name: Marut — Portfolio
description: A type specimen of the typesetting system that prints it; the work is the showing.
colors:
  field: '#1C22C8'
  paper: '#F1EFE6'
  acid: '#D6F03A'
  ink: '#12131A'
  muted: '#A6ACEE'
  rule: '#5A5FD8'
  rule-strong: '#7B80E4'
  tok-keyword: '#7A1FA2'
  tok-type: '#0B4F9E'
  tok-function: '#5B21B6'
  tok-string: '#0A6140'
  tok-comment: '#565B64'
  tok-constant: '#0B4F9E'
  tok-variable: '#8A3A06'
  tok-punct: '#4D525C'
  tok-tag: '#0A6140'
typography:
  display:
    fontFamily: 'Recursive, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'calc(clamp(1.5rem, 4.6vw, 4.1rem) * (0.85 + var(--d) * 0.25))'
    fontVariation: "'MONO' var(--mono), 'CASL' var(--casl), 'wght' calc(480 + var(--d) * 220)"
    lineHeight: 0.98
    letterSpacing: '-0.035em'
  headline:
    fontFamily: 'Recursive, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(1.9rem, 4vw + 0.6rem, 3.25rem)'
    fontVariation: "'MONO' var(--mono), 'CASL' var(--casl), 'wght' 620"
    lineHeight: 1.08
    letterSpacing: '-0.035em'
  title:
    fontFamily: 'Recursive, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.375rem'
    fontVariation: "'MONO' var(--mono), 'CASL' var(--casl), 'wght' 700"
    lineHeight: 1.08
    letterSpacing: '-0.015em'
  body:
    fontFamily: 'Recursive, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.0625rem'
    fontVariation: "'MONO' var(--mono), 'CASL' var(--casl)"
    lineHeight: 1.5
    letterSpacing: 'normal'
  label:
    fontFamily: 'Recursive, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.6875rem'
    fontVariation: "'MONO' 1, 'CASL' 0, 'wght' 500"
    lineHeight: 1.4
    letterSpacing: '0.14em'
  numeral:
    fontFamily: 'Recursive, ui-sans-serif, system-ui, sans-serif'
    fontVariation: "'MONO' 1, 'CASL' 0, 'wght' 500"
    fontFeature: 'tabular-nums'
  address:
    fontFamily: 'Recursive, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(1rem, 3.2vw, 3rem)'
    fontVariation: "'MONO' 1, 'CASL' var(--casl), 'wght' 500"
    lineHeight: 1
    letterSpacing: '-0.03em'
spacing:
  space-1: '0.25rem'
  space-2: '0.5rem'
  space-3: '1rem'
  space-4: '1.5rem'
  space-5: '2.5rem'
  space-6: '4rem'
  space-7: '6rem'
components:
  plate:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    padding: 'clamp(1.5rem, 4vw, 3.25rem)'
    width: 'calc(68ch + 2 * clamp(1.5rem, 4vw, 3.25rem))'
  action-link:
    textColor: '{colors.paper}'
    typography: '{typography.label}'
    padding: '{spacing.space-2} {spacing.space-3}'
  action-link-hover:
    backgroundColor: '{colors.acid}'
    textColor: '{colors.ink}'
  preset-button:
    textColor: '{colors.paper}'
    typography: '{typography.label}'
    padding: '{spacing.space-2} {spacing.space-3}'
  preset-button-hover:
    textColor: '{colors.acid}'
  preset-button-active:
    backgroundColor: '{colors.acid}'
    textColor: '{colors.ink}'
  figure-cell:
    size: 'calc(4.5rem + var(--d) * 7.5rem)'
  figure-caption:
    typography: '{typography.label}'
    textColor: '{colors.muted}'
    gap: '{spacing.space-2}'
  figure-caption-kind:
    textColor: '{colors.paper}'
  seed-badge:
    textColor: '{colors.acid}'
    padding: '0.15em 0.4em'
  proof-band:
    backgroundColor: '{colors.acid}'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    padding: '{spacing.space-2} clamp(1.25rem, 4vw, 3.5rem)'
  view-strip-item:
    textColor: '{colors.paper}'
    typography: '{typography.label}'
  view-strip-item-active:
    textColor: '{colors.acid}'
---

# Design System: Marut — Portfolio

## Overview

**Creative North Star: "The Specimen Sheet"**

The site is a type specimen of the typesetting system that prints it, and the work is what is
being shown. A specimen sheet drenches its ground in one colour, sets the showing at display
scale, and captions it in tiny tracked legends; where it needs you to actually read, it lays a
warm paper plate over the field and sets the text there. Every page here is built out of that
one metaphor: the ultramarine field, the paper plate, the hairline rule, the legend, the
figure cell, and a control rail of live axes. Nothing is a card and nothing is a component
library dressed as an interface.

The world is loud but not decorative. There is exactly one saturated colour, exactly one
accent, and exactly one typeface — Recursive, self-hosted, doing display, prose, UI legends
and code from one file. The density is high and the geometry is hard: 1px rules, square
corners, no shadows, no gradients, no tinted panels. What moves is not chrome; it is the
document itself, remapped continuously by three registered custom properties that the visitor
can drive. That interaction is the specimen's own instrument doing the product's work — a
fast-skim / deep-read dial — not a font demo bolted onto a portfolio.

Two commitments constrain anything added later. First, the work outranks the apparatus: the
largest type on any page is a project or essay title, never the wordmark, never a section head,
never the contact address. That is an invariant the build holds at every viewport width and
every axis instance, and it is enforced by arithmetic rather than by eye — see the vw floor in
Typography. Second, the site is one rendition — `color-scheme: dark`, one
palette, no light/dark branch — because the reading surface is already warm paper and a second
theme would only be a second version of the same idea. The visual direction was chosen
code-led with no comp round; `src/app.html` carries the direction contract at the top of
`<body>` and `src/app.css` opens with the same statement.

**Key Characteristics:**

- One drenched ultramarine field (`#1C22C8`) edge to edge; every reading field is a warm paper plate laid on it.
- One variable family (Recursive) from 11px tracked mono legends to project titles above 70px.
- Three live font/layout axes — DETAIL, MONO, CASL — registered via `@property` so presets interpolate.
- Ruled, never boxed: hairline 1px rules, zero shadows, zero border-radius.
- Acid chartreuse (`#D6F03A`) reserved for live values, active state, focus and selection.
- Progressive enhancement is structural: with JavaScript off the document renders at its default axis instance and the rail is simply absent.
- The field is not flat paint: it is a fixed Asciify layer that scatters faint characters over the ultramarine and gathers them into a patch under the cursor, and every figure cell runs through a halftone screen. Both are decoration, both are `aria-hidden`, and both vanish under reduced motion or without JavaScript.

## Colors

A single saturated ground, a single acid accent, a warm paper for reading, and a small ladder
of blue-violets for rules and secondary text — the palette of a printed specimen sheet, not of
a UI kit.

### Primary

- **Ultramarine Field** (`{colors.field}`): the ground of the entire site. `html` carries it —
  and only `html`, since a background on `body` would sit in front of the ground layer and hide
  it (see The stacking context). An `html` background propagates to the canvas, so overscroll
  still never reveals another colour, and the scrollbar is themed to it. Nothing else is ever a
  page background. Paper text on it measures 8.63:1.

### Secondary

- **Acid Chartreuse** (`{colors.acid}`): the live-value colour. It marks the DETAIL readout,
  the slider thumbs, the active named instance, the current view underline, the hovered work
  title, the seed badge, the focus ring, `::selection` on the field, and the proof band. It is
  also `accent-color` for form controls. 7.76:1 on the field; ink on acid is 14.45:1.

### Tertiary

- **Syntax set** (nine `.tok-*` classes, seven distinct hexes): keyword, type, function,
  string, comment, constant, variable, punct, tag. `tok-constant` deliberately mirrors
  `tok-type` and `tok-tag` mirrors `tok-string` — the class list is wider than the palette so
  the highlighter can grow without a new colour. All are tuned against the code-block ground
  (`#E4E3E4`, the field at 6% over paper), not against the field. The lowest is
  `tok-comment` at 5.33:1, deliberately darker than a comment usually wants because the
  lighter grey failed AA.

### Neutral

- **Warm Paper** (`{colors.paper}`): body text on the field, and the background of every
  `.plate`. This is the reading surface.
- **Deep Ink** (`{colors.ink}`): text on paper (16.08:1) and on acid. Never used on the field.
- **Muted Periwinkle** (`{colors.muted}`): secondary text on the field — legends, row
  summaries, years, tick marks, the colophon, the disclosure mark. 4.62:1, so it is legal for
  body-size text but is not a heading colour. It is also the **slider track**, for the reason
  below.
- **Rule** (`{colors.rule}`): the hairline, and only the hairline. Every row divider, cell
  border and outline-action border. 1.92:1 against the field, which is correct for a decorative
  separator and wrong for anything a user has to perceive to operate a control.
- **Rule Strong** (`{colors.rule-strong}`): the hover/emphasis rule, the default link underline
  colour on the field, and the scrollbar thumb.

Two derived neutrals recur inside the plate and are computed, not tokenised:
`color-mix(in srgb, var(--ink) 62%, transparent)` for figcaptions and dropped CV dates
(4.9:1 on paper), and `color-mix(in srgb, var(--ink) 15%, transparent)` for table rules.

### Named Rules

**The One Field Rule.** Everything that is not a `.plate` sits directly on the ultramarine
field. There is no second surface colour, no tinted panel, no elevated container. If a new
component seems to need a background, it either becomes a plate or it stays on the field with
a rule around it.

**The Live-Value Rule.** Acid is for what is live, active, or receiving focus — never for
decoration, never for a large area except the proof band, which is a printer's stamp and is
meant to be unmissable. Two acid regions visible at once on one screen is the ceiling, and
the axis rail's live readout and its active preset count as one: they are a single instrument
reading out a single value in a single strip, and splitting them would make the ceiling
unreachable on any screen showing the colophon. On a short read surface the steady state is
therefore two — the rail, and the current section mark in the margin. The proof band and the
`SEED` badges sit above that count while they exist; they retire with the placeholder content
and were never meant to be permanent.

**The Code-Never-On-Field Rule.** Code and long prose never sit on the field. The syntax
palette is calibrated for the paper plate and is illegible against ultramarine; a code sample
outside a plate is a defect, not a variant.

**The Divider-Is-Not-A-Boundary Rule.** `--rule` (1.92:1) is a divider: it separates things a
reader is looking at. It is never the visible boundary of a control. A track, an unfilled
progress bar, a checkbox edge, an input border — anything whose shape or extent the user must
perceive in order to operate it — is non-text UI under WCAG 1.4.11 and needs 3:1, so it uses
`--muted` (4.62:1) or acid. This is the distinction the axis slider's track was corrected on,
and it is the easiest one in this system to get wrong, because both colours look like the same
hairline in a comp.

## Typography

**Display Font:** Recursive Variable (with `ui-sans-serif, system-ui, sans-serif`)
**Body Font:** Recursive Variable — the same file
**Label/Mono Font:** Recursive Variable at `'MONO' 1` — the same file

**Character:** One self-hosted variable family does every job on the site. Recursive's own
design axes are the system's expressive range: `MONO` 0–1 (proportional → monospace), `CASL`
0–1 (linear → casual), `wght` 300–1000, `slnt` −15–0, `CRSV` 0–1. Only the latin and latin-ext
subsets are vendored (`static/fonts/`, OFL licence alongside); both `@font-face` blocks declare
`font-weight: 300 1000` and `font-style: oblique 0deg 15deg` so the whole variable space is
addressable. The result reads as engineering-grade rather than literary: geometric, tight, with
tracked monospace apparatus around warm proportional prose.

### The three live axes

Three custom properties are registered with `@property` on `:root` and inherit through the
whole document:

| Property   | Range  | Initial | Drives                                                                              |
| ---------- | ------ | ------- | ----------------------------------------------------------------------------------- |
| `--detail` | 0–1000 | 650     | Row density, figure-cell size, title size and weight, the continuous caption reveal |
| `--mono`   | 0–1    | 0.2     | Recursive's `MONO` axis on prose and display type                                   |
| `--casl`   | 0–1    | 0       | Recursive's `CASL` axis on prose and display type                                   |

Registration is the load-bearing part: an unregistered custom property is an opaque string to
the animation engine and would snap on every preset press. Two values are derived once on
`:root` and read everywhere — `--d` (the 0–1 form of `--detail`) and the two reveal ramps
`--show-summary` and `--show-facts`, which are `clamp()` expressions, not branches.

Named instances are **SKIM 0 / REVIEW 650 / FULL 1000**. 650 is the default because it is the
instance at which every row's summary _and_ its status/stack lines are fully open; the
information the audience scans for must not depend on finding a slider.

### Hierarchy

Sizes below are the CSS; measured values are given for the default REVIEW instance at a
1440px viewport.

- **Display** (`wght` 480→700 with the axis, `calc(clamp(1.5rem, 4.6vw, 4.1rem) * (0.85 + var(--d) * 0.25))`, line-height 0.98–1): **one band governs both work and writing titles** — the work index and the writing index set the identical expression, because an essay is work too and must rank the same. 66.4px at REVIEW, 72.16px at FULL, 55.8px at SKIM.
- **Headline** (`wght` 620–660, `clamp(1.9rem, 4vw + 0.6rem, 3.25rem)` for posts, `clamp(2rem, 5vw + 0.5rem, 3.75rem)` for the CV, line-height 0.95–1.08): the page `h1` on a read surface. Axis-independent.
- **Title** (`wght` 700, 1.375rem, line-height 1.08): in-content headings. Typst emits document headings as `h2`, so `.prose h2` is the real in-content heading size; `.prose h3` drops to body size at `wght` 700.
- **Body** (1.0625rem / 17px, line-height 1.5, measure 68ch): prose inside a plate, and row summaries on the field.
- **Label** (`wght` 500, 0.6875rem / 11px, `0.14em` tracking, uppercase, `MONO` 1, muted): `.legend` — the specimen apparatus. Every caption key, view-strip item, tick, and micro-heading.
- **Numeral** (`MONO` 1, `wght` 500, `tabular-nums`): `.num` — years, dates, axis readouts, tick values. Anything a reader might compare down a column.
- **Address** (`MONO` 1, `wght` 500, `clamp(1rem, 3.2vw, 3rem)`, `-0.03em`): the contact close. 46.1px at 1440 — deliberately and measurably below a work title at every width.

### Named Rules

**The One Family Rule.** Recursive sets display, prose, legends and code. A second face is not
a variant of this system; it is a different system. If a job seems to need another face, it
needs a different point in Recursive's axis space instead.

**The Legend Rule.** All apparatus text — labels, keys, tags, micro-headings, nav items — is
`.legend`: 11px, `MONO 1 / CASL 0 / wght 500`, `0.14em` uppercase, muted. Do not invent a
second small-label size. `.num` is its numeric sibling and carries `tabular-nums`.

**The Axis-Multiplier Rule.** Any type that participates in DETAIL multiplies its clamp by
`(0.85 + var(--d) * K)`, K ≈ 0.20–0.25. The multiplier is applied **after** the clamp, so the
clamp ceiling is _not_ the rendered ceiling — `4.1rem` renders at 72.16px at FULL. A new
display-scale element that clamps without the multiplier will freeze while everything around it
moves, and will not belong.

**The Work-Outranks-The-Close Rule.** The largest type on any view is a piece of work. The
wordmark (1.25rem, tracked, uppercase) and the contact close are set beneath it — that is the
whole answer to a specimen's habit of being about the face instead of the work.

This is stated in **vw, not px, and it is why**: both sides of the comparison are fluid, and
the work side is additionally multiplied by the axis, which bottoms out at 0.85 at SKIM. So the
guard is a ratio of vw bases, checked at the worst instance:

> a work title's vw base must exceed **the close's vw base ÷ 0.85**.

At the shipped values that is `3.2vw ÷ 0.85 = 3.76vw`, and the shared title band is `4.6vw` —
clear by a comfortable margin rather than by a rounding error. Verified by sweeping 14 widths
from 320 to 1920 at SKIM: the work title leads the close by **+3.9px at its worst (548px)** and
by +4.4 to +9.7px everywhere else. The margin is deliberately wider than "passes"; an earlier
build cleared it by 1px at some widths, which is indistinguishable from failing.

Any new display-scale element is checked the same way — against the vw floor, at SKIM, across
the range — never by eyeballing one viewport at the default instance.

## Layout

**The sheet.** One centred column, `max-width: 78rem`, with a fluid gutter of
`clamp(1.25rem, 4vw, 3.5rem)`, `min-height: 100dvh`, and a flex column so the colophon is
pushed to the bottom on short pages. Every route renders inside it. The proof band is the one
element that spans outside the sheet's max-width, full-bleed at the top of the document.

**Vertical rhythm.** A seven-step scale (`0.25 / 0.5 / 1 / 1.5 / 2.5 / 4 / 6rem`), roughly
geometric. Section separation uses steps 5–7; internal component spacing lives in steps 1–4.
Nothing between the steps.

**The measure.** Prose is capped at `68ch` and a plate is exactly `68ch + 2 × its padding`
wide — a text page is as wide as its measure, never as wide as the sheet. The colophon is
capped tighter at `46ch`.

**The read layout.** Every read surface (opened project, post, CV) is the same two-column
figure: a plate on the left at its natural measure and a marginalia column on the right at
`minmax(11rem, 16rem)`, `justify-content: start`, gap `2.5rem`. The marginalia sits _on the
field_, not on the plate — that is the specimen's caption-beside-the-showing. Its top padding
matches the plate's padding so the first caption line meets the plate's first line of text
rather than the plate's edge.

On the two standalone read surfaces the marginalia is a component (`Marginalia.svelte`) and it
runs the whole length of the plate rather than stopping after the caption: `align-self: start`
(without it the grid stretches the item and sticky has nothing to travel through) and
`position: sticky` at `--space-4`. Under the caption, a hairline rule opens the plate's own
sections as numbered marks — see The Section Marks below. An opened project keeps the plain
caption: its body is one screen, not a document.

**The row layout.** A project row is a three-column grid: figure cell / showing / index. The
figure cell is itself axis-driven at `calc(4.5rem + var(--d) * 7.5rem)`, and row padding is
`calc(var(--space-3) + var(--d) * var(--space-3))` — the whole page breathes with the axis.

**Density.** The DETAIL axis is the density control and it is continuous. Reveals are done with
paired `opacity` + `max-height` multiplied by `--show-summary` / `--show-facts`, never with
`display` toggles. The `max-height` ceilings (9rem for a summary, 7rem for the facts row) are
sized for the worst wrap at 390px so the axis reveals but never truncates.

### Breakpoints

Four, each with one job:

- **60rem** — the plate/marginalia two-column figure collapses to one column with the caption reordered above and the section marks hidden; the marginalia drops out of sticky; the axis rail's panel stacks to one column.
- **46rem** — the main mobile pass. Masthead goes to two rows, the rail's secondary axes hide, titles drop to a `7vw` band, the project row loses its third column.
- **34rem** — only `.prose .spread` (a Typst-emitted "left — right" line) collapses so a CV date drops under its role instead of both halves wrapping.
- **30rem** — the proof band and the masthead address shed tracking and size.

### Named Rules

**The Measure Rule.** Reading width is 68ch and a plate is sized from it. Never widen a plate
to fill the sheet; widen the field around it instead.

**The Caption-On-The-Field Rule.** Metadata beside a reading surface stays on the field in
muted/legend type. Do not move marginalia onto the plate; the contrast between showing-page and
text-page is the layout's whole argument.

## Elevation & Depth

**This system has no shadows.** There is not one `box-shadow` in the build, and there is no
`filter`, `backdrop-filter`, or gradient overlay used for depth. Depth is entirely material and
tonal:

1. **Paper against field.** A `.plate` reads as a sheet laid on the ground purely by the
   value and temperature jump from `#1C22C8` to `#F1EFE6`. That is the only "layer" in the system.
2. **The hairline.** A 1px `--rule` border separates rows and encloses cells; `--rule-strong`
   is its hover state.
3. **The acid fill.** Active state is a colour inversion (acid ground, ink text), not a lift.

### The stacking context

The build had no `z-index` beyond `.skip` until `Ground.svelte` arrived, and adding it is the
one structural change to this section. There are now exactly three levels, and the list is
closed:

| Level | What                                                                         |
| ----- | ---------------------------------------------------------------------------- |
| `0`   | `.ground` — the fixed asciified field, `pointer-events: none`, `aria-hidden` |
| `1`   | `.sheet` and the full-bleed `.proof` band                                    |
| `2`   | `.skip`                                                                      |

Two consequences worth knowing before touching either file. `body` no longer paints
`background: var(--field)` — an opaque body background sits in front of a `z-index: 0` fixed
layer and would hide it entirely; `html` keeps the colour, which still propagates to the canvas
so overscroll never reveals another ground. And `.proof` needs `position: relative; z-index: 1`
explicitly, because a positioned layer paints above static in-flow content regardless of source
order.

This is depth by **layer**, not by shadow. The ground is behind everything and touches nothing;
the No-Shadow Rule below is unchanged.

### Named Rules

**The No-Shadow Rule.** No `box-shadow`, ever, in any state. If an element needs to read as
separate, it becomes a plate or gets a rule. A shadow in this world reads as a different
site's component pasted in.

**The Flat-Hover Rule.** Hover never translates, scales, or lifts. It changes exactly one
thing: border colour to `--rule-strong`, or text to acid, or the whole ground to acid. Motion
on hover is a colour transition of 140–160ms on `--ease` (`cubic-bezier(0.16, 1, 0.3, 1)`).

## Shapes

**Square, always.** `border-radius` is `0` everywhere, including explicitly reset on both
vendor pseudo-elements of the range thumb. There are no pills, no rounded cards, no circular
avatars.

**Ruled, not boxed.** The default separator is a 1px `--rule` top border on the element. Lists
of rows (projects, writing entries) are strips of top-bordered rows with a single bottom border
closing the run; the masthead's rail and the contact close open with the same hairline. A full
1px box appears only where the box is a real container: the figure cell, an outline action
button, the seed badge.

**The figure cell** is a `16 / 10` aspect box with a 1px rule, growing with the axis. Its empty
state is designed, not blank: a `-45deg` repeating-linear-gradient hatch at 55% rule opacity,
with a `FIG. PENDING` legend on a solid field chip in the centre. The hatch lives on an inner
`.hatch` rather than on `.cell`, because whatever the cell holds is put through a halftone
screen (see Motion) and the shader only reads its own subtree — a background on the cell would
sit outside the capture.

**The figure caption** sits directly under the cell, in the same column, as a `.legend` line
reading `FIG. 01 · CLI` — the register number in `--muted`, the kind in `--paper` so the half
a visitor actually reads carries the weight. Deliberately outside `.cell`: legend text at
11px run through the halftone screen is a legibility defect, and the caption has to survive
the cases the screen does not. It is the one per-project mark the DETAIL axis never gates —
the row summary and the facts interpolate away under SKIM and this does not — which is what
makes it the distinction that works on the fast skim, without JavaScript, under reduced
motion, and while the cell is still empty. It wraps to two lines in the narrow column rather
than being kept on one.

The number is **positional**, taken from the sorted index, so adding a project or changing an
`order` renumbers the ones below it. That is the accepted tradeoff: it always matches what a
visitor is counting down the page, at the cost of not being a citable reference. A project is
cited by its hash (`/#graphify`), never by its figure number. Freezing the number in
frontmatter is the alternative and would invert both properties.

**The kind** (`cli`, `library`, `graph`, `bot`, `site`, `service`) is authored in Typst
frontmatter and validated in `schema.ts`. It says what the artifact _is_, which is the
question a row cannot otherwise answer before its title is read. Per-project distinction is
carried by kind, figure, and screen ruling — never by colour: a per-project accent would
break the One Field Rule and the one-accent commitment, and is a direction re-roll rather
than a variant of this system.

**Trim marks.** Four printer's crop marks sit at the corners of the sheet's content box
(`CropMarks.svelte`, rendered once inside `.sheet`). Each corner is two 1px `--rule` arms of
`0.75rem`, one along each trim line, separated from the corner by a `0.375rem` gap — the arms
never meet, because an L that closes is a corner rule and reads as the start of a box. They
print in the gutter, which is the sheet's margin, and scroll with the document rather than
holding still while it passes: the top pair opens the sheet and the bottom pair closes it, so
the trim belongs to the sheet and not to the window.

They are the second decorative layer in the system and the budget is now spent. Unlike the
ground and the halftone they are inert geometry — no shader, no rAF, no axis input — so they
are the one piece of decoration that survives reduced motion and a JavaScript-less visit. Below
`60rem` they are removed entirely: the gutter is `4vw` until it caps, and under about 900px the
arm starts within a couple of pixels of the viewport edge, where a trim mark reads as a clipped
artifact instead of a mark in a margin.

**Icon language.** The three marks in the build are inline SVG line geometry drawn on a 12×12
box at 1.25 stroke-width, `fill: none`, `stroke: currentColor` — a plus/minus disclosure, a
diagonal-arrow external link, a down-arrow-to-baseline download. They are strokes, not glyphs,
and they carry `aria-hidden` and `focusable="false"`. A new mark should be drawn the same way;
an icon font or a filled pictogram would not belong.

### Named Rules

**The Zero-Radius Rule.** `border-radius: 0`. There is no rounding scale in this system and
adding one changes the world.

**The Ruled-Not-Boxed Rule.** Reach for a top border before reaching for a box. A box is
reserved for things that genuinely contain something — a figure, a control, a badge.

## Components

### Buttons

The system has one button silhouette in two roles, and both are square, hairline-bordered,
uppercase micro-legend type.

- **Shape:** square (0 radius), 1px `--rule` border, `0.5rem / 1rem` padding.
- **Outline action** (`.links a` on a project, `.download` on the CV): 11px `MONO 1 / wght 500`, `0.12–0.14em` tracking, uppercase, paper text, transparent ground, optional 9–11px inline stroke icon.
- **Hover / Focus:** hover inverts to a full acid ground with ink text and an acid border, over 140ms `--ease` on background/color/border only. Focus is the global `2px solid var(--acid)` outline at `3px` offset (`4px` on a project summary).
- **Named instance preset** (`.preset`): the same silhouette, joined into a segmented run with `gap: 1px` and `border-left: 0` on siblings. Hover is border→`--rule-strong` plus acid text (it does not fill); the _active_ preset carries the full acid fill and `aria-pressed`.

### Inputs / Fields

Only one input type exists: the axis slider.

- **Style:** fully custom `appearance: none` range. The track is a **1px `--muted` line — not `--rule`**: a track states the control's extent, which makes it boundary information at 3:1 rather than a decorative hairline (see The Divider-Is-Not-A-Boundary Rule). The thumb is a `5px × 14px` acid **bar**, not a circle, square-cornered, on both `-webkit-` and `-moz-` pseudo-elements. Cursor is `ew-resize`.
- **Focus:** the global acid outline. Labels are real `<label for>`; values are real `<output for>`.
- There are no text inputs, no selects, and no form on the site.

### Navigation

- **View strip** (`.views`): the three routes set as `.legend`-grade uppercase micro type with a 2px transparent bottom border. Hover fills the border with `--rule-strong`; the active view fills it with acid and turns the text acid, with `aria-current="page"`.
- **Wordmark:** `MONO 1 / wght 800`, 1.25rem, `0.16em` tracked uppercase, with the role beneath as a legend. It is small on purpose; see The Work-Outranks-The-Close Rule.
- **Mobile (≤46rem):** the masthead becomes two rows — name and contact address sharing the first, the view strip left-aligned on the second — so the first project row is inside the first viewport.
- **Skip link:** acid on ink, translated `-200%` until focused.

### Cards / Containers

There are no cards. The two container primitives are:

- **Plate** — warm paper, ink text, `clamp(1.5rem, 4vw, 3.25rem)` padding, width derived from the measure, square, unshadowed, unbordered. Inside it, link underlines switch to a 35% ink mix (field on hover), `::selection` inverts to field-on-paper, and the focus outline switches to field so it stays visible on paper.
- **Figure cell** — see Shapes.

### Marginalia

A `<dl>` on the field beside a plate: `.legend` terms in a left auto column, `0.8125rem` values in the right, `0.28em` top padding on the term so a legend's cap-height aligns to the value's baseline. It is the caption apparatus and it is reused verbatim on opened projects, posts and the CV.

### Prose (Typst-compiled bodies)

`.prose` styles HTML the site does not author — bodies are compiled from `content/**/*.typ`
into `src/lib/generated/` and committed. Headings arrive as `h2`/`h3` (the page `h1` belongs to
the route), inline code sits on an 8% field mix, blocks on a 6% mix with a solid 1px field
left-rule and `overflow-x: auto`, tables are `tabular-nums` with a 15% ink bottom rule per cell,
and `.spread` is a flex row that becomes a block below 34rem. Syntax colour arrives as nine
baked-in `.tok-*` classes; adding a tenth scope means editing `content/typst/theme.tmTheme`,
`TOKEN_CLASSES` in `scripts/build-content.ts`, and rebuilding the content — it is not a CSS-only
change.

### Signature Component: the Axis Rail

The site's signature interaction and the thing a new component most needs to respect.

- **Form — collapsed by default.** Under a hairline top rule sits a single strip: the `AXIS` legend, the live `DTL` readout in acid, the three named-instance buttons, and an `AXES` disclosure carrying the same 12×12 plus/minus mark a project row uses. Opening it reveals a two-column panel — the DETAIL slider with its `0`/`1000` ticks on the left, the two typographic axes as bordered rows on the right. Below 60rem the panel goes single-column; below 46rem the secondary axes stay hidden entirely.
  The rail used to be a three-column band that was always open, which put a control panel in the prime slot ahead of any work and cost the index roughly a third of its first viewport. Collapsing it recovered the viewport; moving it recovered the argument. What survives the collapse is what a visitor actually needs at a glance — the current instance, and one press to any named instance. The panel is the fine control and it is opt-in.
- **Placement — in the colophon.** The rail is rendered once in `+layout.svelte`'s footer, under the sentence that names the typeface, not in any route. Three things follow. The work is the first thing in the content column on every route, which is what the site is for. The instrument stands next to the sentence it explains — a specimen's controls belong with its colophon, not ahead of its showing. And the rail is now present wherever the axes reach, which is the whole document; see the resolved note below.
- **Disclosure mechanism:** a `<button aria-expanded>` with `aria-controls`, not `<details>`. The named-instance buttons ride in the same strip, and interactive controls inside a `<summary>` compete with it for the click. The rail is already `.js-only`, so a scripted disclosure costs nothing here — unlike a project row, which must open without JavaScript. Open/closed is component-local `$state`, deliberately not in `axes.svelte.ts`: it is not an axis value and should not follow the visitor across a client-side navigation the way an instance does.
- **Mechanism:** one `$effect` writes three values onto `document.documentElement` as custom properties. There is no per-element JavaScript — every row on the page remaps because the properties inherit.
- **Motion:** dragging is untransitioned so the value tracks the finger. Pressing a named instance adds `.tween` to `<html>` for 460ms, which enables a `420ms var(--ease)` transition on the three properties, then removes it. Under `prefers-reduced-motion: reduce` the global duration override collapses that interpolation into a snap between named instances — which is the specimen's own rule, not a degradation.
- **State ownership:** the values live in a module-level `$state` object (`src/lib/axes.svelte.ts`), not in the component, so a client-side navigation to another view adopts the current instance instead of resetting it. A given URL never renders at two densities depending on how the visitor arrived.
- **Boundary:** DETAIL is a density dial. It must never open or close a project — expansion belongs to native `<details>` plus the URL hash so `aria-expanded` and the shareable link keep meaning one thing.
- **Progressive enhancement:** the rail is `.js-only`, hidden by `html:not(.js) .js-only { display: none }`. An inline script in `<head>` adds `.js` before paint so the rail never pops in. With JavaScript off, every axis keeps its registered `initial-value` and all content renders at the default instance — DETAIL 650 (REVIEW), MONO 0.2, CASL 0. Those values are declared twice, in the `@property` blocks in `app.css` and in `axes.svelte.ts`, and the two must agree: the first is what a no-JS visitor is served, the second is what the rail adopts on hydration, and a mismatch reflows the document under the reader.
- **Resolved — axes no longer outlive their control.** The axes are document-level: `body` sets `font-variation-settings` from `--mono` and `--casl`, so _every_ surface varies with them, and the state is module-level so it survives client-side navigation. The rail used to appear on the two index views only, which left `/writing/[slug]` and `/cv` inheriting MONO and CASL with no control on the page to put them back — a visitor who pushed MONO on the work index read a monospaced CV and had to navigate away to undo it. Rendering the rail in the layout colophon resolves that by making the control as document-level as the properties it writes. The alternative fixes — a reset-only affordance, or scoping the typographic axes to the views that expose them — were declined: the first is a one-way control, and the second gives up the premise that the whole document is one specimen responding to one instance.

### The Section Marks

The margin index on `/cv` and `/writing/[slug]`, under the caption in `Marginalia.svelte`.

- **Form:** a hairline rule, then an `<ol>` of anchors, each a `2ch` tabular index number and the heading text in `--text-micro` uppercase at `0.12em` tracking — legend grade, one step tighter than `.legend`. Muted by default; the current mark and any hover go acid, over `140ms var(--ease)` on colour only. These are plate numbers, not a table of contents: a specimen numbers what it is showing, which is the one case where a numbered sequence carries information rather than decorating a list. On the current mark the number stays muted — the name is what is current.
- **Anchors:** ids are minted at build time in `scripts/build-content.ts` (`anchorHeadings`), which slugifies each Typst-emitted `<h2>` and dedupes collisions with a `-2` suffix, then ships the marks in the bundle as `Entry.headings`. Nothing parses HTML at render, the prerendered output is identical on every host, and renaming a heading is a reviewable diff. Projects are deliberately excluded — they carry `headings: []` — because every project body renders into the same document on the index, where per-file ids would collide across projects and could collide with the slugs the index uses as its expansion hash.
- **Scroll clipping:** the column is not `max-height` + `overflow` clamped. That pair forces `overflow-x` to compute to `auto`, and the global focus outline draws outside the border box, so every keyboard focus in the margin would render clipped. At ~24px a mark the column does not need the guard.
- **Current-section tracking:** an `IntersectionObserver` over the headings is the trigger, not the answer — on every crossing the current mark is read off `getBoundingClientRect()` against a line at 30% of the viewport. Asking the observer alone means tracking entries it did not report, and it has no answer at all once a long section fills the viewport with no heading in it. The current mark carries `aria-current="true"`.
- **Progressive enhancement:** with JavaScript off the marks are still real anchors and nothing is marked current. That is deliberate — a mark claiming to track the reader while never moving would be a lie, and the initial state is `''` rather than the first heading for exactly that reason.
- **Breakpoint:** below 60rem the marginalia reorders above the plate, and the index is hidden there. A section list ahead of the text is a second navigation the reader did not ask for; the marks are a margin instrument and the margin is a desktop object.

### Proof Band

A full-bleed acid band at the top of the document, ink micro-legend type, `role="status"`,
rendered only while placeholder content is present. It is a printer's proof stamp — a
deliberate, designed statement that the sheet was pulled before the run was final — not an
apology banner. A per-project `SEED` badge (acid hairline box, 9px tracked) marks which entries
are seed material.

## Motion

Two kinds of motion exist here and they answer to different rules. **Interface motion** is CSS:
140-160ms colour transitions on hover, the 220ms disclosure stem, the 420ms axis tween. It is
governed by the global `prefers-reduced-motion` block in `app.css`, which collapses every
transition and animation to `0.01ms`.

**Canvas motion** is the second kind. Two vendored Canvas UI effects
(`src/lib/components/canvasui/`, zero dependencies, one file each) put the sheet through a press:

- **The ground** (`Ground.svelte`) — a fixed, full-viewport, `aria-hidden` layer that _is_ the
  page background: `--field` moved off `body` onto a plate inside Asciify, so the shader has
  something to read. Faint characters scatter over the field and thicken into a patch that
  follows the cursor. `baseStrength: 0.1` with `strength: 1` inside a `radius: 0.4` lens.
- **The screen** (in `ProjectEntry.svelte`) — every figure cell runs through Retro Dither at
  `pattern: "halftone"`, the way a press renders a figure, at `strength: 0.8` inside the lens
  over a `baseStrength: 0.4` field, so it modulates the designed hatch rather than dissolving
  it. `trail` and `degauss` are `0`; motion smear and CRT degauss belong to a different world.
  The **ruling** is per plate, not fixed: `pixelSize` and `levels` are derived from the slug
  over a narrow band (4–7 and 3–5), the way a press runs a different screen per plate, so no
  two figures carry the same grain at the same viewing distance. The pattern stays halftone —
  the band is a ruling chart, not four effects.

### What the ground can and cannot do

Three properties of Asciify decide this component's whole shape, and all three were found by
building the wrong thing first:

1. **It is a filter, not a generator.** The glyph index is `int(amount * 10)` off the cell's
   luminance. A flat source puts every cell on one rung, so the ground renders **a single
   repeated character** — accepted deliberately, because the alternative is worse.
2. **Unselected cells output transparent.** Coverage is `step(hash21(cell), mask)`, a per-cell
   dither, which is what scatters the lens edge. It also means anything textured enough to vary
   the glyphs is visible on the page as grain or dots. Plain background with one mark, or varied
   marks over a mottled ground; there is no third option.
3. **The fallback painter only sees background colours.** `paintFallbackSnapshot()` paints
   background colours, text, borders and images by hand, but not `background-image`, gradients
   or filters. Because the ground's source is a flat `background`, the fallback reproduces it
   exactly — so the ground renders and animates in every browser, with or without Chrome's
   html-in-canvas flag. That is verified, not assumed. Give the source a CSS-image texture and
   it silently goes blank everywhere except flagged Chrome.

Glyph colour comes from `uBg + (pixel - uBg) / max(|lumDelta|, 0.2)`. The backing is set darker
than the field so the delta hits the `0.2` clamp and lifts about 5x, turning near-field blue into
a light periwinkle. A field-coloured backing gives zero delta and renders nothing.

### Named Rules

**The Reduced-Motion-Is-Not-CSS Rule.** The global `prefers-reduced-motion` block cannot reach a
`requestAnimationFrame` loop, and neither component stops its own — under the query they only
make pointer easing instant and keep rendering. Anything canvas-driven must consult
`motion.reduced` (`src/lib/motion.svelte.ts`) and **decline to mount**. The intentional
alternative is the flat field and the plain hatch: the site exactly as it shipped.

**The Cursor-Is-The-Only-Motion Rule.** The rAF loop parks itself the moment the pointer settles
and nothing is dirty, and the shader re-uploads only its pointer uniforms per frame — an option
animated after construction is never re-sent. Driving `brightness` from a rAF was tried and
produced a measurably static page. Do not add ambient animation to these components; it will not
render.

**The Explicitly-Sized-Host Rule.** In the native path both components move their children inside
a `<canvas layoutsubtree>` at `position: absolute; inset: 0`, leaving their own wrapper with no
intrinsic height. Wrap only a box whose size is already determined — a fixed full-viewport layer,
or a cell with an `aspect-ratio`. Wrapping page flow collapses it to zero height.

**The No-Global-Class-Names Rule.** A layer inside these components must not reuse a class the
global stylesheet already owns. Svelte's scoping adds a hash but does not stop `app.css` from
matching too: naming the ground's plate `.plate` picked up the paper plate's
`width: calc(68ch + 2 * padding)` and clipped the effect to 798px mid-viewport.

**The Decoration-Only Rule.** Both effects are `aria-hidden`, neither carries information, and
both are absent without JavaScript or under reduced motion. Nothing a visitor came to read may
ever depend on a shader — and nothing readable may sit _inside_ one: asciifying the page itself
was tried and made the work illegible.

## Do's and Don'ts

### Do:

- **Do** put every long read on a `.plate` and leave its metadata on the field beside it.
- **Do** multiply any new display-scale type by `(0.85 + var(--d) * K)` so it moves with the axis, and check its vw base against `close-vw ÷ 0.85` (currently 3.76vw) by sweeping the width range at SKIM.
- **Do** use `.legend` for every label and `.num` for every figure a reader might compare.
- **Do** reveal and hide with `opacity` + `max-height` scaled by `--show-summary` / `--show-facts`, so the transition is interpolation rather than a branch.
- **Do** register any new axis-like custom property with `@property` and give it a sensible `initial-value` — that value is what a no-JS visitor gets.
- **Do** separate with a 1px `--rule` top border, and reserve a full box for things that contain something.
- **Do** reach for `--muted` or acid, never `--rule`, whenever a line is the visible boundary of a control rather than a divider between things being read.
- **Do** give interactive elements the global acid focus outline, and switch it to `--field` inside a plate.
- **Do** keep hover to a colour change on `--ease` at 140–160ms.
- **Do** draw new marks as 12×12 inline SVG line geometry at 1.25 stroke-width with `aria-hidden`.
- **Do** gate anything canvas-driven on `motion.reduced` and on an explicitly-sized host, and keep it `aria-hidden` and absent without JavaScript.
- **Do** keep the vendored Canvas UI files byte-identical to upstream apart from changes marked `LOCAL PATCH`, and record each one in `canvasui/README.md` so a re-download diffs cleanly.

### Don't:

- **Don't** add a `box-shadow`, a `border-radius`, a gradient, or a tinted panel. Depth is paper-on-field and a hairline.
- **Don't** introduce a second typeface, or a second small-label size alongside `.legend`.
- **Don't** put code or long prose on the field — the syntax palette is calibrated for the plate ground.
- **Don't** let the wordmark, a section head, or the contact close outrank a work title at any axis instance or viewport width — and don't raise the close's vw base without re-checking the whole sweep.
- **Don't** use `--rule` for a slider track, an input border, or any other line that carries the extent of a control. It is 1.92:1 and fails WCAG 1.4.11.
- **Don't** give the writing index a title band of its own. Work and writing share one expression on purpose; forking them is how the invariant broke the first time.
- **Don't** branch on `prefers-color-scheme` or add a theme toggle. The site commits to one rendition; the plate is the light surface.
- **Don't** give the DETAIL axis control over disclosure, routing, or anything with an ARIA state. It sets density only.
- **Don't** gate content behind JavaScript. The rail may be `.js-only`; nothing a visitor came to read may be.
- **Don't** hide information at low DETAIL that the audience needs — SKIM removes summaries and stack lines, and 650 is the default precisely because those must be visible by default.
- **Don't** add a `.tok-*` class in CSS alone; the class list is generated and must stay in step with `theme.tmTheme` and `TOKEN_CLASSES`.
- **Don't** animate a slider drag. Only named-instance jumps tween, and only via the `.tween` class.
- **Don't** add a fourth `z-index`. The stack is ground `0`, sheet and proof `1`, skip link `2`, and it is closed — and don't put `background` back on `body`, which would bury the ground.
- **Don't** run a shader over anything a visitor has to read. The ground is behind the sheet and the screen is inside a figure cell; neither touches prose, and the plate stays opaque paper.
- **Don't** dim a Canvas UI source to quieten it. The shader amplifies the source-to-backing gap by up to 5× and a dim source comes back hue-shifted; give it full contrast and lower the layer's `opacity`.
- **Don't** attach a MutationObserver to `document.documentElement` from inside an effect. `AxisRail` writes the three axes onto its `style` on every slider frame; that is the hot path, and it is why Asciify's theme observer is patched out.

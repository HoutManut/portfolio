# Vendored Canvas UI

Source copied from [Canvas UI](https://canvasui.dev), MIT + Commons Clause. These files are
distributed as source rather than as a package — there is no npm dependency here, and there is
none to add: the registry lists `"dependencies": []` for all of them.

| File | Registry item | Fetched from |
| --- | --- | --- |
| `Asciify.svelte` | `asciify-svelte` | `https://canvasui.dev/r/asciify-svelte.json` |
| `Canvas.svelte` | `canvas-svelte` | `https://canvasui.dev/r/canvas-svelte.json` |
| `RetroDither.svelte` | `retro-dither-svelte` | `https://canvasui.dev/r/retro-dither-svelte.json` |

The shadcn CLI path (`npx shadcn@latest add @canvas-ui/…`) does not apply to this project — it
has no `components.json` and no Tailwind. Re-download by fetching the registry JSON above and
writing out `files[0].content`.

All three are kept **byte-identical to upstream** apart from the changes below, each marked
`LOCAL PATCH` in the source, so a re-download diffs cleanly. They are excluded from
`prettier --check` and from eslint (see `.prettierignore` and `eslint.config.js`); formatting
vendored source would bury those patches in noise.

## Local patches

### `Asciify.svelte` — theme observer left unattached

Upstream registers a `MutationObserver` on `document.documentElement` filtered to
`class`/`style`/`data-theme`, so that a theme swap re-syncs the shader's backing colour.

Two reasons it is wrong here:

1. This site has one rendition. DESIGN.md's *Don't branch on `prefers-color-scheme`* rule means
   there is no theme swap to catch.
2. `AxisRail` writes `--detail`, `--mono` and `--casl` onto `documentElement.style` on **every
   slider frame**, and adds/removes `.tween` around preset jumps. Left attached, the observer
   fires on every one of those ticks, each firing `syncBacking()` plus a 300 ms-debounced full
   DOM re-snapshot. Dragging the DETAIL axis would re-capture the page continuously.

The observer and the `prefers-color-scheme` query are still constructed so `destroy()` stays
valid; they are simply never attached.

### `Asciify.svelte` — `trackPointerOn: "wrapper" | "window"`

Upstream binds `pointermove` / `pointerleave` to `output.parentElement`, its own wrapper. A
wrapper with `pointer-events: none` therefore receives nothing, the lens never moves, and since
the rAF loop parks itself as soon as the pointer settles, the whole effect renders one frame and
freezes. `Ground.svelte` is exactly that case — a fixed click-through layer behind the sheet —
so it passes `"window"` and the listeners go on the window instead. Default is unchanged.

### `Asciify.svelte` — `renderMode: "auto" | "fallback"`

`"fallback"` pins the component to `paintFallbackSnapshot()` instead of using html-in-canvas
where available. Added for a wrapper around a whole scrolling document, where the native path's
`position: absolute; inset: 0` children collapse the page to zero height. **Nothing currently
uses it** — the ground needs the native path (see below) — but it stays because the failure it
guards against is not obvious and costs an implementation session to rediscover.

### `Canvas.svelte` — `fit: "fill" | "flow"`

Upstream is `"fill"`: the wrapper is expected to carry its own height, and the content is
stretched to it with `height: 100%`. That is the same "explicitly-sized box only" contract the
other two components have, and `Prose.svelte` breaks it deliberately — a Typst-compiled body is
intrinsically sized page flow.

`"flow"` leaves the content at `height: auto` and runs a `ResizeObserver` over it, feeding the
measured `scrollHeight` back to the wrapper as `min-height`. It converges in one step because
the content height no longer derives from the wrapper.

**The patch only covers the vertical axis.** On the html-in-canvas path the content is out of
flow on *both*, so the wrapper also stops contributing an intrinsic width to its parent. There
is no in-component fix for that — width has to come from outside — so the caller restates it:
`app.css`'s `.prose-fx` rule sets `width: var(--measure)`, which is exactly what `.prose`
contributed before it was wrapped. Without it, `.plate` — an `auto` grid track — collapses to
its own padding and the text wraps to nothing. It is not a subtle failure: one project entry
measured 694×2533 with the rule and 0×14773 without it.

### `Canvas.svelte` — `radiusPx: number`

Upstream's `radius` is a fraction of the source's own measured height — sized for `"fill"`,
where that height is the viewport, so the fraction means roughly the same physical brush size on
every page. Under `fit="flow"` the height is whatever the wrapped content measures to, and Typst
bodies vary from a couple of short paragraphs to a long writeup with figures. One `radius`
fraction then produces a brush a few CSS pixels across on a short project entry and one much
wider on a long one — reported directly by the person using the site.

`radiusPx`, set only under `fit="flow"`, overrides `radius` with `radiusPx / flowHeight`,
recomputed from the same `ResizeObserver` measurement the `fit="flow"` patch already takes. The
brush is then a constant physical size regardless of how long the prose under it happens to be.
`radius` still applies for the instant before the first measurement lands.

### `RetroDither.svelte` — wrapper elements are spans

The wrapper and content elements are `<span>` with `display: block` rather than `<div>`, so an
instance can live inside `<summary>`, whose content model is phrasing content. The figure cells
put one there. Layout is unchanged; `contentEl` is typed `HTMLSpanElement` to match.

## Behaviour worth knowing before you use these

- **The rAF loop self-terminates.** `frame()` sets `running = false` once the pointer has
  settled and the content is not dirty, so an idle instance costs nothing. It restarts on
  pointer move, resize, intersection, and content mutation.
- **Reduced motion is not a stop.** Both components only set `ease = 1` (instant pointer
  follow) when `prefers-reduced-motion: reduce` matches — the loop still runs and the effect
  still renders. `app.css`'s global reduced-motion rule is CSS-only and cannot reach a rAF
  loop. Callers that want a true stop must gate mounting themselves; `Ground.svelte` does.
- **Pointer events are bound to `output.parentElement`** — the component's own wrapper. A
  wrapper with `pointer-events: none` gets no cursor tracking. `Ground.svelte` is deliberately
  lens-free (`baseStrength: 1`) so it can stay click-through.
- **The wrapper has no intrinsic height.** In the native (html-in-canvas) path children are
  moved inside `<canvas layoutsubtree>` at `position: absolute; inset: 0`, leaving the
  `position: relative` wrapper at zero height. **Only ever wrap an explicitly-sized box** — a
  fixed full-viewport layer, or a cell with a set `aspect-ratio`. Wrapping page flow collapses
  it.
- **`backgroundOpacity` defaults to `0`**, which lets the untouched source content show through
  the glyphs. Anything that must fully replace its source needs `backgroundOpacity: 1` and an
  explicit `background`.
- **`Canvas` has no fallback either, and it is the quiet case.** `uploadContent()` returns early
  unless `htmlInCanvas`, so `contentReady` never flips, `introProgress()` returns 0, and the
  output canvas stays empty. Without the flag the wrapped content renders plain — correct, but
  it means the effect cannot be seen at all in a normal browser, and "it looks unchanged" is not
  evidence the wiring is wrong. Verify against Chrome launched with
  `--enable-blink-features=CanvasDrawElement`.
- **Hiding an instance's ancestor does not stop it.** A closed `<details>` still lets the native
  path lift the content into `<canvas layoutsubtree>`, which escapes the disclosure. Nothing
  paints, but the WebGL context and its full-height backing store are live. `ProjectEntry`
  passes `fx={open}` to `Prose` for this reason; four entries would otherwise hold four contexts
  on the index page on top of `Ground`'s and every figure cell's.
- **`RetroDither` has no fallback.** Without Chrome's html-in-canvas
  (`chrome://flags/#canvas-draw-element`) it renders `{#if !native}` plain children — the
  effect is simply absent.
- **`Asciify`'s fallback is real but partial.** `paintFallbackSnapshot()` paints background
  *colours*, text, borders and images by hand — it does **not** rasterise `background-image`,
  gradients, or filters. Anything whose tone comes from a CSS image is flat to the shader in
  that path, which is why the ground runs on the native path and is flat-by-design rather than
  textured.
- **Asciify is a filter, not a generator.** It picks a glyph per cell from
  `|cellLuminance − backingLuminance|`. Hand it a flat colour and every cell lands on the same
  rung of the ramp: one repeated character, or nothing at all if the source matches the
  `background` prop exactly. Glyph *variety* requires tonal variation in the source.
- **Unselected cells output transparent.** Coverage is
  `apply = step(hash21(cell), mask)` — a per-cell stochastic dither, which is what makes the
  lens edge scatter instead of ending on a clean circle. The consequence: whatever the component
  wraps stays visible through those cells, so a textured source is visible *as* texture on the
  page. Plain background plus one glyph, or varied glyphs plus visible grain — the two cannot be
  separated.
- **Glyph colour is amplified.** `glyphColor = uBg + (pixel − uBg) / max(|lumΔ|, 0.2)`, so up to
  5×. A source close to the backing yields a strongly lifted colour (the ground exploits this to
  get light periwinkle out of near-field blue); a source already far from it blows past the
  gamut and returns white or cyan.

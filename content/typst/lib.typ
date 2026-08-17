// The only file content authors need to import.
//
//   #import "../typst/lib.typ": doc, meta
//   #show: doc
//   #meta((title: "…", …))
//
// `doc` dispatches on the compile target so one source file can produce both
// HTML and PDF (content/cv.typ does exactly that).
// `meta` is the frontmatter: build-content.ts reads it with
// `typst eval 'query(<meta>).map(it => it.value)'` and validates it against
// src/lib/content/schema.ts.

#import "web.typ": web
#import "paged.typ": paged

/// Frontmatter. Exactly one per file. Emits nothing visible.
#let meta(data) = [#metadata(data)<meta>]

/// Target-aware document wrapper.
#let doc(body) = context {
  if target() == "html" { web(body) } else { paged(body) }
}

/// A line with something pushed to each end — a CV role and its dates.
/// `h(1fr)` has no meaning in HTML and silently collapses, so the web target
/// gets a flex row (`.spread` in app.css) instead.
#let spread(lhs, rhs) = context {
  if target() == "html" {
    html.elem(
      "span",
      attrs: (class: "spread"),
      html.elem("span", lhs)
        + html.elem("span", attrs: (class: "spread-end"), rhs),
    )
  } else {
    [#lhs #h(1fr) #rhs]
  }
}

/// Diagrams and any other layout-only content must be wrapped in this to
/// survive HTML export — Typst drops laid-out material on the HTML target
/// unless it is framed into inline SVG.
///
///   #frame(rect(width: 40pt, height: 20pt))
#let frame(body) = context {
  if target() == "html" { html.frame(body) } else { body }
}


#let only-html(content) = {
  context if target() == "html" [
    #content
  ]
}
#let only-pdf(content) = {
  context if target() == "paged" [
    #content
  ]
}

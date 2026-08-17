// Show rules for the paged (PDF) target — currently only content/cv.typ.
//
// Values here are provisional. The site's visual direction has not been chosen
// yet (see PRODUCT.md); once DESIGN.md exists, the PDF should be brought in
// line with it so the printed CV and the /cv page read as one artifact.
//
// The sentinel raw theme from web.typ must NOT reach this target — its colours
// are meant to be rewritten by the build script, not printed.

#let paged(body) = {
  set page(paper: "a4", margin: (x: 18mm, y: 20mm))
  set text(size: 10pt)
  set par(justify: false, leading: 0.65em, spacing: 1.1em)
  set raw(theme: auto)

  show heading.where(level: 1): it => block(above: 1.6em, below: 0.6em)[
    #text(size: 18pt, weight: 700, it.body)
  ]
  show heading.where(level: 2): it => block(above: 1.2em, below: 0.5em)[
    #text(size: 11pt, weight: 700, tracking: 0.06em, upper(it.body))
  ]
  show link: it => underline(offset: 2pt, it)

  body
}

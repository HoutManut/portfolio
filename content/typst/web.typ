// Show rules for the HTML target.
//
// Deliberately minimal: everything visual is CSS's job. Typst's HTML export
// emits semantic elements (h2/p/strong/code/ul/figure) and the site styles
// them. The one thing set here is the sentinel raw theme, which
// scripts/build-content.ts converts into token classes.
//
// Note: `= Heading` exports as <h2>, not <h1>. The page <h1> comes from the
// Svelte layout, so heading order stays correct.

#let web(body) = {
  set raw(theme: "theme.tmTheme")
  body
}

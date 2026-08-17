#import "../typst/lib.typ": doc, frame, meta
#show: doc

#meta((
  title: "Authoring this site in Typst",
  date: "2026-08-16",
  summary: "Why the posts and the CV on this site are .typ files, and what the HTML export actually gives you.",
  tags: ("typst", "tooling"),
  draft: false,
))

Every post on this site, including this one, is a `.typ` file. So is the CV.
"That's a strange choice for a website. Typst is a typesetting language, not a
web framework" is what you might be wondering — unless you don't even know what
Typst is. Hear me out.

#link("https://typst.app/")[Typst 0.15] can export HTML. It's still gated behind
`--features html` and the feature is explicitly incomplete, but it's close
enough to hand-written markup that I was comfortable letting it own the page's
CSS instead of fighting it.

= Frontmatter

Typst has no frontmatter convention, so I made one out of a `metadata` call and
a label — `#meta((title: "…", date: "2026-08-16"))` at the top of every file,
this one included. The build script reads it back out with `typst eval` and
rejects the post if it doesn't validate, which is the only thing standing
between a typo in a date field and a broken build.

= What does not survive

Laid-out material is dropped on the HTML target by default. Typst has no HTML
equivalent for an absolutely-positioned rectangle or a hand-drawn diagram, so it
just omits it. The fix is `#frame(...)`, which rasterizes the content to inline
SVG before it hits the HTML exporter — that's how every diagram on this site
makes it into the page at all.

Math is the one exception that needs no workaround. It exports as native MathML,
so equations like $e^(i pi) + 1 = 0$ need no image and stay selectable text in
the browser, not that I'll ever use it though.

= Here's the neat part

The CV is one `.typ` file that compiles twice: once to the HTML they read on the
page and the same one to a downloadable PDF. This means that two can no longer
drift apart, since they're built from a single source. Optionally, I can
selectively only render a block of content from the HTML target and hides it in
the PDF version, and vice-versa.

#import "typst/lib.typ": doc, meta, only-html, only-pdf, spread
#show: doc

#meta((
  title: "Curriculum Vitae",
  name: "Hout Manut",
  email: "huotmanut00@gmail.com",
  updated: "2026-08-17",
  placeholder: false,
))

// This one file produces BOTH static/cv.pdf and the /cv route. Edit here, run
// `npm run content`, and the two cannot drift apart.

// The PDF needs its own title block; on the web the page <h1> comes from the
// Svelte layout, so it is suppressed there.

#only-pdf([
  = Hout Manut
  #link("mailto:huotmanut00@gmail.com")
])

= Experience

#spread[*Full-Stack Developer* — Council for the Development of Cambodia (CDC)][Jul 2026–present] \
Continued on full-time after the second internship, working on internal
platforms for the Council.

#spread[*Full-Stack Developer Intern* — CDC][Jan 2026–Jul 2026] \
Built on *cdcIRM*, a mail-aggregation and CRM platform with deep integration
across internal systems.

#spread[*Mobile Developer Intern* — CDC][Apr 2025–Jun 2025] \
Built the mobile app for *cdcNews*, a news-aggregation platform, for browsing
and downloading daily news reports.

= Selected projects

#only-html[
  Most of my CDC project work can't be detailed publicly. See the
  #link("/")[work index] for public projects with live links.
]

- *Mata-Bot* — Discord bot for designing, visualising, testing, converting,
  and minimising finite automata.
- *cdcIRM* — internal mail-aggregation and CRM platform.
- *cdcNews* — mobile app for a news-aggregation platform.

= Education

#spread[*BSc Computer Science* — Cambodia Academy of Digital Technology (CADT)][Expected 2027]

= Technical

Languages: TypeScript, Python, Dart \
Infrastructure: Postgres, Docker, CI \
Also: Svelte, Node, SQLite, Flutter

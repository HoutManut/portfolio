#import "../typst/lib.typ": doc, meta
#show: doc

#meta((
  title: "An unpublished draft",
  date: "2026-08-16",
  summary: "Exists only to prove drafts are excluded from the build. Delete it or publish it.",
  tags: (),
  draft: true,
  placeholder: true,
))

// PLACEHOLDER / FIXTURE — `draft: true` means build-content.ts skips this file
// entirely: no entry in writing.json, no prerendered route. Flip the flag and
// re-run `npm run content` to publish.

If you can read this on the site, the draft filter is broken.

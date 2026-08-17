# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: hiring managers and engineers evaluating Marut for a software engineering
role. They arrive from a job application, a referral, or a link in a message, skim
fast, and decide whether to reply. Secondary: peer developers arriving from GitHub or
a shared link who came for the work and the writing, and prospective freelance or
contract clients. The site is optimized for the hiring case first.

## Product Purpose

A personal portfolio that shows what Marut has built as a software engineer, plus the
writing that surrounds it. Success is a visitor understanding the substance of the
work within one viewport and having a low-friction way to make contact.

## Positioning

The work leads. No bio preamble, no marketing layer — projects are visible from the
first viewport and open in place. Everything written on the site (essays and the CV)
is authored in Typst and compiled to the web, so the CV a visitor reads online and the
PDF they download come from a single source and cannot drift apart.

## Operating Context

Visitors skim on both desktop and phone, often mid-triage with other tabs open. Some
arrive with a specific question ("has he shipped anything real?"), others are browsing.
The CV is expected as a downloadable PDF as well as a readable page.

## Capabilities and Constraints

- Static site, fully prerendered. No server runtime, no database, no auth.
- SvelteKit with adapter-static, Svelte 5, TypeScript.
- Content authored in Typst (pinned 0.15.x); HTML export is an experimental Typst
  feature and requires `--features html`.
- Generated HTML and metadata are committed so the site builds on any host without
  the Typst binary present.
- Projects expand inline on the index; there are no per-project routes.
- Contact is a plain email address plus social links. No contact form, no analytics
  decided yet.

## Evidence on Hand

- Shipped projects with live links (URLs to be supplied by Marut).
- Existing writing to be published.
- An existing resume/CV, to be re-authored as content/cv.typ.
- Not yet available and must not be fabricated: testimonials, employer names,
  metrics, client logos, press. Any placeholder shipped in their place is labeled
  as such and goes on the replacement list.

## Product Principles

1. The work is the argument — show artifacts, not adjectives.
2. One source of truth per fact; the CV page and CV PDF compile from the same file.
3. Optimize for the fast skim; reward the deep read second.
4. Nothing template-shaped and nothing hype-shaped. Both read as unserious to this
   audience.
5. Content is authored text in the repo, not a CMS — the site survives without any
   external service.

## Accessibility & Inclusion

Standard web accessibility: semantic HTML from the Typst export preserved, real
heading order (Typst emits h2; the page h1 comes from the layout), visible focus,
keyboard-operable inline project expansion with correct aria-expanded state, and
`prefers-reduced-motion` honored.

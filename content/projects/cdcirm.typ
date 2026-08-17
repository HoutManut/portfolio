#import "../typst/lib.typ": doc, meta
#show: doc

#meta((
  title: "cdcIRM",
  year: 2026,
  summary: "Investor Relations Management platform for the Council for the Development of Cambodia — a NestJS API/worker backend and a Flutter mobile app, both built solo.",
  kind: "application",
  stack: (
    (name: "NestJS", url: "https://nestjs.com"),
    (name: "Sequelize", url: "https://sequelize.org"),
    "PostgreSQL",
    (name: "BullMQ", url: "https://bullmq.io"),
    "Redis",
    (name: "Flutter", url: "https://flutter.dev"),
    "Dart",
  ),
  live: none,
  repo: none,
  status: "wip",
  order: none,
  placeholder: false,
))

cdcIRM is an investor-relations platform for the Council for the Development
of Cambodia, currently in UAT with real users. I built both sides solo: the
NestJS backend and the Flutter mobile client.

= How it works

The backend is a monorepo of two NestJS apps sharing one library: an HTTP API
and a background worker, talking to Postgres through Sequelize and to each
other through Redis-backed BullMQ queues. The worker owns mail ingestion —
Gmail push, IMAP IDLE, backfill, and message normalization run as separate
queue processors rather than inline with requests.

Auth is layered past a plain JWT check: sessions get scored by a trust
calculator (MFA, device fingerprint, geolocation, IP changes, session age),
and routes can require a minimum trust level on top of role checks. Schema
changes go through incremental, ordered migrations rather than a sync/reset,
since the database already holds real UAT data.

The mobile app is the client surface for the same platform — session/auth
against the backend, mail-account and thread views, and the notification and
deep-link plumbing (Firebase messaging, app links) to get users from a push
straight into a specific thread. Like the backend, it ships in Khmer and
English.

= What I learned

Running a service through UAT changes what "done" means: correctness now has
to hold against live data and real user behavior, not just tests. That
pushed the migration workflow toward incremental and reversible changes, and
made the trust/session model something to get right the first time rather
than iterate on freely.

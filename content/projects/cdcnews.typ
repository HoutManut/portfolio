#import "../typst/lib.typ": doc, meta
#show: doc

#meta((
  title: "cdcNews",
  year: 2025,
  summary: "A Flutter mobile app for an internal news/media platform, built solo end-to-end against an existing API and web-admin backend.",
  kind: "application",
  stack: (
    (name: "Flutter", url: "https://flutter.dev"),
    (name: "Dart", url: "https://dart.dev"),
    "SSO / PKCE",
    "Provider",
    "REST + Socket.IO",
  ),
  live: none,
  repo: none,
  status: "shipped",
  order: none,
  placeholder: false,
))

cdcNews is the mobile client for an internal news platform, paired with an
existing API and web-admin. I built the Flutter app solo: auth, content
browsing, and the supporting device-level features around it.

= How it works

Login goes through SSO via PKCE against Keycloak, exchanging a token with the
backend before the user reaches the app. Session and cached preferences sit
behind `Provider` and local storage rather than re-fetching on every screen.

Content covers news articles alongside heavier formats: in-app PDF reading,
charts for data-heavy stories, and a QR/document scanner for physical media.
Push-style updates and deep links route users straight to specific articles
from outside the app.

The app ships in Khmer and English, with layout and fonts (Kantumruy Pro,
Siemreap) handling Khmer script directly rather than falling back to a
system font.

= What I learned

Most of the friction was integration, not UI: getting PKCE token exchange
right against an existing Keycloak setup, and keeping the app resilient to
an API/web-admin stack I didn't own. Debugging auth failures meant
cross-referencing API logs, Keycloak client config, and the app's own env
setup rather than just app-side state.

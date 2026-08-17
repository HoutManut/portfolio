// Every route is prerendered — adapter-static writes plain HTML files and the
// site needs no server at runtime.
export const prerender = true;

// Default trailing-slash behaviour on purpose: adapter-static then writes
// writing.html rather than writing/index.html, which is exactly what the links
// resolve() generates point at. Forcing 'always' makes every internal link
// bounce through a redirect first.

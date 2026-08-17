/**
 * Site-wide facts. Kept here rather than scattered through markup so there is
 * one place to correct them.
 *
 * `role` and `tagline` are localized copy, not facts — see `m.siteRole()` /
 * `m.siteTagline()` in messages/*.json instead.
 *
 * PLACEHOLDER — the profile URLs are seed values. Replace them.
 */
export const site = {
	name: 'Hout Manut',
	email: 'huotmanut00@gmail.com',
	links: [
		{ label: 'GitHub', href: 'https://github.com/' },
		{ label: 'LinkedIn', href: 'https://www.linkedin.com/' }
	]
} as const;

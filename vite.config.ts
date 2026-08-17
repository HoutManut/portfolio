import adapter from '@sveltejs/adapter-static';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Set by the GitHub Pages workflow to the repo name, since project pages are
// served from <user>.github.io/<repo>/ rather than root.
const base = process.env.BASE_PATH ?? '';

export default defineConfig({
	plugins: [
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url', 'baseLocale'],
			// This project's adapter-static output never uses trailing slashes
			// (writing.html, not writing/index.html — see src/routes/+layout.ts),
			// so localized URLs must match or every locale root 404s.
			trailingSlash: 'never',
			urlPatterns: [
				{
					pattern: `:protocol://:domain(.*)::port?${base}/:path(.*)?`,
					localized: [
						['ja', `:protocol://:domain(.*)::port?${base}/ja/:path(.*)?`],
						['km', `:protocol://:domain(.*)::port?${base}/km/:path(.*)?`],
						['en', `:protocol://:domain(.*)::port?${base}/:path(.*)?`]
					]
				}
			]
		}),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			paths: {
				base: base as `/${string}` | '',
				// `resolve()` must return a plain `/base/path` string during
				// prerender, not SvelteKit's `http://sveltekit-prerender/...`
				// sentinel — paraglide's localizeHref mishandles the sentinel
				// form and drops the base.
				relative: false
			}
		})
	]
});

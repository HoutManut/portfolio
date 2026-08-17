import adapter from '@sveltejs/adapter-static';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url', 'baseLocale'],
			// This project's adapter-static output never uses trailing slashes
			// (writing.html, not writing/index.html — see src/routes/+layout.ts),
			// so localized URLs must match or every locale root 404s.
			trailingSlash: 'never'
		}),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		})
	],
    server: {
        allowedHosts: ['flat-technique-cloth-advised.trycloudflare.com'],
    }
});

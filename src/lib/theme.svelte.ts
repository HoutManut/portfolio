/**
 * The specimen's palette state — a reroll of app.css's :root drench, picked
 * from PALETTES.md's options. Lives outside the component for the same
 * reason axes.svelte.ts does: the palette belongs to the document, not to
 * one view, and a client-side navigation should not reset it.
 *
 * Palette C is the default instance, matching the @property initial-value
 * block in app.css that a no-JS visitor is served.
 */

export type ThemeId = 'original' | 'c' | 'e' | 'f';

export type Palette = {
	id: ThemeId;
	label: string;
	field: string;
	paper: string;
	acid: string;
	ink: string;
	muted: string;
	rule: string;
	ruleStrong: string;
};

export const palettes: Palette[] = [
	{
		id: 'c',
		label: 'Palette C',
		field: '#08495e',
		paper: '#f1efe6',
		acid: '#ff974d',
		ink: '#100e0c',
		muted: '#94c2d1',
		rule: '#29758e',
		ruleStrong: '#2e95b8'
	},
	{
		id: 'original',
		label: 'Original',
		field: '#1c22c8',
		paper: '#f1efe6',
		acid: '#d6f03a',
		ink: '#12131a',
		muted: '#a6acee',
		rule: '#5a5fd8',
		ruleStrong: '#7b80e4'
	},
	{
		id: 'e',
		label: 'Palette E',
		field: '#0f0f0f',
		paper: '#f1efe6',
		acid: '#f87cba',
		ink: '#130a10',
		muted: '#9f7d8e',
		rule: '#4c3e45',
		ruleStrong: '#6d5561'
	},
	{
		id: 'f',
		label: 'Palette F',
		field: '#0c0f12',
		paper: '#f1efe6',
		acid: '#00b3cf',
		ink: '#080c0e',
		muted: '#698f96',
		rule: '#364245',
		ruleStrong: '#4b5f63'
	}
];

const STORAGE_KEY = 'theme';
const DEFAULT_THEME: ThemeId = 'c';

function loadInitial(): ThemeId {
	if (typeof localStorage === 'undefined') return DEFAULT_THEME;
	const stored = localStorage.getItem(STORAGE_KEY);
	return palettes.some((p) => p.id === stored) ? (stored as ThemeId) : DEFAULT_THEME;
}

export const theme = $state({ id: loadInitial() });

export function setTheme(id: ThemeId) {
	theme.id = id;
	if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, id);
}

export function paletteOf(id: ThemeId): Palette {
	return palettes.find((p) => p.id === id) ?? palettes[0];
}

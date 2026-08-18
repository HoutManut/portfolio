<script lang="ts">
	/**
	 * The palette picker: one card per reroll in PALETTES.md, field colour as
	 * the card's ground and a single acid-coloured corner triangle marking the
	 * edge. Swapping cards fades the whole document's drench rather than
	 * snapping — see html.theme-tween in app.css, the same trick the axis rail
	 * uses for --detail/--mono/--casl.
	 */
	import { palettes, theme, setTheme, type ThemeId } from '$lib/theme.svelte';
	import * as m from '$lib/paraglide/messages';

	let tweenTimer: ReturnType<typeof setTimeout> | undefined;

	function choose(id: ThemeId) {
		if (id === theme.id) return;
		const root = document.documentElement;
		root.classList.add('theme-tween');
		setTheme(id);
		clearTimeout(tweenTimer);
		tweenTimer = setTimeout(() => root.classList.remove('theme-tween'), 340);
	}

	$effect(() => {
		const palette = palettes.find((p) => p.id === theme.id) ?? palettes[0];
		const root = document.documentElement;
		root.style.setProperty('--field', palette.field);
		root.style.setProperty('--paper', palette.paper);
		root.style.setProperty('--acid', palette.acid);
		root.style.setProperty('--ink', palette.ink);
		root.style.setProperty('--muted', palette.muted);
		root.style.setProperty('--rule', palette.rule);
		root.style.setProperty('--rule-strong', palette.ruleStrong);
	});
</script>

<section class="theme-selector js-only" aria-label={m.themeSelectorAria()}>
	<span class="legend">{m.themeLegend()}</span>

	<div class="cards">
		{#each palettes as palette (palette.id)}
			<button
				type="button"
				class="card"
				class:active={theme.id === palette.id}
				style="background: {palette.field}; --card-acid: {palette.acid};"
				aria-pressed={theme.id === palette.id}
				aria-label={m.themeOptionAria({ label: palette.label })}
				onclick={() => choose(palette.id)}
			></button>
		{/each}
	</div>
</section>

<style>
	.theme-selector {
		border-top: 1px solid var(--rule);
		margin-top: var(--space-4);
		padding-top: var(--space-4);
	}

	.cards {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-top: var(--space-2);
	}

	.card {
		background: none;
		border: 0;
		cursor: pointer;
		font: inherit;
		height: 2.75rem;
		overflow: hidden;
		padding: 0;
		position: relative;
		transition:
			transform 140ms var(--ease),
			outline-color 140ms var(--ease);
		width: 5.5rem;
	}

	/* The edge: a single acid-coloured corner triangle, not a full border. */
	.card::after {
		border-color: transparent var(--card-acid) transparent transparent;
		border-style: solid;
		border-width: 0 1.1rem 1.1rem 0;
		content: '';
		inset: 0 0 auto auto;
		position: absolute;
	}

	.card:hover {
		transform: translateY(-2px);
	}

	.card:focus-visible {
		outline: 2px solid var(--acid);
		outline-offset: 3px;
	}

	.card.active {
		box-shadow: inset 0 0 0 2px var(--card-acid);
	}
</style>

<script lang="ts">
	/**
	 * The specimen's control panel, and the site's signature interaction.
	 *
	 * Three real axes drive the whole document through registered custom
	 * properties on :root, so one input remaps every row on the page at once
	 * with no per-element JavaScript:
	 *
	 *   DETAIL  how much of each project row is exposed, and how large it is set
	 *   MONO    Recursive's proportional → monospace axis
	 *   CASL    Recursive's casual axis
	 *
	 * DETAIL is the product axis: it is the fast-skim / deep-read dial, and it
	 * deliberately does not open or close a project. Expansion stays with
	 * <details> so the hash stays linkable and aria-expanded stays correct.
	 */
	import { axes, presets } from '$lib/axes.svelte';
	import * as m from '$lib/paraglide/messages';

	type Axis = { key: 'detail' | 'mono' | 'casl'; label: string; tag: string };

	let secondary: Axis[] = $derived([
		{ key: 'mono', label: m.axisMono(), tag: 'MONO' },
		{ key: 'casl', label: m.axisCasual(), tag: 'CASL' }
	]);

	/* Module-level, so every view of the sheet shares one instance. */
	const values = axes;
	let tweenTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const root = document.documentElement;
		root.style.setProperty('--detail', String(values.detail));
		// MONO and CASL are 0–1 axes; the panel shows them in the sheet's 0–1000 units.
		root.style.setProperty('--mono', String(values.mono / 1000));
		root.style.setProperty('--casl', String(values.casl / 1000));
	});

	/** Named instances interpolate; a drag must not, or it lags the finger. */
	function jumpTo(value: number) {
		const root = document.documentElement;
		root.classList.add('tween');
		values.detail = value;
		clearTimeout(tweenTimer);
		tweenTimer = setTimeout(() => root.classList.remove('tween'), 460);
	}

	const activePreset = $derived(presets.find((p) => p.value === values.detail)?.label ?? 'Custom');

	/*
	 * Local UI state, deliberately not in axes.svelte.ts: whether the panel is
	 * open is not an axis value, and it should not follow the visitor across a
	 * client-side navigation the way an instance does. Every view opens collapsed.
	 */
	let open = $state(false);
</script>

<section class="rail js-only" aria-label={m.axisSpecimenAria()}>
	<!--
		Collapsed by default, and in the colophon rather than ahead of the work: an
		instrument the visitor did not ask for should be found, not met. What
		survives the collapse is the readout and the three named instances — the
		fast path — so any instance is still one press away.

		A button with aria-expanded rather than <details>, because the presets ride
		in the same strip and interactive controls inside a <summary> compete with
		it for the click. The rail is .js-only already, so nothing is lost.
	-->
	<div class="strip">
		<span class="legend">{m.axisAxis()}</span>
		<span class="readout">
			<span class="legend" aria-hidden="true">DTL</span>
			<output class="value num" for="axis-detail">{values.detail}</output>
		</span>

		<div class="buttons">
			{#each presets as preset (preset.label)}
				<button
					type="button"
					class="preset"
					class:active={activePreset === preset.label}
					aria-pressed={activePreset === preset.label}
					onclick={() => jumpTo(preset.value)}>{preset.label}</button
				>
			{/each}
		</div>

		<button
			type="button"
			class="toggle"
			aria-expanded={open}
			aria-controls="axis-panel"
			onclick={() => (open = !open)}
		>
			<span class="legend">{m.axisAxesToggle()}</span>
			<svg class="disclose" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
				<line x1="0.5" y1="6" x2="11.5" y2="6" />
				<line class="stem" x1="6" y1="0.5" x2="6" y2="11.5" />
			</svg>
		</button>
	</div>

	<div class="panel" id="axis-panel" hidden={!open}>
		<div class="primary">
			<label class="name" for="axis-detail">{m.axisDetail()}</label>
			<input
				id="axis-detail"
				type="range"
				min="0"
				max="1000"
				step="10"
				bind:value={values.detail}
				aria-label={m.axisDetailAria()}
			/>
			<div class="ticks">
				<span class="num">0</span>
				<span class="num">1000</span>
			</div>
		</div>

		<div class="secondary">
			{#each secondary as axis (axis.key)}
				<div class="row">
					<label class="row-name" for="axis-{axis.key}">{axis.label}</label>
					<input
						id="axis-{axis.key}"
						type="range"
						min="0"
						max="1000"
						step="10"
						bind:value={values[axis.key]}
						aria-label={m.axisRowAria({ label: axis.label, tag: axis.tag })}
					/>
					<output class="row-value num" for="axis-{axis.key}">{values[axis.key]}</output>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.rail {
		border-top: 1px solid var(--rule);
		padding: var(--space-3) 0 var(--space-4);
	}

	/* One hairline-tall line: legend, live readout, the named instances, the mark. */
	.strip {
		align-items: center;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-4);
	}

	.readout {
		align-items: baseline;
		display: flex;
		gap: var(--space-2);
		margin-right: auto;
	}

	.readout .legend {
		display: inline;
	}

	.value {
		color: var(--acid);
		font-size: var(--text-lg);
		letter-spacing: -0.02em;
		line-height: 1;
	}

	.toggle {
		align-items: center;
		background: none;
		border: 0;
		color: var(--muted);
		cursor: pointer;
		display: flex;
		font: inherit;
		gap: var(--space-2);
		padding: var(--space-1) 0;
	}

	.toggle:hover {
		color: var(--acid);
	}

	.toggle .disclose {
		height: 12px;
		width: 12px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.25;
	}

	/* Same mark, same behaviour as a project row's disclosure. */
	.toggle[aria-expanded='true'] .stem {
		transform: scaleY(0);
	}

	.stem {
		transform-origin: 6px 6px;
		transition: transform 220ms var(--ease);
	}

	.panel {
		display: grid;
		gap: var(--space-5);
		grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
		padding-top: var(--space-4);
		/*
		 * Same 220ms as the stem beside it — the mark and the panel are one
		 * disclosure. Opacity only: the panel is sliders, and animating its height
		 * would move the tracks under a finger already reaching for them.
		 *
		 * The `hidden` attribute stays: it is what keeps the closed panel out of the
		 * accessibility tree. allow-discrete is what lets the transition run across
		 * that display change rather than being cut off by it.
		 */
		transition:
			opacity 220ms var(--ease),
			display 220ms var(--ease) allow-discrete;
	}

	.panel[hidden] {
		display: none;
		opacity: 0;
	}

	/* The open state's first frame; without it the panel appears already at 1. */
	@starting-style {
		.panel:not([hidden]) {
			opacity: 0;
		}
	}

	.primary {
		display: grid;
	}

	.name {
		cursor: pointer;
		font-size: var(--text-lg);
		font-variation-settings:
			'MONO' var(--mono),
			'CASL' var(--casl),
			'wght' 400;
		letter-spacing: -0.03em;
		line-height: 1;
	}

	.primary input {
		margin-top: var(--space-3);
	}

	.ticks {
		color: var(--muted);
		display: flex;
		font-size: var(--text-micro);
		grid-column: 1 / -1;
		justify-content: space-between;
		margin-top: var(--space-1);
	}

	.secondary {
		align-content: end;
		display: grid;
		gap: var(--space-2);
	}

	.row {
		align-items: center;
		border-bottom: 1px solid var(--rule);
		display: grid;
		gap: var(--space-3);
		grid-template-columns: 4.5rem 1fr 3ch;
		padding-bottom: var(--space-2);
	}

	.row-name {
		cursor: pointer;
		font-size: var(--text-sm);
	}

	.row-value {
		color: var(--muted);
		font-size: var(--text-sm);
		text-align: right;
	}

	.buttons {
		display: flex;
		gap: 1px;
	}

	.preset {
		background: none;
		border: 1px solid var(--rule);
		color: var(--paper);
		cursor: pointer;
		font: inherit;
		font-size: var(--text-micro);
		font-variation-settings:
			'MONO' 1,
			'CASL' 0,
			'wght' 500;
		letter-spacing: var(--tracking-legend);
		padding: var(--space-2) var(--space-3);
		text-transform: var(--case-legend);
		transition:
			background-color 140ms var(--ease),
			color 140ms var(--ease),
			border-color 140ms var(--ease);
	}

	.preset + .preset {
		border-left: 0;
	}

	.preset:hover {
		border-color: var(--rule-strong);
		color: var(--acid);
	}

	.preset.active {
		background: var(--acid);
		border-color: var(--acid);
		color: var(--ink);
	}

	/* -- the sliders ------------------------------------------------------- */

	input[type='range'] {
		appearance: none;
		background: none;
		cursor: ew-resize;
		display: block;
		height: 1.25rem;
		margin: 0;
		width: 100%;
	}

	input[type='range']::-webkit-slider-runnable-track {
		/* --muted (4.62:1), not --rule: a track states the control's extent, so it is
		   boundary information under WCAG 1.4.11, not a decorative hairline. */
		background: var(--muted);
		height: 1px;
	}

	input[type='range']::-moz-range-track {
		/* --muted (4.62:1), not --rule: a track states the control's extent, so it is
		   boundary information under WCAG 1.4.11, not a decorative hairline. */
		background: var(--muted);
		height: 1px;
	}

	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		background: var(--acid);
		border: 0;
		border-radius: 0;
		height: 0.875rem;
		margin-top: -0.4375rem;
		width: 0.3125rem;
	}

	input[type='range']::-moz-range-thumb {
		background: var(--acid);
		border: 0;
		border-radius: 0;
		height: 0.875rem;
		width: 0.3125rem;
	}

	@media (max-width: 60rem) {
		.panel {
			gap: var(--space-4);
			grid-template-columns: 1fr;
		}
	}

	/*
	 * The two typographic axes are the specimen's fine control and belong to the
	 * wider sheet; on a phone the primary axis and its named instances carry the
	 * rail alone.
	 */
	@media (max-width: 46rem) {
		.rail {
			padding: var(--space-3) 0;
		}

		.strip {
			column-gap: var(--space-3);
		}

		.secondary {
			display: none;
		}

		.primary input {
			margin-top: var(--space-2);
		}
	}
</style>

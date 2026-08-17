<script lang="ts">
	/**
	 * The margin beside a plate, on both read surfaces.
	 *
	 * A plate runs for thousands of pixels; the caption that names it used to run
	 * for about a hundred and fifty and then stop, which left the field beside the
	 * text empty for the whole document. The margin now runs the length of the
	 * plate: the caller's metadata at the top, then the plate's own sections as
	 * numbered marks, sticky, with the one being read set in acid.
	 *
	 * The marks are plate numbers, not a table of contents — a specimen numbers
	 * what it is showing. They are a desktop instrument: below 60rem the aside
	 * reorders above the plate, where a section list ahead of the text would be a
	 * second navigation the reader did not ask for, so only the metadata survives.
	 */
	import type { Snippet } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Heading } from '$lib/content';

	let { headings, children }: { headings: readonly Heading[]; children: Snippet } = $props();

	/*
	 * Empty until the observer speaks. With JavaScript off nothing is marked
	 * current, which is honest: the marks are still real anchors, and a mark that
	 * claimed to track the reader without moving would be a lie.
	 */
	let currentId = $state('');

	$effect(() => {
		if (headings.length === 0) return;

		/*
		 * The Canvas pass in Prose lifts the plate into `<canvas layoutsubtree>`
		 * shortly after mount (Chrome's html-in-canvas path). That lift replaces
		 * the heading elements rather than just repainting them, so a `nodes`
		 * array captured once at effect setup goes stale: every element it
		 * points at reports getBoundingClientRect() top:0 forever after,
		 * regardless of scroll. Looking the headings up fresh on every call
		 * always finds whichever element is currently live.
		 */
		function recompute() {
			const nodes = headings
				.map((heading) => document.getElementById(heading.id))
				.filter((node) => node !== null);
			if (nodes.length === 0) return;

			/*
			 * No room left below the last heading for its section to cross the
			 * activation line — a short final section otherwise leaves the mark
			 * stuck on the second-to-last heading for the rest of the read.
			 */
			const atBottom =
				window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
			if (atBottom) {
				currentId = nodes[nodes.length - 1].id;
				return;
			}

			const line = window.innerHeight * 0.3;
			let active = nodes[0].id;
			for (const node of nodes) {
				if (node.getBoundingClientRect().top <= line) active = node.id;
			}
			currentId = active;
		}

		/*
		 * Scroll-driven, not IntersectionObserver-driven. On the frame the
		 * Canvas lift happens, IntersectionObserver's lone initial callback can
		 * land mid-lift and read the stale geometry above; since the lifted
		 * elements never cross another threshold afterward, that one bad
		 * sample freezes the mark for good. Polling on scroll has no such
		 * single-sample failure mode — the next scroll event self-corrects.
		 */
		let ticking = false;
		function onScroll() {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				recompute();
				ticking = false;
			});
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		recompute();

		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	});
</script>

<aside class="caption">
	{@render children()}

	{#if headings.length > 0}
		<nav class="index" aria-label={m.marginaliaSectionsAria()}>
			<ol>
				{#each headings as heading, i (heading.id)}
					<li>
						<a
							href="#{heading.id}"
							class:current={heading.id === currentId}
							aria-current={heading.id === currentId ? 'true' : undefined}
						>
							<span class="mark num">{String(i + 1).padStart(2, '0')}</span>
							<span class="name">{heading.text}</span>
						</a>
					</li>
				{/each}
			</ol>
		</nav>
	{/if}
</aside>

<style>
	.caption {
		/*
		 * align-self is load-bearing: the grid stretches an item to the row height
		 * by default, which leaves sticky with nothing to travel through.
		 */
		align-self: start;
		/*
		 * Deliberately not scroll-clamped. A max-height plus overflow-y would force
		 * overflow-x to compute to auto as well, and the global focus outline — 2px
		 * at 3px offset — draws outside the border box, so every keyboard focus in
		 * the margin would render clipped. The column does not need the guard:
		 * marks are ~24px each, so twenty of them still fit a laptop viewport.
		 */
		padding-top: var(--plate-pad);
		position: sticky;
		top: var(--space-4);
	}

	.index {
		border-top: 1px solid var(--rule);
		margin-top: var(--space-4);
		padding-top: var(--space-3);
	}

	.index ol {
		display: grid;
		gap: var(--space-2);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.index a {
		align-items: baseline;
		color: var(--muted);
		display: grid;
		font-size: var(--text-micro);
		font-variation-settings:
			'MONO' 1,
			'CASL' 0,
			'wght' 500;
		gap: var(--space-3);
		grid-template-columns: 2ch 1fr;
		letter-spacing: var(--tracking-legend);
		text-decoration: none;
		text-transform: var(--case-legend);
		transition: color 140ms var(--ease);
	}

	.index a:hover,
	.index a.current {
		color: var(--acid);
	}

	/* The number stays quiet on the mark being read: the name is what is current. */
	.index a.current .mark {
		color: var(--muted);
	}

	@media (max-width: 60rem) {
		.caption {
			order: -1;
			padding-top: 0;
			position: static;
		}

		.index {
			display: none;
		}
	}
</style>

<script lang="ts">
	/**
	 * Trim marks on the sheet.
	 *
	 * A printer's crop mark is two hairlines per corner, each running along one
	 * trim line and stopping short of the corner itself — the blade goes where the
	 * lines would meet. They are drawn that way here rather than as an L, because
	 * an L that touches is a corner rule and reads as the start of a box; this
	 * world is ruled, never boxed.
	 *
	 * What they trim is the sheet's *content* box, not the viewport: the gutter is
	 * the sheet's margin, so the arms live in the margin where a press would put
	 * them, and they scroll with the document instead of holding still while the
	 * sheet slides past. The top pair opens the sheet, the bottom pair closes it.
	 *
	 * Deliberately not fixed, not animated, and not axis-driven. Ground.svelte is
	 * already the one moving mark on this site; a second thing to look at is what
	 * the ground's own note rules out. These are inert geometry — they survive
	 * reduced motion and a JavaScript-less visit unchanged, which is more than the
	 * shader does.
	 *
	 * Decoration: aria-hidden, no pointer events, no content.
	 */
</script>

<div class="crop" aria-hidden="true">
	<span class="corner tl"></span>
	<span class="corner tr"></span>
	<span class="corner bl"></span>
	<span class="corner br"></span>
</div>

<style>
	/*
	 * Inset to the trim box: the gutter horizontally, and the sheet's own top pad
	 * mirrored at the foot. The foot inset is what keeps the bottom arms inside the
	 * colophon's trailing space instead of extending past the last element and
	 * lengthening the document.
	 */
	.crop {
		--arm: 0.75rem;
		--gap: 0.375rem;
		bottom: var(--space-5);
		left: var(--gutter);
		pointer-events: none;
		position: absolute;
		right: var(--gutter);
		top: var(--space-5);
	}

	/* Zero-size anchors; the two arms are the pseudo-elements. */
	.corner {
		position: absolute;
	}

	.corner::before,
	.corner::after {
		background: var(--rule);
		content: '';
		position: absolute;
	}

	/* The arm that lies along the horizontal trim line. */
	.corner::before {
		height: 1px;
		width: var(--arm);
	}

	/* The arm that lies along the vertical trim line. */
	.corner::after {
		height: var(--arm);
		width: 1px;
	}

	.tl {
		left: 0;
		top: 0;
	}

	.tl::before {
		left: calc(-1 * (var(--arm) + var(--gap)));
		top: 0;
	}

	.tl::after {
		left: 0;
		top: calc(-1 * (var(--arm) + var(--gap)));
	}

	.tr {
		right: 0;
		top: 0;
	}

	.tr::before {
		right: calc(-1 * (var(--arm) + var(--gap)));
		top: 0;
	}

	.tr::after {
		right: 0;
		top: calc(-1 * (var(--arm) + var(--gap)));
	}

	.bl {
		bottom: 0;
		left: 0;
	}

	.bl::before {
		bottom: 0;
		left: calc(-1 * (var(--arm) + var(--gap)));
	}

	.bl::after {
		bottom: calc(-1 * (var(--arm) + var(--gap)));
		left: 0;
	}

	.br {
		bottom: 0;
		right: 0;
	}

	.br::before {
		bottom: 0;
		right: calc(-1 * (var(--arm) + var(--gap)));
	}

	.br::after {
		bottom: calc(-1 * (var(--arm) + var(--gap)));
		right: 0;
	}

	/*
	 * The arms need margin to sit in, and the gutter is 4vw until it caps at
	 * 3.5rem. Arm plus gap is 18px, so under about 900px the arm starts within a
	 * couple of pixels of the viewport edge and reads as a clipped artifact rather
	 * than as a mark in a margin. 60rem is the width at which the gutter is twice
	 * the arm's reach; below it there is no margin to print in, so nothing prints.
	 */
	@media (max-width: 60rem) {
		.crop {
			display: none;
		}
	}
</style>

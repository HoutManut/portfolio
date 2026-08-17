<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';
	import recursiveLatinFull from '$lib/assets/fonts/recursive-latin-full.woff2';
	import AxisRail from '$lib/components/AxisRail.svelte';
	import CropMarks from '$lib/components/CropMarks.svelte';
	import Ground from '$lib/components/Ground.svelte';
	import Scramble from '$lib/components/Scramble.svelte';
	import { hasPlaceholders } from '$lib/content';
	import { localePath } from '$lib/i18n';
	import { setLocale } from '$lib/locale.svelte';
	import { watchMotionPreference } from '$lib/motion.svelte';
	import * as m from '$lib/paraglide/messages';
	import { deLocalizeHref, getLocaleForUrl, locales, localizeHref } from '$lib/paraglide/runtime';
	import { site } from '$lib/site';

	let { children } = $props();

	const current = $derived(page.url.pathname);
	const currentLocale = $derived(getLocaleForUrl(page.url));

	/*
	 * `m.*()` and `localizeHref` read the locale through `getLocale()`, which has
	 * nothing in Svelte's dependency graph behind it. `$lib/locale.svelte` points
	 * that function at a rune, and this is what keeps the rune in step with the
	 * URL — a pre-effect so the value is in place before this subtree's DOM
	 * updates rather than one flush behind it. Every message in the app becomes
	 * reactive as a result; nothing else here has to ask for the locale by hand.
	 */
	$effect.pre(() => {
		setLocale(currentLocale);
	});

	/**
	 * A specimen sheet shows one body of type in several views. The site's three
	 * routes are those views, so the nav is the sheet's view strip rather than a
	 * separate navigation idiom.
	 */
	const views = $derived([
		{ id: 'work', href: localePath(resolve('/')), label: m.navWork() },
		{ id: 'writing', href: localePath(resolve('/writing')), label: m.navWriting() },
		{ id: 'cv', href: localePath(resolve('/cv')), label: m.navCv() }
	]);

	const rootHref = $derived(localePath(resolve('/')));

	function isActive(href: string) {
		return href === rootHref ? current === rootHref : current.startsWith(href);
	}

	/** The unprefixed path of the page currently on screen, for the locale switcher. */
	const currentBasePath = $derived(deLocalizeHref(current));

	/*
	 * The Scramble decode on WORK/WRITING/CV grows and shrinks each label's
	 * grapheme count over its run (see scramble.ts:visibleLength), so the row's
	 * content width wobbles for the length of the run — dragging the locale
	 * switcher out from under a cursor that just clicked it.
	 *
	 * On cursor-capable devices, both `.view-links` and `.locales` get pinned on
	 * click by their trailing
	 * (right) edge alone — `position: fixed; right: …`, no `left` and no
	 * `width` — so each stays a shrink-to-fit box free to grow or shrink from
	 * its *left* edge as its content decodes, without ever moving the edge
	 * nearest the switcher. Pinning `left` + a frozen `width` instead was tried
	 * first and breaks the moment a label decodes to something *wider* than it
	 * was at click time: a fixed width doesn't grow with it, so the new
	 * characters just overflow the box instead of pushing it outward.
	 *
	 * Pinning `.view-links` alone (leaving `.locales` in normal flow) isn't
	 * enough either — taking `.view-links` out of flow lets `.locales` slide
	 * left into the gap it left behind. Both need to hold at once, which is
	 * also why both are measured before either is touched (see the comments on
	 * lockNav/releaseNav below): pinning one first takes it out of flow and
	 * reflows the other ahead of its own measurement.
	 *
	 * Released once the pointer has left the switcher AND the freeze has held
	 * for at least MIN_LOCK_MS (the scramble run's own duration, see
	 * scramble.ts's `duration` default) — a floor, not a ceiling: leaving early
	 * schedules the release for whenever the floor is reached rather than
	 * cutting the freeze short mid-run, and coming back before then cancels it.
	 * There is no ceiling, because the run's actual length varies with the
	 * label and only the pointer leaving is a real signal that the hold is no
	 * longer needed. Devices without a fine, hover-capable pointer never lock.
	 * Scrolling releases the lock immediately on every device. Eased back to the
	 * flow position with a FLIP so neither
	 * box snaps.
	 */
	const MIN_LOCK_MS = 1100;
	const CURSOR_QUERY = '(hover: hover) and (pointer: fine)';

	let viewLinksEl: HTMLElement | undefined = $state();
	let localesEl: HTMLElement | undefined = $state();
	let navLocked = false;
	let lockedAt = 0;
	let pendingRelease: ReturnType<typeof setTimeout> | undefined;
	let cursorQuery: MediaQueryList | undefined;

	function pin(el: HTMLElement, rect: DOMRect) {
		el.style.transition = 'none';
		el.style.transform = '';
		el.style.position = 'fixed';
		el.style.top = `${rect.top}px`;
		el.style.right = `${document.documentElement.clientWidth - rect.right}px`;
		el.style.margin = '0';
		el.style.zIndex = '2';
	}

	function unpin(el: HTMLElement) {
		el.style.position = '';
		el.style.top = '';
		el.style.right = '';
		el.style.margin = '';
		el.style.zIndex = '';
	}

	/** FLIPs the element from `from` to its current (already-unpinned) position over a quick ease-out. */
	function flipFrom(el: HTMLElement, from: DOMRect) {
		const to = el.getBoundingClientRect();
		const dx = from.left - to.left;
		const dy = from.top - to.top;
		if (dx === 0 && dy === 0) return;

		el.style.transition = 'none';
		el.style.transform = `translate(${dx}px, ${dy}px)`;
		// Force layout so the snap-to-`from` transform above commits before the
		// transition is turned back on for the animated leg.
		void el.offsetWidth;
		el.style.transition = 'transform 200ms var(--ease)';
		el.style.transform = '';

		const onEnd = (event: TransitionEvent) => {
			if (event.target !== el || event.propertyName !== 'transform') return;
			el.style.transition = '';
			el.removeEventListener('transitionend', onEnd);
		};
		el.addEventListener('transitionend', onEnd);
	}

	function lockNav() {
		if (!viewLinksEl || !localesEl || !hasCursor()) return;
		clearTimeout(pendingRelease);
		pendingRelease = undefined;
		if (navLocked) return;

		// Both boxes measured before either is touched: pinning one first would
		// take it out of flow and reflow the other ahead of its own measurement.
		const linksRect = viewLinksEl.getBoundingClientRect();
		const localesRect = localesEl.getBoundingClientRect();
		pin(viewLinksEl, linksRect);
		pin(localesEl, localesRect);
		navLocked = true;
		lockedAt = performance.now();
	}

	function releaseNav() {
		clearTimeout(pendingRelease);
		pendingRelease = undefined;
		if (!navLocked || !viewLinksEl || !localesEl) return;
		navLocked = false;

		const linksFrom = viewLinksEl.getBoundingClientRect();
		const localesFrom = localesEl.getBoundingClientRect();

		// Both boxes released before either is measured for its FLIP target: the
		// two sit in the same flex row, so unpinning just one and measuring it
		// immediately would read a "natural" position computed as if it were
		// alone — the flex row hasn't seen its sibling return yet.
		unpin(viewLinksEl);
		unpin(localesEl);

		flipFrom(viewLinksEl, linksFrom);
		flipFrom(localesEl, localesFrom);
	}

	function unlockNav() {
		if (!navLocked) return;
		const remaining = MIN_LOCK_MS - (performance.now() - lockedAt);
		if (remaining <= 0) {
			releaseNav();
		} else {
			clearTimeout(pendingRelease);
			pendingRelease = setTimeout(releaseNav, remaining);
		}
	}

	function hasCursor() {
		if (typeof window === 'undefined') return false;
		return (cursorQuery ?? window.matchMedia(CURSOR_QUERY)).matches;
	}

	/** The pointer came back before a scheduled release fired: stay pinned. */
	function cancelPendingRelease() {
		clearTimeout(pendingRelease);
		pendingRelease = undefined;
	}

	onMount(() => {
		watchMotionPreference();

		cursorQuery = window.matchMedia(CURSOR_QUERY);
		const releaseWithoutCursor = () => {
			if (!cursorQuery?.matches) releaseNav();
		};
		const releaseOnScroll = () => releaseNav();

		cursorQuery.addEventListener('change', releaseWithoutCursor);
		window.addEventListener('scroll', releaseOnScroll, { passive: true });

		return () => {
			cursorQuery?.removeEventListener('change', releaseWithoutCursor);
			window.removeEventListener('scroll', releaseOnScroll);
			clearTimeout(pendingRelease);
			pendingRelease = undefined;
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link
		rel="preload"
		href={recursiveLatinFull}
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
</svelte:head>

<Ground />

<a class="skip" href="#main">{m.skipToContent()}</a>

{#if hasPlaceholders}
	<!-- A proof pulled before the run is final. The band is the stamp, not an apology. -->
	<p class="proof" role="status">
		<span class="proof-mark">{m.proofMark()}</span>
		<span>{m.proofBodyPre()}<code>README.md</code>{m.proofBodyPost()}</span>
	</p>
{/if}

<div class="sheet">
	<CropMarks />

	<header class="masthead">
		<a class="wordmark" href={rootHref}>
			<span class="mark">{site.name}</span>
			<span class="legend"><Scramble text={m.siteRole()} locale={currentLocale} /></span>
		</a>

		<nav class="views" aria-label={m.navPrimaryAria()}>
			<span class="view-links" bind:this={viewLinksEl}>
				<!--
					Keyed on a stable id rather than the href: the href carries the locale
					prefix, so keying on it would tear down and rebuild every link on a
					switch — and a rebuilt Scramble mounts straight onto the new wording
					with nothing to decode from.
				-->
				{#each views as view (view.id)}
					<a
						class="view"
						class:active={isActive(view.href)}
						aria-current={isActive(view.href) ? 'page' : undefined}
						href={view.href}><Scramble text={view.label} locale={currentLocale} /></a
					>
				{/each}
			</span>

			<span
				class="locales"
				role="group"
				aria-label={m.localeSwitcherAria()}
				bind:this={localesEl}
				onpointerenter={cancelPendingRelease}
				onpointerleave={unlockNav}
			>
				{#each locales as locale (locale)}
					<a
						class="view locale"
						class:active={locale === currentLocale}
						aria-current={locale === currentLocale ? 'page' : undefined}
						href={localizeHref(currentBasePath, { locale })}
						onclick={lockNav}>{locale.toUpperCase()}</a
					>
				{/each}
			</span>
		</nav>

		<a class="contact" href="mailto:{site.email}">
			<span class="legend"><Scramble text={m.contactLegend()} locale={currentLocale} /></span>
			<span class="address">{site.email}</span>
		</a>
	</header>

	<main id="main">
		{@render children()}
	</main>

	<!-- The sheet's last showing: the one line a visitor is meant to act on, set at scale. -->
	<section class="close" aria-label={m.contactLegend()}>
		<a class="address-xl" href="mailto:{site.email}">{site.email}</a>
		<ul class="elsewhere">
			{#each site.links as link (link.href)}
				<li>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- absolute off-site URLs from site.ts -->
					<a href={link.href} rel="me noreferrer">{link.label}</a>
				</li>
			{/each}
		</ul>
	</section>

	<!--
		The colophon names the typeface; the rail is what drives it, so the two
		belong together. Keeping the instrument here rather than above the work also
		means it is present on every route — including the two read surfaces, which
		inherit MONO and CASL from the document and used to offer no way back.
	-->
	<footer class="colophon">
		<p class="set">
			{m.colophonSetPre()}<strong>Recursive</strong>{m.colophonSetMid()}<strong>Typst 0.15</strong
			>{m.colophonSetPost()}
		</p>

		<AxisRail />
	</footer>
</div>

<style>
	.skip {
		background: var(--acid);
		color: var(--ink);
		left: var(--gutter);
		padding: var(--space-2) var(--space-3);
		position: absolute;
		top: 0;
		transform: translateY(-200%);
		/* The first keyboard interaction on the site: it arrives, it does not pop. */
		transition: transform 140ms var(--ease);
		z-index: 2;
	}

	.skip:focus {
		transform: none;
	}

	/*
	 * Positioned so it paints above the Ground layer: Ground is fixed at z-index 0,
	 * and a positioned element outranks static in-flow content whatever the order.
	 */
	.proof {
		align-items: baseline;
		background: var(--acid);
		color: var(--ink);
		position: relative;
		z-index: 1;
		display: flex;
		flex-wrap: wrap;
		font-size: var(--text-micro);
		font-variation-settings:
			'MONO' 1,
			'CASL' 0,
			'wght' 500;
		gap: var(--space-2) var(--space-3);
		letter-spacing: var(--tracking-legend);
		margin: 0;
		padding: var(--space-2) var(--gutter);
		text-transform: var(--case-legend);
	}

	.proof-mark {
		font-variation-settings:
			'MONO' 1,
			'CASL' 0,
			'wght' 800;
		letter-spacing: var(--tracking-legend);
	}

	.proof code {
		font-size: 1em;
		letter-spacing: 0.04em;
		text-transform: none;
	}

	.sheet {
		display: flex;
		flex-direction: column;
		margin: 0 auto;
		max-width: var(--sheet);
		min-height: 100dvh;
		padding: var(--space-5) var(--gutter) 0;
		position: relative;
		z-index: 1;
	}

	.masthead {
		align-items: start;
		display: grid;
		gap: var(--space-4);
		grid-template-columns: auto 1fr auto;
	}

	.wordmark {
		display: grid;
		gap: 0.15rem;
		text-decoration: none;
	}

	.mark {
		font-size: 1.25rem;
		font-variation-settings:
			'MONO' 1,
			'CASL' var(--casl),
			'wght' 800;
		letter-spacing: 0.16em;
		line-height: 1;
		text-transform: uppercase;
	}

	.views {
		display: flex;
		gap: var(--space-4);
		justify-content: center;
		padding-top: 0.2rem;
	}

	/* Its own flex child, not a grid item — shrink-wraps to content with no
	   slack, which is what the lock in +layout.svelte's script relies on. */
	.view-links {
		display: flex;
		gap: var(--space-4);
	}

	.view {
		border-bottom: 2px solid transparent;
		font-size: var(--text-micro);
		font-variation-settings:
			'MONO' 1,
			'CASL' 0,
			'wght' 500;
		letter-spacing: var(--tracking-legend);
		padding-bottom: var(--space-1);
		text-decoration: none;
		text-transform: var(--case-legend);
		transition:
			border-color 140ms var(--ease),
			color 140ms var(--ease);
	}

	.view:hover {
		border-bottom-color: var(--rule-strong);
	}

	.view.active {
		border-bottom-color: var(--acid);
		color: var(--acid);
	}

	/* The locale switcher rides in the same view strip, set apart by a hairline rather than a new idiom. */
	.locales {
		border-left: 1px solid var(--rule);
		display: flex;
		gap: var(--space-4);
		margin-left: var(--space-1);
		padding-left: var(--space-4);
	}

	/*
	 * EN/JA/KM are Latin codes, not the page's running text — they keep the
	 * Latin tracking/case rule regardless of which locale :lang() is currently
	 * zeroing it for (see the :lang(ja), :lang(km) block in app.css).
	 *
	 * Set on `.locales` itself this would only be *inherited* by these links,
	 * and `:lang(ja)`/`:lang(km)` is a bare pseudo-class — equivalent to
	 * `*:lang(ja)` — so it matches these `<a>` elements directly too, and a
	 * direct match beats an inherited value regardless of which rule has the
	 * higher specificity. Targeting the links themselves here, at two classes'
	 * specificity, is what actually outranks it.
	 */
	.locales .view {
		--tracking-legend: 0.14em;
		--case-legend: uppercase;
	}

	.contact {
		display: grid;
		gap: 0.15rem;
		justify-items: end;
		text-align: right;
		text-decoration: none;
	}

	.address {
		font-size: var(--text-sm);
		text-decoration: underline;
		text-decoration-color: var(--rule-strong);
		text-underline-offset: 0.22em;
	}

	.contact:hover .address {
		text-decoration-color: var(--acid);
	}

	/*
	 * Deliberately not flex: 1. A sheet ends where its content ends; stretching
	 * main to the viewport floor pushes the close away and leaves a dead band on
	 * short views like a one-post writing index.
	 */
	main {
		flex: 0 0 auto;
	}

	.close {
		align-items: end;
		border-top: 1px solid var(--rule);
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3) var(--space-5);
		justify-content: space-between;
		margin-top: var(--space-7);
		padding-top: var(--space-5);
	}

	/* Deliberately set below a project title: the close is the last word, not the loudest. */
	.address-xl {
		font-size: clamp(1rem, 3.2vw, 3rem);
		font-variation-settings:
			'MONO' 1,
			'CASL' var(--casl),
			'wght' 500;
		letter-spacing: -0.03em;
		line-height: 1;
		text-decoration: none;
		transition: color 160ms var(--ease);
	}

	.address-xl:hover {
		color: var(--acid);
	}

	.colophon {
		padding: var(--space-5) 0 var(--space-6);
	}

	.set {
		color: var(--muted);
		font-size: var(--text-sm);
		margin: 0 0 var(--space-4);
		max-width: 46ch;
	}

	.set strong {
		color: var(--paper);
		font-variation-settings:
			'MONO' var(--mono),
			'CASL' var(--casl),
			'wght' 600;
	}

	.elsewhere {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		list-style: none;
		margin: 0;
		padding: 0 0 0.4rem;
	}

	.elsewhere a {
		font-size: var(--text-micro);
		font-variation-settings:
			'MONO' 1,
			'CASL' 0,
			'wght' 500;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	@media (max-width: 46rem) {
		.sheet {
			padding-top: var(--space-4);
		}

		/*
		 * Two rows, not four: the name and the contact address share a baseline,
		 * the view strip sits under them, and the work starts inside the first
		 * viewport — which is what the site is for.
		 */
		.masthead {
			column-gap: var(--space-3);
			grid-template-columns: auto 1fr;
			row-gap: var(--space-3);
		}

		.contact {
			align-self: center;
			grid-column: 2;
			grid-row: 1;
		}

		.contact .legend {
			display: none;
		}

		.views {
			grid-column: 1 / -1;
			grid-row: 2;
			gap: var(--space-4);
			justify-content: start;
			padding-top: 0;
			width: 100%;
			/* Keep the second masthead row when its children are position: fixed. */
			min-height: 1.5rem;
		}

		.view-links,
		.locales {
			flex: 0 0 auto;
			white-space: nowrap;
		}

		.locales {
			margin-left: auto;
		}

		.close {
			margin-top: var(--space-6);
		}
	}

	@media (max-width: 30rem) {
		.proof {
			font-size: 0.625rem;
		}

		.address {
			font-size: var(--text-xs);
		}
	}
</style>

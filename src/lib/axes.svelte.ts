/**
 * The specimen's axis state, shared by every view that shows the rail.
 *
 * It lives outside the component because the axes belong to the document, not
 * to one page: the values are written onto :root as registered custom
 * properties, and a client-side navigation does not tear that down. Holding the
 * state here means a second rail adopts the current instance instead of
 * resetting it, so a given URL never renders at two different densities
 * depending on how the visitor arrived.
 *
 * These must agree with the `initial-value` of each @property in app.css: that
 * is what a no-JS visitor is served, and the rail adopting a different instance
 * on hydration would reflow the document under them. 650 is REVIEW and MONO 200
 * is the fifth of the axis the sheet is set at — see the notes in app.css.
 */
export const axes = $state({ detail: 650, mono: 200, casl: 0 });

export const presets = [
	{ label: 'Skim', value: 0 },
	{ label: 'Review', value: 650 },
	{ label: 'Full', value: 1000 }
];

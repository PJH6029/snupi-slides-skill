# Template HTML workflow (EN)

Use this when drafting slide HTML. The bundled files under `assets/template-html/` are the primary visual source of truth.

## Files to read first
- `assets/template-html/index.html`
- `assets/template-html/styles.css`
- `assets/template-html/deck.js` only for viewer behavior, not for content rules

## How to use the template
- Treat each `<section class="slide ...">` block in `index.html` as a master slide archetype.
- Recreate the closest archetype in each `slides-grab` `slide-XX.html` file rather than inventing a fresh layout.
- Preserve the global grammar:
  - top and bottom accent bars,
  - white paper background,
  - footer logo/date/page structure,
  - serif-forward headings,
  - wide margins and centered visual emphasis.

## Slide archetype map
- `slide-1`: title slide
- `slide-2`, `slide-3`, `slide-8`, `slide-10`: list or text slides
- `slide-4`: single dominant figure slide
- `slide-5`: anti-pattern gallery or multi-image comparison only when truly needed
- `slide-6`: equation or diagram with one short supporting note
- `slide-7`: example of what to avoid; only use this style when the presentation explicitly needs a contrast slide
- `slide-9`: meeting-log title slide

## Practical drafting rules
- Use the template HTML as the basis for spacing, footer placement, accent color, and title treatment.
- Translate the visual structure into `slides-grab`-compatible slide files; do not copy the multi-slide deck verbatim into one file.
- When in doubt, match the HTML template first and the legacy PPTX/PDF second.
- If the user asks for a custom visual departure, state clearly which rule you are breaking and why.

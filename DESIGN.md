# ShopBoard Design Reference

## Reference

This redesign uses the user-supplied Pinterest reference as inspiration:

- Pinterest reference: <https://pin.it/7lMeTPoP3>
- User-provided reference image: inspected locally by the implementation team.

The local image is not copied into this repository. The Pinterest page was not
opened during this work; design decisions came from the user-provided local
image only. It was not used as a source of product imagery or branding.

## Ideas adapted for ShopBoard

The reference informed the visual hierarchy rather than the content or brand:

- A dark, editorial storefront surface with a focused blue light source.
- A large hero with one clear headline, concise supporting copy, and a primary
  call to action.
- Compact navigation and filter controls that read as a category-navigation
  layer above the catalog.
- Elevated product cards with consistent artwork areas, product metadata,
  price, and direct actions.
- Distinct raised surfaces for the cart, product details, checkout, messages,
  and toasts.

ShopBoard keeps its own name, bags, shoes, accessories, API catalog, local
artwork, and demo-only checkout language. It does not use the reference's
branding, electronics, product images, discounts, reviews, or service claims.

## Visual system

- Background: `#060b12` to `#090f18` dark navy surfaces.
- Panels: `#0e1622` and `#141f2f` with `#2b3a50` borders.
- Accent: cobalt `#4b7cff`, with `#78a2ff` for highlight and focus detail.
- Text: `#edf4ff`; muted supporting text: `#9baac0`.
- Feedback: `#62c99a` success and `#ff8a93` error accents.
- Typography: the installed system UI stack, with large, bold sans-serif
  display headings and compact uppercase eyebrow labels.
- Spacing: 8px-based gaps, 10-16px component radii, and 18-24px major section
  radii for the hero and elevated surfaces.

## Component conventions

- Primary actions are cobalt filled buttons; secondary controls use dark
  surfaces and visible borders.
- Product cards use a bordered dark panel, a local-artwork stage, a compact
  uppercase category label, and clear cart/detail actions.
- Search, category selection, sorting, status messages, dialogs, cart, and
  checkout all use the same dark panel, border, and cobalt-focus language.
- API-derived text is created with DOM elements and `textContent`, preserving
  safe rendering while matching the visual system.

## Responsive and accessibility decisions

- The layout is mobile-first; product cards grow from one column to two and
  then three columns.
- Small screens retain touch-sized controls and allow the filter chips to
  scroll horizontally rather than force page overflow.
- The hero reduces its visual height on small screens, while the existing cart
  and dialog layouts remain constrained to the viewport.
- Focus indicators use a high-contrast light-blue outline.
- Existing semantic regions, labels, live regions, dialogs, keyboard handling,
  and the single page `h1` are preserved.
- `prefers-reduced-motion` disables smooth scrolling and shortens visual
  transitions.

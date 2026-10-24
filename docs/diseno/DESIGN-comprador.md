---
name: Andean Cyber Tech
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#41e575'
  on-secondary: '#003915'
  secondary-container: '#06c85d'
  on-secondary-container: '#004d1f'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#66ff8e'
  secondary-fixed-dim: '#3de273'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005322'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#111317'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style
The design system powers an electronics retail experience tailored for the Peruvian market, balancing technical authority with mobile-first accessibility. The identity reflects a clean, modern dark-mode tech aesthetic: precision-engineered, dependable, and swift. 

Visual characteristics draw from modern utilitarianism and sleek consumer technology interfaces. Interfaces prioritize high contrast against deep slate backdrops, micro-interactions that communicate reliability, and an immediate path to conversion via conversational commerce. Visual density is calibrated for rapid navigation, product verification, and seamless checkout via WhatsApp.

## Colors
The color architecture relies on a specialized dark palette engineered to minimize glare, highlight hardware product photography, and visually distinguish interface interactions from checkout actions.

- **Background Canvas (`#0F1115`)**: Deep charcoal-slate foundation providing an immersive stage for electronics imagery without pure-black OLED smearing.
- **Surface & Containers (`#181B22`)**: Slightly elevated slate layer used for cards, sheets, headers, and form groupings.
- **Borders & Dividers (`#282D37`)**: Crisp structural lines used for segmenting content, outlining interactive inputs, and defining card perimeters.
- **Text & Content**: Primary typography rests at `#F3F4F6` (95% contrast ratio against canvas), while supporting specifications, metadata, and labels use `#9CA3AF`.
- **Primary Accent (`#3B82F6`)**: Directs utility actions, link states, active filter chips, badge highlights, and standard interface navigation.
- **Conversion Accent (`#25D366`)**: Reserved strictly for WhatsApp checkout CTAs, immediate customer support triggers, and direct-to-chat fulfillment interactions to ensure unmistakable visual primacy.

## Typography
Inter is implemented universally across headlines, body copy, and UI controls for maximum legibility on mobile viewports. Given the technical nature of electronics catalogs (model numbers, wattages, technical specs, and PEN currency pricing), numerical clarity and optical neutrality are critical.

- **Numbers & Pricing**: Currency symbols (`S/`) and price figures utilize tabular lining figures (`font-variant-numeric: tabular-nums`) with `font-weight: 700` to prevent layout shift during price recalculations.
- **Hierarchy Rules**: Product titles must not exceed `headline-sm` on mobile listing views to prevent vertical bloat. Technical specs (RAM, storage, voltage) default to `label-md` or `body-sm` in secondary text color (`#9CA3AF`).

## Layout & Spacing
The layout model is anchored to a 390px baseline viewport using a fluid 4-column grid designed for one-handed mobile ergonomics.

- **Margins & Gutters**: Fixed 16px (`1rem`) outer canvas margins ensure full touch safety away from screen bevels. Internal grid gutters are set to 12px (`0.75rem`) to allow dual-column product cards without clipping descriptive text or imagery.
- **Rhythm**: Vertical flow follows a strict 4px/8px modular scale. Dense content groupings (e.g., product badges and tags) rely on `space-xs` (4px) and `space-sm` (8px). Structural separation between card blocks and form elements uses `space-lg` (16px) to `space-xl` (24px).
- **Sticky Actions**: The bottom of the viewport is reserved for a persistent 64px dock accommodating the dual-button cart summary and WhatsApp direct-checkout CTA, offset with safe-area inset padding.

## Elevation & Depth
Depth is created through subtle surface luminosity stepping and delicate 1px border definition rather than intense drop shadows.

- **Surface Tiers**: Base canvas rests at `#0F1115`. Content containers, listing cards, and bottom sheets use `#181B22`. Overlays, dropdown menus, and popovers use a slightly lighter slate (`#21252E`).
- **Low-Contrast Outlines**: Every surface layer is enclosed with a 1px solid border in `#282D37`. This maintains edge contrast between the dark surface and dark background.
- **Shadows**: Shadows are reserved strictly for floating bottom bars and modal overlays. When deployed, use an ambient, tinted profile: `0 12px 32px -4px rgba(0, 0, 0, 0.65)`.
- **Active State Elevation**: Interactive components do not rise in physical elevation on tap; instead, borders brighten to `#3B82F6` or surface fills adjust by 4% opacity.

## Shapes
The visual identity embraces a refined, modern rounded profile that softens technical hardware imagery while maintaining UI structure.

- **Primary Geometry (16px / `rounded-lg`)**: Applied uniformly to cards, input containers, product thumbnail frames, bottom sheets, and primary action buttons.
- **Compact Geometry (8px / `rounded`)**: Used for secondary chips, filter pills, badge tags, and quantity counters.
- **Full Radius (`rounded-full`)**: Strictly reserved for circular icon-only buttons (such as quick-share, favorite, or clear search buttons).

## Components

### Buttons
- **WhatsApp Checkout Button (Primary Conversion)**: Built with background `#25D366`, label text `#FFFFFF` (or rich dark `#0F1115` for increased outdoor sunlight legibility), 16px corner radius, and minimum height of 48px. Features the official WhatsApp glyph pinned to the leading edge.
- **Primary Tech Action**: Background `#3B82F6`, text `#FFFFFF`, height 48px, radius 16px. Used for "Add to Cart", "Apply Filters", and primary form submissions.
- **Secondary / Ghost**: Transparent fill, 1px solid border `#282D37`, text `#F3F4F6`. Used for auxiliary specs, comparison views, and secondary navigation.

### Cards
- **Product Card**: Built on `#181B22` with a 16px border-radius and 1px border `#282D37`. Image containers within cards feature an internal rounded top tier, subtle dark vignette, and fixed aspect ratio (1:1). Price displays in bold `#F3F4F6` with secondary retail/discount tags in `#9CA3AF`.

### Input Fields
- **Search & Text Inputs**: Background `#181B22`, 1px border `#282D37`, 16px border-radius, 48px height. Text input is `#F3F4F6` with placeholder text set to `#9CA3AF`. On focus, the border shifts crisply to `#3B82F6` with an optional 1px subtle glow (`rgba(59, 130, 246, 0.25)`).

### Chips & Filter Pills
- **Active Filter**: Background `rgba(59, 130, 246, 0.15)`, border 1px solid `#3B82F6`, text `#3B82F6`.
- **Inactive Filter**: Background `#181B22`, border 1px solid `#282D37`, text `#9CA3AF`. Radius is set to 8px for dense multi-row stacking.

### Lists & Technical Specifications
- Spec rows inside product views use alternating row zebra-striping (`#181B22` and `#0F1115`) separated by a hairline divider `#282D37`. Key names occupy 40% width in `#9CA3AF`, values occupy 60% width in `#F3F4F6`.

### Checkboxes & Radios
- Square with 4px radius (checkbox) or circular (radio), 20px diameter, border 2px solid `#282D37`. When selected, fill is `#3B82F6` with white vector check/dot glyphs.

### WhatsApp Order Drawer (Specialized Component)
- A slide-up bottom sheet anchored with 16px top corner radius, containing pre-formatted order summary strings, delivery address input for Lima/provinces, and a final large-format CTA triggering the WhatsApp URL scheme (`https://wa.me/...`) with automated message payloads.
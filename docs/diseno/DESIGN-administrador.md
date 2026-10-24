---
name: Chaski Store Admin
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
  secondary: '#ffb3ad'
  on-secondary: '#68000a'
  secondary-container: '#a40217'
  on-secondary-container: '#ffaea8'
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
  secondary-fixed: '#ffdad7'
  secondary-fixed-dim: '#ffb3ad'
  on-secondary-fixed: '#410004'
  on-secondary-fixed-variant: '#930013'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#111317'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
typography:
  display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes a focused, high-utility dark management interface for store administration. It serves retail operators and store managers who prioritize efficiency, speed of data entry, inventory precision, and clear visual hierarchy on desktop monitors.

The aesthetic fuses modern minimalism with utilitarian precision. It eliminates decorative flourishes, ambient illustrations, unrequested metrics widgets, and ambient noise. The emotional tone is authoritative, clean, controlled, and focused, ensuring data scanning and transaction actions occur without visual fatigue.

## Colors

The palette is strictly bounded to high-contrast functional roles against deep dark foundations:

- **Canvas Background (`#0F1115`)**: The core application viewport background.
- **Surface / Containers (`#181B22`)**: Structural cards, table wrappers, modals, and input fields.
- **Structural Borders (`#262B36`)**: Subtle, crisp dividers and bounding borders for cards, inputs, and row separators.
- **Primary Text (`#F3F4F6`)**: Primary content, headings, table cells, and active states.
- **Secondary Text (`#9CA3AF`)**: Labels, metadata, captions, placeholders, and inactive states.
- **Primary Accent (`#3B82F6`)**: Primary interactive triggers, active links, focus rings, and confirmed calls to action.
- **Destructive Accent (`#EF4444`)**: Restricted exclusively to irreversible actions, notably the 'Quitar' (Remove) trigger.

## Typography

Typography relies entirely on the Inter typeface family across all screen applications, leveraging its tall x-height and mechanical legibility for tabular views and data forms.

- **Headlines & Displays**: Semibold weights (`600`) with tight letter spacing for concise panel headers and section anchors.
- **Body & Data Tables**: Regular weights (`400`) at 14px and 13px for dense operational tables, inventory listings, and text fields.
- **Labels & Form Indicators**: Medium weights (`500`) at 13px and 12px to clearly designate metadata and field labels without visual clutter.

## Layout & Spacing

The layout is optimized strictly for desktop screens with a reference canvas width of 1440px.

- **Grid Architecture**: 12-column layout with 24px gutters (`1.5rem`) and 32px (`2rem`) outer boundaries. Maximum container width is constrained to 1376px to prevent wide-scanning eye strain across ultrawide monitors.
- **Vertical Rhythm**: A strict 8px baseline grid coordinates component heights and row offsets. Micro-spacings (`0.25rem` and `0.5rem`) separate label-input pairs and icon-text combinations; macro-spacings (`1.5rem` and `2rem`) segregate data tables and structural card containers.
- **No Unsolicited Drawers or Sidebars**: Full-width linear header navigation or localized top-bar actions prioritize horizontal screen real estate for tabular data.

## Elevation & Depth

Visual hierarchy is communicated purely through tonal surface separation and subtle border framing, rather than heavy, blurry drop shadows.

- **Flat Layering**: The canvas background `#0F1115` provides the baseline floor. Elevate content exclusively through the `#181B22` surface container.
- **Low-Contrast Outlines**: Every surface card, panel, and table perimeter uses a uniform 1px solid stroke of `#262B36`. Shadows are avoided, ensuring sharp edge delineation across dark panels.
- **Overlays & Modals**: For critical modals and dialogs, a 60% opacity `#0F1115` backdrop scrim is paired with the `#181B22` surface and an active border of `#262B36`.

## Shapes

The geometric signature is defined by consistent 16px corner radii (`rounded-2xl`) across major structural components:

- **Cards, Panels & Table Shells**: Fixed 16px border-radius, creating smooth rectangular structures framed by `#262B36`.
- **Inputs & Standard Action Buttons**: Align with the 16px curve specification to maintain cohesion across interactable containers.
- **Small Chips & Badges**: 8px (`rounded-lg`) to retain typographic proportion when height is constrained below 28px.

## Components

### Buttons
- **Primary Button**: Solid `#3B82F6` background, `#F3F4F6` text, 16px border radius, font-size 14px with `font-weight: 500`. Height 40px, horizontal padding 16px. Hover state brightens slightly to `#60A5FA`; active state drops to `#2563EB`. Focus state displays a 2px outline of `#3B82F6` offset by 2px `#0F1115`.
- **Destructive Button ('Quitar')**: Solid `#EF4444` background or transparent with a 1px border of `#EF4444` and text `#EF4444`. When solid: `#F3F4F6` text, height 36px or 40px, 16px border radius. Hover state transitions to `#DC2626`.
- **Secondary / Ghost Button**: Background `#181B22`, 1px border `#262B36`, text `#F3F4F6`. Hover state updates border to `#3B82F6`.

### Input Fields & Selects
- **Base Style**: Background `#181B22`, 1px border `#262B36`, text `#F3F4F6`, placeholder text `#9CA3AF`. Corner radius 16px. Height 40px with 12px horizontal padding.
- **States**: On focus, the border shifts directly to `#3B82F6` with no blur shadow. On invalid state, the border shifts to `#EF4444`.

### Tables
- **Container**: Wrapped in a parent `#181B22` surface with 1px `#262B36` border and 16px corner radius.
- **Header Row**: Border-bottom 1px solid `#262B36`, text `#9CA3AF`, 12px uppercase label styling, 12px vertical padding, 16px horizontal cell padding.
- **Data Rows**: Background `#181B22`, border-bottom 1px solid `#262B36`, text `#F3F4F6`, 14px regular font, row height 48px. Row hover transitions surface subtly to `#1F232C`. The final row retains the bottom 16px curved corners of the outer wrapper.

### Cards & Panels
- Background `#181B22`, 1px border `#262B36`, 16px border-radius. Internal padding set to 24px (`space-lg`). Cards contain direct information hierarchies without superfluous decorative elements.

### Checkboxes & Radios
- Size 18x18px. Default state: background `#0F1115`, 1px border `#262B36`, 4px border-radius (checkbox) or circular (radio). Selected state: background `#3B82F6`, border `#3B82F6`, with a `#F3F4F6` check mark.

### Inline Links
- Color `#3B82F6`, regular weight (`400`), no default underline. Displays underline on hover.
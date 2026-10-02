---
name: Ethos Monolith
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dcdddd'
  on-secondary-container: '#5f6161'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  nav-link:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  section-gap: 120px
---

## Brand & Style

The brand identity of this design system is rooted in **Modern Minimalism** with a focus on editorial luxury. It targets a discerning clientele that values tradition through a contemporary lens. The visual language aims to evoke a sense of "quiet luxury"—where the absence of clutter emphasizes the quality of the craftsmanship.

The style leverages generous whitespace to create a gallery-like experience. High-quality product photography is treated as the primary visual anchor, while the UI serves as a sophisticated frame. The emotional response is one of calm, exclusivity, and structural integrity.

## Colors

The palette is strictly monochromatic to ensure the colors of the abayas and the textures of the fabrics remain the focal point. 

- **Pure White (#FFFFFF):** Used for the primary background to maximize light and space.
- **Deep Black (#000000):** Reserved for primary typography, icons, and solid-state buttons to provide a strong visual anchor.
- **Soft Grays (#F5F5F5, #EAEAEA):** Used for subtle section differentiation, hover states, and hairline borders.

The "Color Mode" is fixed to Light to maintain the airy, ethereal aesthetic required for high-end fashion e-commerce.

## Typography

This design system employs a classic serif/sans-serif pairing to balance heritage with modernity.

- **Headline (Noto Serif):** Chosen for its elegant proportions and rhythmic serifs. It should be used for editorial titles, product names, and section headers.
- **Body & Navigation (Inter):** A neutral, highly legible sans-serif that ensures clarity in product descriptions and utility links. 

Letter spacing is intentionally wider for navigation and labels to evoke a premium, "spaced-out" feel typical of luxury brands. Headlines should feature tighter tracking for a more cohesive, impactful look.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop to maintain strict editorial control, transitioning to a fluid model on smaller devices. 

- **Grid:** A 12-column grid is used for desktop layouts, with a significant 64px outer margin to frame the content.
- **Rhythm:** An 8px base unit governs all internal spacing. Large vertical gaps (120px+) between sections are encouraged to give the eyes "room to breathe."
- **Alignment:** Content should predominantly use left-alignment for text blocks, while product grids remain strictly symmetrical.

## Elevation & Depth

This design system rejects traditional shadows in favor of **Low-Contrast Outlines** and **Tonal Layers**. 

- **Depth through Layering:** Depth is created by placing elements on light gray backgrounds (#F5F5F5) against the pure white page background.
- **Borders:** Use 1px solid borders (#EAEAEA) to define containers. For interactive elements like buttons, use 1px solid black borders.
- **Flat Aesthetic:** No blur, drop shadows, or gradients should be used. The interface should feel like a high-quality print magazine.

## Shapes

The shape language is defined by **Sharp Geometric Edges**. 

- **Primary Radius:** 0px. All buttons, input fields, and image containers must have crisp 90-degree corners to convey architectural strength and precision.
- **Exception:** Small icons may have internal curves, but their containers remain square.
- **Masking:** Use archival shapes (arches) for featured product photography to break the grid occasionally and add a touch of classic elegance.

## Components

### Buttons
- **Primary:** Solid black background, white Inter text (Medium weight, 14px), uppercase. No rounding.
- **Secondary/Ghost:** Transparent background, 1px black border, black text.
- **Tertiary:** Text-only with a 1px black underline that expands on hover.

### Input Fields
- Underline style only: A 1px bottom border (#000000). Labels should be small caps (Inter, 12px) positioned above the line.

### Cards
- **Product Cards:** Borderless with the image taking up 100% of the card width. Product names in Noto Serif (18px) followed by price in Inter (14px).
- **Collection Cards:** Use the arch-top mask for images to create a boutique feel.

### Navigation
- A centered or left-aligned logo in a custom bold serif. 
- Navigation links use Inter 14px with wide letter-spacing.
- Use a "sticky" header that shrinks slightly on scroll to maintain utility without sacrificing screen real estate.

### Chips & Tags
- Rectangular with 1px gray borders. Text in Inter 12px, black, uppercase.
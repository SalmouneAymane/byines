# ByInes Design System — Elegant Warm Modesty (Original Remake)

## Brand Identity & Aesthetic
The ByInes remake follows the authentic **ByInes Luxury Soft Aesthetic** captured from the original store design. It features warm neutral tones, soft rounded geometries (`rounded-xl`, `rounded-2xl`, `rounded-full`), refined serif typography (*Noto Serif*), and elegant whitespace.

---

## 1. Color Palette Tokens

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `bg-body` | `#F7F5F0` / `#F4F1EA` | Warm soft nude/beige background for page body. |
| `bg-header` / `bg-footer` | `#FFFFFF` | Crisp white for sticky header and footer. |
| `surface-card` | `#EFECE6` / `#E8E5DF` | Soft warm beige tone for collection banner cards. |
| `primary-text` | `#2C2926` / `#1A1817` | Soft obsidian for headlines, body text, and links. |
| `muted-text` | `#7A7672` | Subtle gray for price subtitles and metadata. |
| `border-line` | `#E5E2DC` | Soft hairline borders for card dividers and inputs. |
| `btn-black` | `#1A1817` | Solid black for primary CTA buttons (e.g. SUBSCRIBE). |
| `btn-white` | `#FFFFFF` | Solid white for Hero CTA button (`START SHOPPING`). |

---

## 2. Typography Rules

- **Brand Logo & Section Titles**: `font-serif` (*Noto Serif* or *Playfair Display*).
  - Logo: `Byines` font serif, 24px - 28px, elegant letterform.
  - Section Headings (`Popular Picks`, `Browse by Category`, `Coffee collection`): `font-serif`, `fontSize: 32px`, `fontWeight: 400`, centered.
  - Product Titles: `font-serif`, `fontSize: 14px`, `fontWeight: 400`, lowercase/titlecase.
- **Navigation & Subtitles**: `font-sans` (*Inter*).
  - Header Nav Links: `fontSize: 11px`, `fontWeight: 500`, `letterSpacing: 0.15em`, uppercase (`NEW ARRIVALS`, `COLLECTIONS`, `ABOUT`).
  - Prices: `fontSize: 13px`, `fontWeight: 400`, `$35.00`.

---

## 3. Shape & Geometry

- **Hero Banner Button**: White rectangle (`bg-white text-black font-semibold tracking-[0.15em] py-3 px-8 hover:bg-stone-100`).
- **Product Card Images**: Soft rounded corners (`rounded-xl` or `rounded-[14px]`).
- **Collection Banner Cards**: Large soft rounded container (`rounded-2xl bg-[#EFECE6] p-8`).
- **Category Icons**: Perfect circular image masks (`w-40 h-40 rounded-full object-cover shadow-sm`).
- **Quick-Add Bag Button**: Floating white circular badge on product card top-right (`w-8 h-8 rounded-full bg-white/90 shadow-sm border border-stone-200 flex items-center justify-center`).

---

## 4. Component Layout Specifications

### Header & Navigation
- White background (`bg-white border-b border-line`).
- Left/Center logo: `Byines` (serif).
- Nav links center-left: `NEW ARRIVALS` (`#shop`), `COLLECTIONS` (`#collections`), `ABOUT` (`#about`).
- Right actions: Search icon, Shopping bag icon with small dark count badge (`0`), User account icon.

### Hero Section
- Full-width hero image (street photography / coat model walking).
- Overlay text centered: `Timeless Elegance` in large white serif font (`text-5xl md:text-6xl text-white font-serif`).
- Centered white button: `START SHOPPING` (`bg-white text-black text-xs uppercase tracking-[0.15em] py-3.5 px-8 font-semibold hover:bg-stone-100`).

### Popular Picks (Product Grid)
- 4-column layout (`grid-cols-2 md:grid-cols-4 gap-6`).
- Product card: Rounded image container (`rounded-xl`), floating quick-add icon top-right, title in serif below image, price in small gray text.

### Collection Cards Grid
- 2-column layout (`grid-cols-1 md:grid-cols-2 gap-8`).
- Soft beige card background (`bg-[#EFECE6] rounded-2xl p-8 flex items-center justify-between`).
- Left content: Title in serif (`Coffee collection`), `SHOP NOW` outline button (`border border-[#3A3733] text-xs font-semibold uppercase tracking-wider py-2.5 px-6 rounded-none hover:bg-black hover:text-white transition-colors`).
- Right image: Rounded product card image (`w-44 h-36 object-cover rounded-xl`).

### Browse by Category (Circular Masks)
- 4-column circular category grid (`grid-cols-2 md:grid-cols-4 gap-8 text-center`).
- Image: `w-40 h-40 md:w-44 md:h-44 rounded-full object-cover mx-auto shadow-sm`.
- Label below: Bold serif category title (`Abayas`, `Accessories`, `Niqabs`, `Scarfs`).

### Footer
- White background (`bg-white border-t border-line py-16 px-6 text-black`).
- 4-column layout:
  1. `Byines` logo + brand sentence ("Redefining modest fashion through timeless elegance and contemporary silhouettes.") + Social icons.
  2. `SHOPPING`: New Arrivals, Best Sellers, Sale Items.
  3. `CUSTOMER SERVICE`: Contact Us, Shipping & Returns, Size Guide.
  4. `NEWSLETTER`: Input field + solid black `SUBSCRIBE` button.
- Copyright bottom bar: `© 2026 ByInes. All rights reserved.` + Privacy Policy / Terms of Service.


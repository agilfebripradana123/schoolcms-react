---
name: Premium EdTech System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#4a4455'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#7b7487'
  outline-variant: '#ccc3d8'
  surface-tint: '#732ee4'
  primary: '#630ed4'
  on-primary: '#ffffff'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#d2bbff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#005b3d'
  on-tertiary: '#ffffff'
  tertiary-container: '#007650'
  on-tertiary-container: '#76ffc2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-margin: 32px
  gutter: 24px
---

## Brand & Style

This design system is engineered for a sophisticated School Management System (SaaS) that bridges the gap between administrative utility and an inviting educational environment. The brand personality is **Professional, Academic, and Optimistic**. It avoids the cluttered, "legacy software" feel of traditional institutional tools in favor of a modern, "Premium EdTech" aesthetic.

The visual style follows a **Corporate Modern** approach with a high-end tilt. It utilizes generous whitespace, soft rounded corners, and a curated color palette to reduce cognitive load for administrators, teachers, and parents. The interface should feel like a high-performance productivity tool—crisp, responsive, and trustworthy—while maintaining a sense of warmth through its soft typography and vibrant accent colors.

## Colors

The palette is anchored by a vibrant **Violet (#7C3AED)**, used strategically for primary actions and brand emphasis. To provide a grounded, professional feel, the **Sidebar** and primary navigation use a **Deep Navy (#0F172A)**, creating a high-contrast structural anchor for the application.

- **Backgrounds:** The workspace uses a cool-toned **Slate-50 (#F8FAFC)** to distinguish the canvas from the **Pure White (#FFFFFF)** interactive cards and surfaces.
- **Typography:** Primary text uses a deep charcoal for maximum legibility, while secondary metadata uses a softer slate gray to maintain hierarchy.
- **Accents:** A range of emerald, amber, and red accents are reserved for semantic status indicators (Success, Warning, Danger), ensuring that critical school data (like attendance or grades) is instantly scannable.

## Typography

This design system uses a dual-font strategy to balance character with utility. 

**Plus Jakarta Sans** is the headline face, chosen for its friendly, open apertures and modern geometric structure. It provides an approachable "EdTech" feel to dashboard titles and page headers.

**Manrope** is the workhorse font for body text, tables, and labels. Its high legibility and balanced proportions make it ideal for data-heavy views like student rosters, gradebooks, and schedules. 

- Use **display** and **headline-lg** for marketing-led landing pages or empty-state calls to action.
- Use **headline-md** and **headline-sm** for standard dashboard card titles.
- **label-md** is specifically tuned for sidebar navigation and table headers, using a slight uppercase treatment for clarity.

## Layout & Spacing

The system employs a **Fluid Grid** model with a strict 4px/8px baseline rhythm. 

- **Desktop (1440px+):** 12-column grid with a 280px fixed sidebar. Content sits within a max-width container of 1200px or occupies the remaining fluid space in "Dashboard Mode."
- **Tablet (768px - 1024px):** 8-column grid with a collapsible sidebar (icons only). Margins reduce to 24px.
- **Mobile (below 768px):** 4-column grid. Sidebar moves to a bottom-sheet or hamburger menu. Margins reduce to 16px.

Spacing is used generously to prevent the UI from feeling "cramped" despite the high volume of data. Large cards should utilize `xl` (32px) internal padding to maintain a premium feel.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Ambient Shadows**. 

1. **Level 0 (Background):** Slate-50 (#F8FAFC) background.
2. **Level 1 (Cards/Surfaces):** Pure White (#FFFFFF) with a thin 1px border of Slate-200. No shadow by default to maintain a clean look.
3. **Level 2 (Active/Interactive):** Subtle ambient shadow (Y: 4, Blur: 12, Color: #000000 at 5% opacity). This is used for cards on hover or "active" widgets.
4. **Level 3 (Overlays):** Modals and dropdowns use a more pronounced shadow (Y: 10, Blur: 30, Color: #000000 at 10% opacity) and a backdrop blur of 8px on the layer beneath them.

The system avoids heavy "boxiness" by using thin, low-contrast outlines rather than deep shadows wherever possible.

## Shapes

The shape language is **Pill-shaped (3)**, reflecting the premium and friendly nature of modern educational software. 

- **Standard Elements:** Buttons, input fields, and chips use a base radius of 1rem (16px).
- **Cards/Containers:** Large surface containers and dashboard widgets use `rounded-xl` (2rem / 32px) to create a distinctive, soft aesthetic.
- **Selection Indicators:** Active states in the sidebar use a "capsule" or "pill" shape that is fully rounded on one or both ends.

This soft rounding should be consistent across all interactive components to maintain the brand's approachable personality.

## Components

### Buttons
- **Primary:** Solid Violet (#7C3AED) with white text. Pill-shaped. Subtle lift on hover.
- **Secondary:** Transparent with a 1px Slate-200 border. Violet text.
- **Ghost:** No border or background. Deep Navy text. Used for low-priority actions.

### Sidebar Navigation
- **Background:** Deep Navy (#0F172A).
- **Active State:** A soft violet gradient glow (`#7C3AED` to `#A78BFA` at 10% opacity) behind the menu item, paired with a 4px vertical pill indicator on the left.
- **Icons:** Linear, 2px stroke, Slate-400 color, switching to Violet when active.

### Cards
- Pure white background, 1px Slate-200 border, and `rounded-xl` corners. 
- Section headers within cards should use **headline-sm** with a bottom border or generous padding.

### Input Fields
- Soft slate backgrounds or white with Slate-200 borders.
- On focus, borders transition to Violet with a 3px soft violet outer glow (shadow).

### Progress Bars & Data Viz
- Use the **Violet** as the primary data color.
- Secondary data series should use **Indigo**, **Blue**, or **Pink** to maintain a cool, harmonious palette. 
- Success/Danger colors are strictly semantic (e.g., "Passed" vs. "Failed").
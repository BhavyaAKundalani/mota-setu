---
name: Tribal Scholarship Scrutiny & Reconciliation Engine
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#44464f'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#757780'
  outline-variant: '#c5c6d1'
  surface-tint: '#475d92'
  primary: '#00153d'
  on-primary: '#ffffff'
  primary-container: '#0f2a5c'
  on-primary-container: '#7c93cb'
  inverse-primary: '#b0c6ff'
  secondary: '#006a63'
  on-secondary: '#ffffff'
  secondary-container: '#99efe5'
  on-secondary-container: '#006f67'
  tertiary: '#2d0f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#4d1f00'
  on-tertiary-container: '#e37630'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b0c6ff'
  on-primary-fixed: '#001945'
  on-primary-fixed-variant: '#2e4578'
  secondary-fixed: '#9cf2e8'
  secondary-fixed-dim: '#80d5cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb68e'
  on-tertiary-fixed: '#331200'
  on-tertiary-fixed-variant: '#763300'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Public Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Public Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Public Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0em
  headline-md:
    fontFamily: Public Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: 0em
  headline-sm:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0em
  body-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-lg:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers an institutional, authoritative, and profoundly accessible interface tailored for the Ministry of Tribal Affairs (MoTA). It serves two core user groups: tribal scholarship applicants (NFST, NOS) who require an intuitive, low-friction, bilingual/multilingual interface accommodating varying degrees of technical literacy, and government verification officials (desk officers, scrutiny auditors aged 30–50) processing large volumes of institutional claims, bank reconciliations, and academic certificates under strict statutory deadlines.

### Visual Identity & Philosophy
The aesthetic aligns with modern civic-grade governance: dignified, dependable, calm, and deliberate. It strips away all frivolous visual noise, skeuomorphism, and erratic motion in favor of structural clarity, generous spatial cadence, and unambiguous status communication. 

- **Civic Trust:** Rooted in sovereign gravitas, utilizing a deep navy backbone combined with natural earthen accents that honor tribal heritage with dignified restrained elegance rather than decorative pastiche.
- **Predictable Utility:** Interfaces follow strict deterministic paths. Components feature rigid tactile boundaries, prominent interaction targets, and unambiguous textual confirmations to reduce cognitive anxiety for first-generation scholars.
- **WCAG AAA Focus:** High contrast ratios, stark structural borders, clear focus rings, and universal affordances ensure seamless operation across low-end rural devices, screen readers, and multi-monitor audit consoles.

## Colors

The color system is engineered to satisfy strict WCAG AAA contrast standards against white and off-white surfaces, eliminating ambiguity in verification, scrutiny, and financial reconciliation workflows.

### Palette Overview
- **Ashoka Institutional Navy (`#0F2A5C`) — Primary:** Conveys constitutional authority, reliability, and security. Used for official headers, dominant interaction actions, structural frame elements, and primary callouts.
- **Forest Sage / Trust Green (`#0F766E`) — Secondary:** Signifies successful verification, DBT (Direct Benefit Transfer) clearance, authentic document matching, and institutional approvals.
- **Warm Ochre / Earth Gold (`#B45309`) — Tertiary / Warning:** Applied for discrepancy queues, pending verification, Aadhaar-bank mismatch flags, and reconciliation holds.
- **Slate Navy / Deep Neutral (`#0F172A` / `#334155`):** Reserved for high-legibility typographic hierarchies and structural outlines.

### Functional Roles & Surfaces
- **Canvas Base:** `#FFFFFF` for data cards, application forms, and scrutiny documents; `#F8FAFC` for page backgrounds, audit table bands, and workspace backdrops.
- **Surface Borders:** `#CBD5E1` for default field borders and dividing lines; `#94A3B8` for enhanced accessible component edges.
- **Error / Rejection Red:** `#991B1B` on `#FEF2F2` for rejected documents, flagged fraudulent claims, or failed biometric/PFMS bridges.
- **Verified / Clean Green:** `#15803D` on `#F0FDF4` for clean ledger reconciliation and finalized sanction orders.

## Typography

The typography system is constructed around two robust open typefaces: **Public Sans** for authoritative, civic-grade headlines and functional operational labels, paired with **Noto Sans** for high-clarity multi-script body copy and documentation.

### Readability Mandates
- **Baseline Metric:** The standard body copy is strictly anchored at `16px` (`1rem`) with a generous `1.5` (`24px`) line height to eliminate visual crowding. For student-facing guidance cards and procedural explanations, `body-lg` (`18px`) is preferred.
- **Multilingual Resilience:** Noto Sans natively supports all scheduled Indian languages and complex scripts (Devanagari, Odia, Bengali, Telugu, Santhali/Ol Chiki, etc.), guaranteeing uniform vertical rhythm and baseline alignment across localized interfaces.
- **Tabular Numerals:** For financial reconciliation, Aadhaar tokens, PFMS transaction IDs, and sanction order figures, OpenType tabular figures (`tnum`) must be enforced across all data tables and currency displays.

## Layout & Spacing

The layout is built upon an 8px modular baseline grid, designed to balance dense scrutiny data tables for audit officers with expansive, uncluttered form layouts for tribal student applicants.

### Layout Rhythm & Breakpoints
- **Desktop (1200px+):** 12-column grid with `2rem` outer margins and `1.5rem` gutters. Audit views can expand up to a max-width container of `1600px` for side-by-side reconciliation (e.g., Application vs. DigiLocker vs. PFMS ledger).
- **Tablet (768px – 1199px):** 8-column layout with `1.5rem` outer margins and `1rem` gutters. Side-by-side panels collapse into full-width stacked tabs with explicit step indicators.
- **Mobile (<768px):** 4-column layout with `1rem` margins and `0.75rem` gutters. Sticky bottom actions replace modal footers, ensuring touch targets exceed `48px` minimum bounding boxes.

### Scrutiny Console Ergonomics
Split-view reconciliation screens maintain a 45/55 proportional balance: the left pane hosts original application certificates and OCR extracts; the right pane displays the interactive scrutiny checklist, ledger reconciliation tables, and action triggers.

## Elevation & Depth

This design system avoids blurry drop shadows, diffuse glows, and ambiguous frosted layers. Instead, visual priority and layering rely on clean structural borders, tonal stratification, and high-contrast bounding contours.

### Depth Hierarchy
1. **Level 0 (Base Canvas):** `#F8FAFC` — Overall application canvas and container backdrops.
2. **Level 1 (Card & Section Surfaces):** `#FFFFFF` bordered by a crisp `1px solid #CBD5E1`. Used for forms, application summaries, and verification tables.
3. **Level 2 (Active/Hover/Focus Elements):** `#FFFFFF` with a crisp `1.5px solid #0F2A5C` border accompanied by an institutional shadow: `0px 2px 4px rgba(15, 42, 92, 0.08)`.
4. **Level 3 (Sticky Controls & Popovers):** Contextual tooltips, dropdown selects, and the AI Sahayak dialog: `0px 8px 16px -2px rgba(15, 23, 42, 0.12)`, bounded by `1px solid #94A3B8`.
5. **Level 4 (Modals & Verification Confirmations):** Centered modal sheets overlaying an institutional scrim (`#0F172A` at 60% opacity), bounded by a firm `#0F2A5C` top accent band (4px thick).

## Shapes

The design system enforces a disciplined, dignified shape language with soft, subtle rounding (`roundedness: 1` = `0.25rem` / `4px`). This maintains an official, structured feel without appearing overly aggressive or frivolous.

### Corner Rules
- **Buttons, Inputs, and Form Controls:** Formally bounded with `4px` (`rounded`) corners.
- **Containers, Cards, and Audit Panels:** Standardized at `8px` (`rounded-lg`) to soften larger structural enclosures while retaining rectangular precision.
- **Status Badges & Chips:** Formally bounded at `4px` with clear 1px perimeter borders. Full pills (`rounded-full`) are strictly reserved for the fixed floating "AI Sahayak" assistant badge to differentiate conversational tooling from statutory forms.

## Components

### 1. Global Navigation Bar & Search
- **Institutional Header:** Crisp white surface bounded by an Indian Navy `#0F2A5C` 4px top bar and MoTA emblem branding.
- **Global Search Input:** Prominent, centrally located search bar (`min-width: 380px`, `height: 48px`) with persistent keyboard shortcut indicator (`/` or `Ctrl+K`), explicit placeholder (`"Search by Scholar Name, Aadhaar Hash, Application ID, or Institute..."`), and high-contrast 1.5px border (`#94A3B8`).

### 2. Buttons & Actions
- **Primary Button (Sanction / Approve / Submit):** Solid `#0F2A5C` background, `#FFFFFF` bold label (`Public Sans` weight 600), `48px` standard height, `4px` radius. Focus ring: `3px solid #0F766E` with 2px white offset.
- **Verified State Button (Mark Verified):** Solid `#0F766E`, `#FFFFFF` label, tick icon prepended.
- **Reconciliation / Flag Discrepancy Button:** Solid `#B45309`, `#FFFFFF` label, alert icon prepended.
- **Secondary Button:** Surface `#FFFFFF`, text `#0F2A5C`, border `2px solid #0F2A5C`.

### 3. Verification Chips & Status Badges
- **Verified / DBT Cleared:** Light background `#F0FDF4`, border `1px solid #86EFAC`, text `#15803D`, accompanied by an explicit SVG checkmark.
- **Discrepancy / Under Scrutiny:** Light background `#FFFBEB`, border `1px solid #FCD34D`, text `#B45309`, accompanied by an explicit warning triangle.
- **Rejected / Defective:** Light background `#FEF2F2`, border `1px solid #FCA5A5`, text `#991B1B`.

### 4. Input Fields & Form Controls
- **Height & Spacing:** Uniform `48px` input box height with `16px` base typography for high legibility.
- **Borders & Labels:** Persistent top labels in `#0F172A` with bold mandatory indicators (`*` in `#991B1B`). 1.5px structural borders (`#94A3B8`) shifting to `2px solid #0F2A5C` on active focus.
- **Helper & Validation Text:** Displayed directly underneath inputs with high-contrast icons; never rely on color alone to communicate errors.

### 5. Checkboxes & Radio Buttons
- **Touch & Click Target:** Minimum bounding box of `44px x 44px` with an inner `20px x 20px` control.
- **High-Contrast State:** Active state fills with `#0F2A5C` and a high-contrast white glyph, accompanied by a distinct 2px outer border.

### 6. Scrutiny Data Table & Reconciliation Split-Cards
- **Audit Table:** Sticky `#F1F5F9` table headers with uppercase `label-sm` text. Alternating row fills (`#FFFFFF` and `#F8FAFC`) with clear 1px horizontal dividers.
- **Discrepancy Highlight:** Mismatched records (e.g., student name on caste certificate vs. Aadhaar) feature an inline Ochre highlight (`#FEF3C7`) with side-by-side reconciliation overrides.

### 7. Floating 'AI Sahayak / May I Help You' Trigger
- **Position:** Fixed at the bottom-right corner (`bottom: 2rem`, `right: 2rem`).
- **Styling:** Pill container (`rounded-full`) with a `#0F2A5C` fill, `#FFFFFF` text, and a distinct `#0F766E` pulsating indicator dot. Features prominent bilingual typography: `"AI Sahayak / May I Help You?"`.
- **Accessibility:** Keyboard accessible via `Alt + H`, launching a high-contrast conversational panel supporting voice input and direct form autocompletion for tribal scholarship applicants.
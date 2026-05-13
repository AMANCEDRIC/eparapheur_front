---
name: SigFlow Enterprise
colors:
  background-light: '#F9FAFB'
  background-dark: '#101022'
  surface-white: '#FFFFFF'
  text-primary: '#111827'
  text-secondary: '#6B7280'
  border-subtle: '#E2E8F0'
  status-success: '#10B981'
  status-error: '#F43F5E'
  status-warning: '#F59E0B'
  status-info: '#3B82F6'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 3rem
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 1.875rem
    fontWeight: '800'
    lineHeight: 2.25rem
    letterSpacing: -0.025em
  headline-md:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2rem
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-bold:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '700'
    lineHeight: 1rem
    letterSpacing: 0.05em
  sidebar-nav:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 72rem
  section-gap: 5rem
  card-padding: 2rem
  stack-sm: 0.375rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style
SigFlow is a professional, high-reliability enterprise SaaS platform. The brand personality is authoritative, precise, and systematic, designed to instill confidence in technical users managing complex data flows.

The visual style is **Corporate / Modern**, characterized by a rigorous adherence to grid structures, refined typography, and a "function-first" aesthetic. It utilizes a clean, light-mode default with high-contrast text and purposeful use of a singular primary "Indigo" to drive action and highlight hierarchy. The interface avoids unnecessary decoration, opting for subtle borders and tonal shifts to organize information.

## Colors
The palette is anchored by **Primary  (#0083c0)**, a deep, high-fidelity blue used for primary actions, branding, and active states.

- **Surfaces:** The interface uses a tiered background system. `background-light` (#F9FAFB) serves as the page canvas, while `surface-white` (#FFFFFF) is reserved for interactive cards and containers to create clear separation.
- **Typography:** Deep slate and grays provide high legibility. Text Primary (#111827) is used for headings, while Text Secondary (#6B7280) handles supporting information.
- **Semantics:** Status colors (Success, Error, Warning, Info) are used with low-opacity backgrounds (10-20%) and high-saturation text to ensure accessibility without overwhelming the professional tone.

## Typography
The system relies exclusively on **Inter** to maintain a systematic, utilitarian feel.

Hierarchy is established primarily through font weight and tracking rather than just size. Headlines use `ExtraBold` (800) and `Black` (900) weights with tight letter spacing for a modern, impactful look. Body text defaults to `Regular` (400) with a `Medium` (500) variant for emphasis. Small labels and "Enterprise" branding elements use `Bold` (700) with increased tracking (uppercase) to ensure legibility at small scales (10px-12px).

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for content readability, maxing out at `72rem` (1152px) for the main content area to prevent line lengths from becoming too long on ultra-wide monitors.

- **Vertical Rhythm:** Sections are separated by large 80px (`5rem`) gaps. Internal card spacing is generous at 32px (`2rem`).
- **Sidebar:** The navigation uses a fixed-width approach (approx 280px) with 12px vertical spacing between items to ensure touch and click targets are comfortable.
- **Responsiveness:** On mobile, margins reduce from 40px to 24px, and large display headings scale down to `2.25rem` to fit the viewport width.

## Elevation & Depth
SigFlow uses **Tonal Layers** and **Subtle Ambient Shadows** to define hierarchy.

- **Flat Surfaces:** The majority of the UI is flat, using 1px borders (#E2E8F0) to define sections.
- **Elevation 1 (Cards):** Main content containers use a very soft `shadow-sm`. This provides just enough lift from the light gray background to signal interactivity.
- **Elevation 2 (Buttons/Dropdowns):** Interactive elements like primary buttons use a tinted shadow (`shadow-primary/20`) to create a "glow" effect, making the primary action the most prominent element on the screen.
- **Active States:** Navigation items do not use shadows; instead, they use a 10% opacity tint of the Primary Indigo to indicate selection.

## Shapes
The shape language is **Soft (0.25rem - 0.75rem)**.

Standard components (inputs, small buttons) use a `0.5rem` (8px) radius. Larger containers, such as cards and hero sections, use `0.75rem` (12px) to soften the industrial nature of the enterprise interface. Status badges and the primary "Brand Badge" use a `full` (9999px) pill shape to distinguish them from structural UI components.

## Components
- **Buttons:** Primary buttons are solid Indigo with white text and a subtle primary-tinted shadow. Secondary buttons are light gray (`slate-100`) with dark text, and Outline buttons use a 1px Primary border with Indigo text.
- **Input Fields:** Use a light gray background (`slate-50`) with a 1px border. Focus states must transition to a 2px Primary border with a soft `primary/20` outer ring.
- **Status Badges:** Pill-shaped, using 10% background opacity of the semantic color (e.g., Emerald-100) and 100% opacity for the icon and text (e.g., Emerald-700).
- **Sidebar Items:** Feature a 20px-24px icon. Active items use `primary/10` background and `primary` text. Hover states use a subtle `slate-50` background.
- **Cards:** White background, 1px `slate-200` border, and `0.75rem` corner radius.

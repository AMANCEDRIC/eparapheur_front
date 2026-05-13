# CREATIVE DIRECTION PROMPT — CRYPTONEO

## Premium Digital Trust Platform UI Redesign

You are redesigning the front-end experience of “Cryptoneo”, a premium electronic signature and digital trust platform operating in the domain of cybersecurity, electronic certification, and trusted digital workflows.

The platform is positioned between:

* secure fintech infrastructure
* enterprise trust platform
* legal-tech workflow system
* certification authority software (PSCE)

The objective is NOT to create a generic SaaS dashboard.
The interface must communicate:

* trust
* security
* procedural rigor
* institutional credibility
* modern premium UX
* operational clarity

The visual direction should feel like a sophisticated hybrid between:

* Universign
* DocuSign
* Dropbox Sign
  without directly copying them.

The product must feel deployable for:

* banks
* administrations
* enterprises
* regulated organizations
* corporate compliance teams

---

# CORE DESIGN PHILOSOPHY

## “The Trusted Digital Workspace”

Cryptoneo is not a startup toy dashboard.
It is a secure operational environment for digital trust workflows.

The interface should evoke:

* controlled precision
* quiet confidence
* procedural transparency
* high-end enterprise software
* modern European fintech aesthetics

Avoid flashy startup visuals.

The UI should feel:

* premium
* stable
* intelligent
* minimal but not empty
* elegant without excess

The product must visually communicate:
“This platform is secure enough for critical signatures.”

---

# DESIGN SYSTEM FOUNDATION

Use the following design system as the visual DNA.

## Alexandria — High-End Editorial

### Colors

Primary color:

* #0083c0

Usage:

* links
* primary actions
* focus states
* active navigation
* workflow emphasis

Tertiary archival gold:

* #6d5e00

Usage:

* verification indicators
* trusted status
* certification badges
* security highlights

DO NOT overuse the primary color.

Most of the interface should rely on:

* layered surfaces
* tonal hierarchy
* whitespace
* typography

Avoid strong borders.

Use surface hierarchy:

* surface-container-lowest
* surface-low
* surface
* surface-high
* surface-dim

The UI depth must come from tonal layering, not aggressive shadows.

---

# BRANDING / WHITE LABEL REQUIREMENTS

The platform is multi-client.

The architecture MUST support:

* dynamic logo replacement
* easy primary color replacement
* easy secondary color replacement

The UI must remain coherent regardless of client branding.

Implement branding through:

* CSS variables
* Tailwind theme tokens
* semantic color tokens

Never hardcode colors inside components.

Use semantic naming:

* --color-primary
* --color-secondary
* --color-accent
* --color-surface
* --color-success
* --color-danger

The layout and typography must remain premium even if client colors change.

Avoid visual dependence on a specific palette.

---

# TYPOGRAPHY

## Headlines

Use:

* Noto Serif

Purpose:

* authority
* trust
* editorial elegance
* institutional presence

Use large spacing and calm rhythm.

## Body

Use:

* Inter

Purpose:

* dense information readability
* modern clarity
* enterprise usability

## Labels / Metadata

Use:

* Public Sans

Purpose:

* audit feel
* system precision
* operational metadata

Examples:

* timestamps
* statuses
* workflow identifiers
* signer references

---

# UX PRINCIPLES

## Enterprise Simplicity

Even when workflows are complex:

* the UI must feel calm
* step progression must feel guided
* users should never feel lost

The experience should reduce cognitive load.

---

# SIGNATURE PROGRAM CREATION FLOW

This is the HEART of the product.

The multi-step creation workflow must feel:

* secure
* guided
* professional
* procedural
* impossible to misuse

## STEP 1 — Program Information

Fields:

* program name
* description
* document upload
* optional parameters

UX:

* spacious form layout
* drag-and-drop upload zone
* elegant document preview
* strong visual hierarchy
* contextual help text
* minimal distractions

---

## STEP 2 — Signature Workflow Builder

This is the most important screen.

Users create:

* one or multiple signature steps
* each step contains:

  * one or multiple documents
  * selected signatories

UX direction:

* timeline-inspired workflow
* procedural orchestration feel
* visual progression
* enterprise-grade clarity

The workflow builder should feel:

* intelligent
* visual
* controlled

Avoid:

* chaotic cards
* excessive borders
* random spacing

Use:

* layered surfaces
* vertical rhythm
* structured grouping

Potential inspirations:

* workflow automation tools
* approval pipelines
* notarization systems

Use subtle motion when:

* adding a step
* reordering
* assigning signers

Animations must feel fluid and expensive.

---

## STEP 3 — Summary / Verification

The recap page must feel:

* authoritative
* auditable
* trustworthy

Display:

* workflow overview
* signers
* documents
* validation states
* security indicators

The user should feel:
“I am about to launch an official secure process.”

Use:

* editorial spacing
* metadata layouts
* trusted status chips
* subtle verification visuals

---

## STEP 4 — OTP Confirmation

This screen is critical.

The OTP experience must feel:

* secure
* premium
* calm
* important

DO NOT create:

* childish OTP inputs
* flashy animations

Use:

* elegant segmented inputs
* controlled focus states
* subtle motion
* restrained security visuals

The confirmation action must feel definitive and trustworthy.

---

# LAYOUT ARCHITECTURE

Use:

* fixed modern sidebar
* top navigation bar
* workspace-centered layouts

The layout should feel like:

* a secure operational console
* not a marketing dashboard

Sidebar:

* refined
* compact
* elegant active states
* no excessive icons
* strong typography hierarchy

Topbar:

* restrained
* premium
* search
* notifications
* account controls

Workspace:

* generous breathing room
* modular content areas
* strong alignment system

---

# COMPONENT STYLE

## Buttons

### Primary

* gradient fill
* restrained gradient
* subtle depth
* elegant hover transitions

### Secondary

* elevated surface background
* colored text
* tonal hover states

### Tertiary

* text-only
* subtle underline on hover

Avoid:

* oversized CTA buttons
* neon colors
* excessive shadows

---

## Cards

NO heavy borders.

NO generic Tailwind dashboard cards.

Cards should feel:

* editorial
* layered
* premium
* architectural

Use:

* spacing
* tonal contrast
* subtle glass overlays when floating

---

## Inputs

Style:

* soft surfaces
* ghost borders
* elegant focus states

Avoid:

* Angular Material appearance
* harsh outlines
* fully rounded pills

Corners:

* mildly rounded only

---

# VISUAL LANGUAGE

## Motion

Animations must feel:

* subtle
* smooth
* premium
* Apple-like

Use motion for:

* page transitions
* step progression
* workflow interactions
* hover refinement
* sidebar state transitions

Avoid:

* bouncing
* exaggerated scaling
* flashy transitions

---

# RESPONSIVE STRATEGY

Desktop-first.

However:

* tablet experience must remain excellent
* mobile must remain fully functional

On smaller screens:

* transform workflow layouts intelligently
* preserve hierarchy
* maintain procedural clarity

Do not collapse everything into generic stacked cards.

---

# SECURITY VISUAL LANGUAGE

The UI should subtly communicate:

* cryptography
* compliance
* integrity
* digital trust

WITHOUT becoming:

* hacker aesthetic
* cyberpunk
* overly technical

Use:

* trusted badges
* audit metadata
* timestamps
* signature states
* verification indicators
* procedural progression

The platform should feel:
“secure by design.”

---

# WHAT TO AVOID ABSOLUTELY

Avoid:

* generic Tailwind SaaS dashboards
* excessive rounded corners
* startup aesthetics
* random gradients
* oversized shadows
* Angular Material look
* card overload
* noisy interfaces
* dense border usage
* childish fintech visuals
* crypto startup aesthetics
* glassmorphism everywhere
* neon effects
* cluttered tables

DO NOT produce:

* Dribbble concepts
* fake futuristic UIs
* gaming-style dashboards

The product must remain:

* credible
* deployable
* enterprise-ready

---

# TECH STACK CONSTRAINTS

Framework:

* Angular 18

Styling:

* TailwindCSS
* DaisyUI

Architecture requirements:

* reusable design tokens
* semantic Tailwind extensions
* scalable component system
* white-label ready structure

Prefer:

* composition over deeply coupled components
* design consistency over experimentation

---

# FINAL OBJECTIVE

Create a front-end redesign direction that makes Cryptoneo feel like:

* a premium digital trust platform
* an enterprise-grade electronic signature ecosystem
* a secure operational environment
* a modern certification authority interface

The interface should be visually memorable through:

* refinement
* clarity
* typography
* workflow orchestration
* subtle sophistication

NOT through visual excess.

---
name: Obsidian Echo
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c5d6'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e909f'
  outline-variant: '#444654'
  surface-tint: '#b7c4ff'
  primary: '#b7c4ff'
  on-primary: '#002681'
  primary-container: '#3e63dd'
  on-primary-container: '#eeeeff'
  inverse-primary: '#2c54ce'
  secondary: '#ffb3b0'
  on-secondary: '#68000f'
  secondary-container: '#92011a'
  on-secondary-container: '#ff9996'
  tertiary: '#6ddc9e'
  on-tertiary: '#003920'
  tertiary-container: '#007d4d'
  on-tertiary-container: '#bcffd3'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b4'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b0'
  on-secondary-fixed: '#410006'
  on-secondary-fixed-variant: '#92011a'
  tertiary-fixed: '#8af8b9'
  tertiary-fixed-dim: '#6ddc9e'
  on-tertiary-fixed: '#002111'
  on-tertiary-fixed-variant: '#005231'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  margin-page: 2rem
  gutter: 1rem
  panel-padding: 1.5rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style

This design system is built for high-focus productivity and technical precision. It targets power users who value information density and professional-grade tools. The aesthetic is a fusion of **Minimalism** and **Modern Corporate**, utilizing a deep "Obsidian" dark mode that minimizes eye strain during long working sessions. 

The visual narrative centers on "The Waveform" — vibrant, high-contrast pulses of energy against a dead-silent, dark backdrop. This creates a psychological environment that feels both sophisticated and high-tech, evoking the precision of a recording studio and the clarity of a streamlined digital workspace.

## Colors

The palette is anchored in a true-dark foundation. Surfaces are tiered through subtle variations in charcoal and obsidian rather than traditional light gray shadows.

- **Primary (Electric Blue):** Used for active states, playback progress, and the primary waveform visualization.
- **Secondary (Pulse Red):** Exclusively reserved for recording states, critical alerts, and destructive actions.
- **Tertiary (Mint Green):** Used for success indicators and positive confirmations.
- **Neutral Backgrounds:** A range of deep grays (`#111111`, `#161616`, `#1C1C1C`) create the sense of depth through layered panels.
- **Contrast:** Typography maintains high legibility with an off-white primary text color to prevent jarring visual vibration against the black background.

## Typography

The typography system relies on two distinct families to separate content from metadata.

**Hanken Grotesk** serves as the primary engine for content and navigation. Its clean, sharp geometry provides high readability in low-light environments. 

**JetBrains Mono** is used for technical metadata, timestamps, file sizes, and status labels. This monospaced choice reinforces the "technical tool" identity and ensures that numerical data (like audio durations) remains visually stable during real-time updates.

Headers should use tight line-heights for a compact, editorial feel, while body copy is given ample leading to facilitate comfortable reading of voice-to-text transcriptions.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for the sidebars and navigation, with a **Fluid Content** area for the notes and waveform editor.

- **Desktop (1440px+):** A three-pane architecture. Left sidebar (Navigation), Middle pane (Note List), Right pane (Active Note/Editor).
- **Tablet (768px - 1439px):** Sidebars collapse into a single drawer; focus shifts to the active note and recording controls.
- **Mobile (<767px):** Single column. Navigation and Lists are handled through full-screen overlays or bottom sheets.

Spacing is governed by an 8px modular scale. High information density is encouraged, but significant "breathable" margins are kept around the primary text content to maintain the minimalist aesthetic.

## Elevation & Depth

This design system avoids traditional drop shadows. Instead, it uses **Tonal Layering** and **Subtle Outlines**.

- **Level 0 (Background):** `#111111` - The base application canvas.
- **Level 1 (Sidebars/Panels):** `#161616` - Distinguishes navigational areas from the base.
- **Level 2 (Active Cards/Modals):** `#1C1C1C` - The highest surface for focused interaction.

Depth is further defined by `1px` solid borders using low-opacity white (`rgba(255, 255, 255, 0.08)`). This creates a "glass-edge" effect that feels sharp and architectural without the clutter of heavy shadows.

## Shapes

The shape language is **Soft (0.25rem)**. This slight rounding provides a modern touch while maintaining the serious, structured feel of a technical application. 

Buttons and input fields should strictly adhere to the `0.25rem` radius. Floating Action Buttons (FABs) or the primary "Record" button may use a larger `rounded-xl` radius to signify their primary status in the hierarchy.

## Components

- **Buttons:** Primary buttons use a solid Electric Blue background with white text. Secondary buttons are "ghost" style with the 1px subtle border and primary-colored text.
- **Waveform Visualization:** Unlike traditional flat bars, the waveform should use a vertical bar style with varying opacities to represent audio frequency. The "played" portion of the audio should be vibrant Electric Blue, while the "unplayed" portion remains a muted dark gray.
- **Cards:** Note cards in the list view should utilize the Level 2 surface (`#1C1C1C`). Hover states are indicated by increasing the border opacity rather than changing the background color.
- **Inputs:** Text inputs and search bars should be integrated into the background with only a bottom border or a very subtle background tint, keeping the interface clean.
- **Chips/Tags:** Monospaced (JetBrains Mono) text inside a low-contrast container with a colored dot prefix to denote categories.
- **Recording Indicator:** A pulsating glow effect (using Secondary Red) should be applied to the primary record button and the status bar when the microphone is active.
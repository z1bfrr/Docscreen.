---
name: AuraLab Precision Health
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
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2151da'
  primary: '#0037b0'
  on-primary: '#ffffff'
  primary-container: '#1d4ed8'
  on-primary-container: '#cad3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#004b59'
  on-tertiary: '#ffffff'
  tertiary-container: '#006577'
  on-tertiary-container: '#75e3ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b5'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-xl:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 1.5rem
  margin-md: 3rem
  margin-lg: 5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a standard of clinical authority merged with the understated tactility of private client concierge services. Created for an advanced diagnostic marketplace, the aesthetic avoids sterile hospital tropes in favor of an ultra-luxury digital clinic: serene, exacting, luminous, and effortless.

The design philosophy combines clinical minimalism with atmospheric glassmorphism. Interfaces feel carved from optical-grade acrylic and frosted glass resting atop soft, luminous fields. Micro-surfaces prioritize generous whitespace, surgical typographic calibration, and micro-diffused ambient light. Every diagnostic panel, biomarker metric, and scheduling interaction instills calm certainty and uncompromising accuracy.

## Colors

The palette balances clinical precision against serene luxury. Light blue-grey tones replace stark stark white canvas backgrounds to eliminate retinal fatigue, while deep sapphire and slate establish institutional gravity.

- **Primary Sapphire (`#1D4ED8`)**: Anchors primary calls-to-action, active interactive states, and core diagnostic highlights. Paired with an interactive bright tint (`#2563EB`) for hover dynamics.
- **Secondary Deep Slate (`#0F172A`)**: Dictates primary typography, structural icons, and deep contrast grounding panels.
- **Tertiary Cyan/Teal (`#06B6D4`)**: Reserved for kinetic diagnostics, bio-telemetry indicators, and dynamic progress metrics.
- **Verification Emerald (`#10B981`)**: Signals certified lab accreditations, normal biomarker ranges, and verified sample verifications.
- **Neutral Canvas Foundations**:
  - Base canvas: `#F8FAFC`
  - Recessed/Subtle canvas: `#F1F5F9`
  - Border matrix: `rgba(15, 23, 42, 0.06)` for structural definition and `rgba(255, 255, 255, 0.85)` for glass rim highlights.

## Typography

Typography balances clinical legibility with architectural refinement. The pairing uses **Plus Jakarta Sans** for headlines and interactive elements to introduce gentle, contemporary geometric curves, while **Manrope** provides a balanced, rhythmic structure for patient data, dense biomarker panels, and legal disclaimers.

- Numbers and lab reference values within `Manrope` should always employ tabular lining figures (`font-variant-numeric: tabular-nums`) to maintain vertical alignment across test comparisons.
- High-level headings feature snug letter spacing to produce a tailored, editorial presence.
- Uppercase tracking is strictly enforced on `label-sm` elements (such as lab status badges and analyte identifiers) to ensure optical clarity at small scale.

## Layout & Spacing

The system is constructed on a fluid 12-column grid anchored by responsive outer canvas padding:
- **Desktop (>= 1280px)**: 12 columns, 32px gutters, 80px horizontal margin, max container width 1440px.
- **Tablet (768px – 1279px)**: 8 columns, 24px gutters, 48px horizontal margin.
- **Mobile (< 768px)**: 4 columns, 16px gutters, 20px horizontal margin.

The baseline cadence runs on a strict 4px/8px modular rhythm. Component paddings expand generously to produce the characteristic sense of luxury: diagnostic card internals never drop below 24px padding (`space-lg`), and complex clinical dashboards enforce 40px (`space-xl`) between functional zones.

## Elevation & Depth

Visual depth combines luminous multi-stage shadows with optical frosted glass substrates. Interfaces simulate precision physical materials:

- **Level 0 (Recessed Base)**: Flat `#F1F5F9` surfaces used inside containers to host micro-data readouts and input fields.
- **Level 1 (Clinical Card)**: Background of `rgba(255, 255, 255, 0.75)` with `backdrop-filter: blur(16px)`. Rim bordered by a 1px composite outline (`rgba(255, 255, 255, 0.8)` on top, fading to `rgba(15, 23, 42, 0.04)` on the bottom). Shadow: `0 4px 20px -2px rgba(15, 23, 42, 0.03), 0 2px 6px -1px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Interactive Overlays & Flyouts)**: Background of `rgba(255, 255, 255, 0.90)` with `backdrop-filter: blur(24px)`. Shadow: `0 12px 32px -4px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03)`.
- **Level 3 (Floating Action Glass & Bottom Sheets)**: Background of `rgba(255, 255, 255, 0.82)` with `backdrop-filter: blur(32px) saturate(180%)`. Border: 1px solid `rgba(255, 255, 255, 0.6)`. Shadow: `0 24px 48px -12px rgba(15, 23, 42, 0.10), 0 8px 16px -4px rgba(15, 23, 42, 0.04)`.

## Shapes

The interface embraces sculpted, continuous curves (squircle-inspired geometry) consistent with Level 3 pill and pebble ergonomics.

- **Primary Interactive Controls (Buttons, Inputs, Selectors)**: 14px border radius for compact and default sizes; 16px for prominent hero triggers.
- **Diagnostic Cards & Panels**: 20px to 24px border radius with inset content hugging the internal curve.
- **Modals, Floating Glass Navigation, and Floating Sheets**: 28px to 32px external radius.
- **Status Pills & Metric Tokens**: Fully pill-shaped (`border-radius: 9999px`) to create an immediate visual distinction between actionable buttons and passive diagnostic status tags.

## Components

### Buttons & Interactive Controls
- **Primary Action**: Solid `#1D4ED8` background, 14px radius, white `Plus Jakarta Sans` medium typography. Features an inner top-border highlight (`inset 0 1px 0 0 rgba(255, 255, 255, 0.2)`) and micro-lift transition on hover.
- **Frosted Secondary**: Translucent white fill (`rgba(255, 255, 255, 0.65)`), `backdrop-filter: blur(12px)`, bordered by `rgba(15, 23, 42, 0.08)`. Slate `#0F172A` text.
- **Floating Glass Nav**: Suspended island pill with `32px` corner radius, `blur-xl`, housing icons with glowing indicator dots for active routes.

### Diagnostic Cards & Data Surfaces
- Diagnostic test cards employ 20px roundedness with dual-border treatments (top white specular edge, lower slate ambient border).
- Internal test attributes (turnaround time, preparation rules, certification tags) sit on nested recessed tiles (`#F8FAFC`) with 12px radii.
- Real-time analyte graphs and metabolic reference bands use custom range sliders with `#06B6D4` telemetry gradients and `#10B981` normal-range zones.

### Inputs & Search Fields
- Omnibox and lab test search bars feature 16px corner radii, `#FFFFFF` with subtle inner drop (`inset 0 1px 2px rgba(15, 23, 42, 0.04)`), and an ambient focus ring colored `#1D4ED8` at 15% opacity with zero hard border lines.

### Selection Controls & Checkboxes
- **Checkboxes**: 8px rounded corners with a smooth spring transition into `#1D4ED8` fill and crisp white micro-check vectors.
- **Radio Buttons**: Concentric nested rings with subtle glass depth within the active pip.

### Status Indicators & Biomarker Badges
- Lab verification chips leverage pill shapes with 10% opacity fills corresponding to clinical status:
  - Verified/Normal: `#10B981` fill at 12%, `#047857` label text.
  - Critical/Action Needed: `#EF4444` fill at 10%, `#B91C1C` label text.
  - Processing/Pending: `#06B6D4` fill at 12%, `#0E7490` label text.
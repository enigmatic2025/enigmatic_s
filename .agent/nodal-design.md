# Nodal Design System

## Core Philosophy
**"Jules" Aesthetic**: A premium, high-density, monochrome interface designed for professional power users. It prioritizes content density, clean lines, and a flat, "no-shadow" look over decorative elements.

## 🎨 Colors & Theme
- **Theme**: Strict Black & White (Monochrome).
- **Backgrounds**:
    - App Background: `bg-background` (White / Black)
    - Sidebar: `bg-zinc-50` (Light) / `bg-zinc-900` (Dark) - *Subtle contrast to separate navigation.*
    - Card: `bg-card` (White / Black)
    - Hover: `bg-primary/10` or `bg-muted`
- **Text**:
    - Primary: `text-foreground` (Black / White)
    - Secondary: `text-muted-foreground` (Gray)
    - Interactive/Active: `text-primary`
- **Borders**: `border-border` (Subtle gray)

## 🔤 Typography
- **Font Family**: Sans-serif (Inter/Geist).
- **Weights**:
    - Standard: `font-light` (300) or `font-normal` (400).
    - Headings: `font-light` (tracking-tight).
- **Sizes**:
    - **Body/Navigation**: `text-sm` (14px) - *The standard unit.*
    - **Labels/Metadata**: `text-xs` (12px).
    - **Headings**: `text-lg` or `text-xl`.

## 📐 Layout & Density
- **Sidebar**:
    - Expanded Width: `w-64` (256px)
    - Collapsed Width: `w-16` (64px)
    - **Row Height (High Density)**: `h-8` (32px) for navigation items.
    - **Icon Size**: `h-4 w-4` (16px) or `h-5 w-5` (20px).
- **Top Bar**:
    - Height: `h-14` (56px).
    - Sticky, backdrop blur.
- **Spacing**:
    - Group Spacing: `space-y-4` (Compact).
    - Item Spacing: `space-y-1`.

## 🧩 Components
- **Buttons**:
    - Style: Flat, no shadow.
    - Variants: `ghost` (primary for nav), `outline`, `default`.
    - Corner Radius: `rounded-md`.
- **Inputs**:
    - Style: Flat, transparent border, no shadow (`shadow-none`).
    - Background: `bg-muted/50`.
- **Avatars**:
    - Style: Monochrome (Black circle, White text).
    - Size: `h-8 w-8`.

## 🚫 Anti-Patterns (Do Not Use)
- **Shadows**: Avoid `shadow-sm`, `shadow-md`, etc. Use borders for separation.
- **Gradients**: Keep it flat.
- **Large Rounded Corners**: Stick to `rounded-md` or `rounded-sm`.
- **Dividers in Sidebar**: Use whitespace (`space-y`) instead of lines.

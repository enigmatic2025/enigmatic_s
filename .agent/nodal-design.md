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

## Layout Structure

### Dashboard Layout
- **Sidebar (Left)**: Collapsible navigation.
    - **Width**: `w-64` (Expanded) / `w-16` (Collapsed).
    - **Background**: `bg-zinc-50` (Light) / `bg-zinc-900` (Dark).
    - **Header**: Contains Logo and Collapse button.
    - **Navigation**: Grouped into "Workspace" and "Development".
    - **Footer**: Documentation link.
- **Top Bar (Top)**: Global actions and context.
    - **Height**: `h-14`.
    - **Content**: Page Title, Mobile Menu Trigger, Theme Switcher, Settings, User Profile.
    - **Sticky**: Stays at the top of the viewport.
- **Main Content**:
    - **Padding**: `p-6`.
    - **Background**: `bg-background` (White/Black).

### High Density Mode
- **Sidebar Items**: `h-8` (32px) height.
- **Icons**: `h-4 w-4` (16px).
- **Spacing**: Tightened to maximize information density.
- **Typography**: `text-sm` for navigation items.

## 🧩 Components
- **Component Usage**:
    - **Shadcn UI**: All interactive elements must use Shadcn UI components.
    - `Button`: Used for all clickable actions.
    - `Input`: Used for search and forms.
    - `ScrollArea`: Used for sidebar navigation list.
    - `Tooltip`: Used for collapsed sidebar items.
    - `DropdownMenu`: Used for user profile actions.
    - `Card`: Used for grouping content (e.g., Login form).
    - `Avatar`: Monochrome style for user profile.
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

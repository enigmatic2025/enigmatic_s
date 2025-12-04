# Enigmatic & Nodal Design System

This document outlines the design systems for both the public marketing site (**Enigmatic**) and the application platform (**Nodal**). While they share core foundations, they have distinct aesthetics and rules.

---

## 1. Global Foundations (Shared)

### Typography

- **Font Family**: Sans-serif (Inter/Geist/Aspekta).
- **Weights**:
  - Default: `font-normal` (400)
  - Headings: `font-light` (300)
  - **Rule**: Never use `font-bold` - keep everything thin/normal.

### Colors & Theme

- **Theme Awareness**: Always use theme variables.
  - ✅ `text-foreground` / `text-muted-foreground`
  - ✅ `bg-background` / `bg-card` / `bg-muted`
  - ✅ `border-border`
  - ❌ Never hardcode colors like `text-black` or `bg-white` (except on specific dark overlays).

### Spacing

- **Section Padding**: `px-4 md:px-6` (Horizontal)
- **Gaps**: Use consistent spacing scales (`gap-4`, `gap-8`, `gap-12`).

---

## 2. Marketing Site (Enigmatic)

Designed for impact, storytelling, and brand presentation.

### Typography (Marketing)

- **Hero Headline**: `text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light`
- **Section Headline**: `text-2xl md:text-4xl font-normal`
- **Hero Subheadline**: `text-xl sm:text-2xl font-light`
- **Body Text**: `text-base text-secondary-foreground leading-relaxed`

### Layout Patterns

- **Full Screen Sections**: Main sections should be `min-h-screen`, content centered.
- **Floating Sections**: Use `mx-4 md:mx-6` and `rounded-3xl` for card-like sections (e.g., Services).
- **Video Containers**: `aspect-video`, `object-cover`, with `bg-black/40` to `bg-black/60` overlays.

### Components (Marketing)

- **Buttons**:
  - **Glass** (Hero): `variant="glass"` (`bg-foreground/10 border border-foreground/20`)
  - **Ghost**: `variant="ghost"`
  - **Rule**: **No shadows** on any buttons.
- **Gradients**:
  - Brand: `bg-gradient-to-r from-slate-400 via-purple-400 to-blue-400`
  - Dark Overlay: `bg-gradient-to-t from-black/60 via-black/20 to-transparent`

### Navigation

- **Header**: `h-14`, `bg-background` (solid), auto-hide on scroll.
- **Dropdowns**: `w-[400px]`, `p-4`, no shadows.

### Animations

- **Framer Motion**: Initial `opacity: 0, y: 20`, Animate `opacity: 1, y: 0`, Duration `0.6s-0.8s`.

---

## 3. Nodal Platform (App Dashboard)

**"Jules" Aesthetic**: A premium, high-density, monochrome interface designed for professional power users. Prioritizes content density and a flat, "no-shadow" look.

### Layout Structure

- **Sidebar (Left)**:
  - Width: `w-64` (Expanded) / `w-16` (Collapsed).
  - Background: `bg-zinc-50` (Light) / `bg-zinc-900` (Dark).
  - **High Density**: Items `h-8`, Icons `h-4 w-4`, Text `text-sm`.
- **Top Bar**: `h-14`, Sticky, Page Title, Global Actions.
- **Main Content**: `p-6`, `bg-background`.

### Typography (App)

- **Body/Navigation**: `text-sm` (14px) - _The standard unit._
- **Labels/Metadata**: `text-xs` (12px).
- **Headings**: `text-lg` or `text-xl`, `font-light`, `tracking-tight`.

### Components (App)

- **Buttons**: Flat, no shadow. Variants: `ghost` (nav), `outline`, `default`.
- **Inputs**: Flat, transparent border, `shadow-none`, `bg-muted/50`.
- **Avatars**: Monochrome (Black circle, White text), `h-8 w-8`.
- **Cards**: `bg-card`, `border-border`, `shadow-none`.

### Page Layout Patterns

#### Tabbed Page Layout (Integrations / Flow Studio)

- **TabsList**: `bg-muted`, `p-1`, `rounded-lg`, `inline-flex`.
- **TabsTrigger**: `rounded-md`, `px-4`, `py-1.5`, `text-sm`, `font-medium`.
- **Active State**: `bg-background`, `text-foreground`, `shadow-sm`.
- **Header**: Title `text-xl font-light tracking-tight`, Primary Action on right.

#### Card Grid Layout (Discover Tab)

- **Toolbar**: Search (`shadow-none`, `border-input`), Filter/Sort.
- **Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`, `gap-4`.
- **Cards**: `shadow-none`, `border-border`, `hover:bg-muted/50`, `cursor-pointer`.

#### Borderless Table Layout (Active Tab)

- **Container**: `rounded-md`, `border-none`.
- **Table**: Headers/Rows `border-none`, `hover:bg-muted/50`.

### Anti-Patterns (App)

- 🚫 **Shadows**: Avoid `shadow-sm`, `shadow-md`. Use borders for separation.
- 🚫 **Gradients**: Keep it flat.
- 🚫 **Large Rounded Corners**: Stick to `rounded-md` or `rounded-sm`.
- 🚫 **Dividers in Sidebar**: Use whitespace (`space-y`) instead.

---

## 4. Mobile Design Standards

### Layout & Spacing

- **Mobile-First**: Write base styles for mobile, then use `sm:`, `md:`, `lg:` for larger screens.
- **Section Sizing**:
  - Hero: `min-h-[100dvh]` (accounts for mobile address bars).
  - Content: Avoid `min-h-screen` on every section. Use `py-16` or `py-20`.
  - Container: `w-full` with `px-4` or `px-6`.
- **Grids**: Default `grid-cols-1`, switch to multi-column on `md`/`lg`.
- **Flex**: Default `flex-col`, switch to `flex-row` on larger screens.
- **Spacing**: Reduce gaps on mobile (`gap-6`/`gap-8`) vs desktop (`gap-12`/`gap-16`).

### Typography (Mobile)

- **Headings**: Scale down to prevent wrapping, but preserve design intent.
  - H1: `text-3xl` or `text-4xl` (mobile) -> Desktop size.
  - H2: `text-2xl` (mobile) -> Desktop size.
- **Body**: Minimum `text-base` (16px) for readability.

### Interactive Elements

- **Touch Targets**: Minimum 44x44px.
- **Buttons**: Often `w-full` on mobile for easier access.
- **Navigation**: Hamburger menu or simplified bar. Max height ~64px.

### Media & Components

- **Images**: `w-full h-auto`, `object-cover`.
- **Cards**: Stack vertically, remove fixed heights.
- **Animations**: Keep subtle. Avoid large horizontal movements.

---

## 5. Flow Studio Design

Standardized design for flow nodes (Triggers, Actions).

### Node Dimensions & Layout

- **Width**: Fixed `w-[250px]`.
- **Height**: Fixed `h-[120px]`.
- **Card Style**: `relative border-2 shadow-sm transition-colors group`.
- **Padding**: `p-4` for header/content.

### Node Header

- **Icon**:
  - Size: `h-4 w-4` (16px).
  - Container: `p-2 rounded-md` with subtype color background (e.g., `bg-purple-500/10`).
- **Labels**:
  - **Type Label**: `text-[10px] uppercase tracking-wider text-muted-foreground font-semibold`.
  - **Title**: `text-sm font-medium leading-none truncate`.

### Node Interaction

- **Delete Button**:
  - Style: `variant="ghost"`, `size="icon"`, `h-6 w-6`.
  - Visibility: `opacity-0 group-hover:opacity-100`.
  - **Critical Rule**: Must implement `e.stopPropagation()` on both `onClick` and `onMouseDown` to prevent opening the configuration modal.

### Node Content
- **Content**:
  - **Description**: A brief summary of the node's configuration (e.g., "Runs every day at 9:00 AM" or "GET https://api.example.com").
  - **Status**: A visual indicator (e.g., "Ready" with a green dot) or a call to action (e.g., "Click to configure" in orange).
  - **No Duplicate Titles**: The node title should NOT be repeated in the body.

### Configuration Modal

Standardized modal for node settings.

- **Layout**:
  - `DialogContent`: Fixed height `h-[85vh]`, max width `sm:max-w-[600px]`.
  - **Header/Footer**: Fixed (sticky), `p-6`.
  - **Body**: Scrollable (`overflow-y-auto`), `p-6 pb-20`.
- **Typography**:
  - Section Headers: `text-sm font-medium`.
  - Labels: `text-sm font-medium`.
- **Components**:
  - Inputs/Textareas: Standard shadcn components.
  - Key-Value Lists: For headers/params.
  - **Complex Selectors**: Use `Command` + `Popover` for searchable lists (e.g., Timezones).
```

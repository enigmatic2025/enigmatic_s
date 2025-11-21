# Mobile Design Standards

This document outlines the design standards for ensuring a high-quality mobile experience across the Enigmatic application.

## 1. Layout & Spacing

### Mobile-First Approach

- Write styles for mobile first (base classes), then use `sm:`, `md:`, `lg:`, `xl:` breakpoints for larger screens.
- **Example**: `p-4 md:p-6 lg:p-8`

### Section Sizing

- **Hero Section**: Use `min-h-[100dvh]` to account for mobile browser address bars.
- **Content Sections**: Avoid forcing `min-h-screen` on every section. Use vertical padding (`py-16` or `py-20`) to allow content to determine height. This prevents excessive whitespace on small screens.
- **Container Width**: Use `w-full` with `px-4` or `px-6` padding to ensure content doesn't touch the edges.

### Grids & Flexbox

- **Grids**: Default to `grid-cols-1` on mobile. Switch to multi-column layouts on `md` (tablet) or `lg` (desktop).
  - _Standard_: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Flex Direction**: Default to `flex-col` on mobile. Switch to `flex-row` on larger screens.
  - _Standard_: `flex-col md:flex-row`

### Spacing

- Reduce gaps on mobile to save space.
  - _Standard_: `gap-6` or `gap-8` on mobile, `gap-12` or `gap-16` on desktop.

## 2. Typography

### Headings

- **Preserve Desktop Design**: Do not alter the intended desktop font sizes or alignment unless explicitly requested.
- **Mobile Adjustments**: Scale down headings on mobile to prevent wrapping issues and excessive scrolling.
- **H1**: `text-3xl` or `text-4xl` (mobile) -> Match desktop design (e.g., `text-4xl`, `text-6xl`).
- **H2**: `text-2xl` (mobile) -> Match desktop design (e.g., `text-3xl`, `text-4xl`).

### Body Text

- Maintain readability. Do not go below `text-base` (16px) for main content.
- Use `leading-relaxed` for better readability on small screens.

## 3. Interactive Elements

### Touch Targets

- Ensure all interactive elements (buttons, links, inputs) have a minimum touch target size of 44x44px.
- Buttons should often be full-width (`w-full`) on mobile for easier access.

### Navigation

- Use a hamburger menu or simplified navigation bar on mobile.
- Ensure sticky headers do not obscure too much content (max height ~64px).

## 4. Media

### Images

- Use `w-full h-auto` to ensure images scale correctly.
- Use `object-cover` to fill containers without distortion.
- Consider hiding purely decorative, heavy media elements on mobile if they impact performance or layout significantly.

## 5. Components Specifics

### Cards & Bento Grids

- Cards should stack vertically on mobile.
- Remove fixed heights on cards for mobile to allow content to flow naturally.

### Animations

- Keep animations subtle on mobile. Complex scroll-linked animations can be jittery on some mobile devices.
- Ensure `initial` and `animate` states in Framer Motion handle mobile viewports correctly (e.g., animating from `y: 20` is fine, but avoid large horizontal movements `x: 100`).

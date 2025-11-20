# Enigmatic Design System

## Typography

### Headings
- **Hero Headline**: `text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light`
- **Section Headline**: `text-2xl md:text-3xl lg:text-4xl font-normal`
- **Video Overlay Text**: `text-xl md:text-2xl lg:text-3xl font-normal`

### Body Text
- **Hero Subheadline**: `text-xl sm:text-2xl font-light`
- **Muted Text**: Use `text-muted-foreground` for secondary text

### Font Weight
- Default: `font-normal` (400)
- Headings: `font-light` (300) for large text
- Never use `font-bold` - keep everything thin/normal

## Colors

### Text
- Primary: `text-foreground` (theme-aware)
- Secondary: `text-muted-foreground` (theme-aware)
- On Video Overlays: `text-white` (single color)

### Backgrounds
- Page: `bg-background`
- Cards: `bg-card`
- Muted: `bg-muted` or `bg-muted/50`
- Overlays: `bg-black/40` to `bg-black/60`

### Gradients
- Enigmatic Brand: `bg-gradient-to-r from-slate-400 via-purple-400 to-blue-400`
- Dark Overlay: `bg-gradient-to-t from-black/60 via-black/20 to-transparent`

## Buttons

### Variants
- **Glass** (Hero): `variant="glass"` - transparent with border
- **Ghost** (Secondary): `variant="ghost"` - minimal style
- **Default** (Primary): `variant="default"` - solid background

### Sizes
- Standard: Default size (no size prop)
- No custom sizing - use default

### Styling Rules
- **No shadows** on any buttons
- Glass buttons: `bg-foreground/10 border border-foreground/20`
- Always theme-aware colors

## Spacing

### Section Padding
- Desktop: `px-6 md:px-12 lg:px-16 py-20`
- Compact: `px-4 md:px-6 py-12`
- Video Section: `px-4 md:px-6 py-12`

### Container Widths
- Standard: `max-w-5xl` to `max-w-6xl`
- Wide: `max-w-7xl`
- Full Width: `max-w-[95%]`

### Gaps
- Between sections: `gap-12 lg:gap-16`
- Compact: `gap-8 lg:gap-12`

## Borders & Shadows

### Borders
- Standard: `border border-border`
- Thick: `border-2` or `border-4`
- Transparent: `border-transparent`

### Border Radius
- Cards/Videos: `rounded-2xl`
- Buttons: `rounded-md`
- Small elements: `rounded-lg`

### Shadows
- Large elements: `shadow-2xl`
- **No shadows on buttons**
- Navigation: No shadow (removed)

## Layout Patterns

### Full-Screen Sections
- Height: `min-h-screen`
- Centering: `flex items-center justify-center`

### Video Containers
- Aspect ratio: `aspect-video`
- Positioning: `relative` with `absolute inset-0` for overlays
- Object fit: `object-cover`

### Text Overlays
- Position: `absolute bottom-0 left-0`
- Padding: `p-8 md:p-12 lg:p-16`
- Max width: `max-w-3xl` to `max-w-4xl`

## Navigation

### Header
- Auto-hide on scroll down, show on scroll up
- Background: `bg-background` (solid, not transparent)
- Height: `h-14`
- No shadow

### Dropdowns
- Width: `w-[400px]`
- Padding: `p-4`
- Item padding: `px-4 py-3`
- Hover: `hover:bg-accent`
- No shadows

## Animations

### Framer Motion Defaults
- Initial: `opacity: 0, y: 20`
- Animate: `opacity: 1, y: 0`
- Duration: `0.6s` to `0.8s`
- Viewport: `once: true`

### Transitions
- Standard: `transition-all duration-300`
- Navbar: `duration-300`

## Theme Awareness

### Always Use Theme Variables
- ✅ `text-foreground` / `text-muted-foreground`
- ✅ `bg-background` / `bg-card` / `bg-muted`
- ✅ `border-border`
- ❌ Never hardcode colors like `text-black` or `bg-white` (except on dark overlays)

### Dark Overlays
- Use `text-white` and `text-white/70` on dark video overlays
- Background: `bg-black/40` to `bg-black/60`

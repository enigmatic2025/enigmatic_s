# Public Folder Structure for Images

This project organizes images in the `public/images` directory by their usage location within the app. For example:

- `/public/images/home/` — Images used on the home page
- `/public/images/company/` — Images for company-related sections
- `/public/images/insights/` — Images for insights/articles
- `/public/images/home/problem-cards/` — Images for the ProblemSection cards on the home page

## ProblemSection Card Images

Place the following images directly in `/public/images/home/`:

- `manual-workflows.jpg`
- `disconnected-systems.jpg`
- `hidden-costs.jpg`

Reference these filenames in your code to display the correct images in the ProblemSection cards.

This structure helps keep assets organized and easy to maintain as the project grows.

---

## Section Height Standardization

All major sections should use **`min-h-dvh`** (minimum height dynamic viewport height) for consistent full-screen spacing with breathing room.

### Why `min-h-dvh`?
- **Flexibility**: Content can expand beyond viewport if needed (no cutoff)
- **Breathing room**: Each section takes up at least full screen height
- **Responsive**: Adapts to different screen sizes naturally
- **Mobile-friendly**: Uses dynamic viewport height, accounting for browser UI (address bar, etc.)

### Applied Sections
- Hero Section
- Mission Quote Section
- Problem Section
- Services Section
- Nodal Platform Section

This is the modern industry standard used by top design-forward sites like Vercel and Framer.

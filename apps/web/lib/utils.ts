import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Teach tailwind-merge the custom tokens from globals.css. Without this it reads
// `text-body-sm` as a color and would drop `text-foreground` (or vice versa).
const twMerge = extendTailwindMerge<"text-gradient">({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "heading-cta", "heading-xl", "title-lg", "title-md", "title-sm", "lead", "body", "body-sm", "caption", "micro", "eyebrow"] }],
      "bg-image": ["bg-dot-grid", "bg-brand-glow"],
      "text-gradient": ["text-gradient-brand"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

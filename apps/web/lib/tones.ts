// One place to map a named tone to Tailwind classes. The brand trio is the
// "playful" accent; status tones are reserved for diagrams and sample UIs.

export type Tone = "blue" | "violet" | "pink" | "success" | "warning" | "danger" | "neutral";

export const accentTones = ["blue", "violet", "pink"] as const;

/** Cycle through the brand trio by index (blue → violet → pink). */
export const accentAt = (index: number): Tone => accentTones[index % accentTones.length];

/** Foreground color only — icons, numbers, inline highlights. */
export const toneText: Record<Tone, string> = {
  blue: "text-brand-blue",
  violet: "text-brand-violet",
  pink: "text-brand-pink",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-muted-foreground",
};

/** Tinted chip: soft background, hairline border, colored foreground. */
export const toneSoft: Record<Tone, string> = {
  blue: "bg-brand-blue/12 border-brand-blue/25 text-brand-blue",
  violet: "bg-brand-violet/12 border-brand-violet/25 text-brand-violet",
  pink: "bg-brand-pink/12 border-brand-pink/25 text-brand-pink",
  success: "bg-success/12 border-success/25 text-success",
  warning: "bg-warning/12 border-warning/25 text-warning",
  danger: "bg-danger/12 border-danger/25 text-danger",
  neutral: "bg-surface-2 border-border text-muted-foreground",
};

/** Solid fill — status dots and small markers. */
export const toneSolid: Record<Tone, string> = {
  blue: "bg-brand-blue",
  violet: "bg-brand-violet",
  pink: "bg-brand-pink",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-subtle",
};

/** Two-digit index label: 1 → "01". */
export const pad2 = (n: number) => String(n).padStart(2, "0");

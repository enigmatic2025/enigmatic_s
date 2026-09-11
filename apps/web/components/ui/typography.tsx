import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { toneSolid, toneText, type Tone } from "@/lib/tones";

// --- Heading ---------------------------------------------------------------

const headingVariants = cva("text-balance text-foreground", {
  variants: {
    size: {
      display: "text-display",
      cta: "text-heading-cta",
      xl: "text-heading-xl",
      lg: "text-title-lg",
      md: "text-title-md",
      sm: "text-title-sm",
    },
  },
  defaultVariants: { size: "xl" },
});

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & {
    as?: "h1" | "h2" | "h3" | "h4";
    /** Second line rendered in the brand gradient. */
    accent?: React.ReactNode;
  };

export function Heading({ as: Tag = "h2", size, accent, className, children, ...props }: HeadingProps) {
  return (
    <Tag className={cn(headingVariants({ size }), className)} {...props}>
      {children}
      {accent && <><br /><span className="text-gradient-brand">{accent}</span></>}
    </Tag>
  );
}

// --- Text ------------------------------------------------------------------

const textVariants = cva("", {
  variants: {
    size: {
      lead: "text-lead",
      body: "text-body",
      sm: "text-body-sm",
      caption: "text-caption",
      micro: "text-micro",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      subtle: "text-subtle",
    },
  },
  defaultVariants: { size: "body", tone: "muted" },
});

type TextProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof textVariants> & { as?: "p" | "span" | "div" | "small" };

export function Text({ as: Tag = "p", size, tone, className, ...props }: TextProps) {
  return <Tag className={cn(textVariants({ size, tone }), className)} {...props} />;
}

// --- Eyebrow ---------------------------------------------------------------

type EyebrowProps = React.HTMLAttributes<HTMLParagraphElement> & {
  /** Leading status dot in the given tone. */
  dot?: Tone;
  /** Color the label itself. Defaults to muted. */
  tone?: Tone | "default";
};

export function Eyebrow({ dot, tone, className, children, ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        "text-eyebrow flex items-center gap-2.5",
        tone === "default" ? "text-foreground" : tone ? toneText[tone] : "text-muted-foreground",
        className
      )}
      {...props}
    >
      {dot && <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", toneSolid[dot])} />}
      {children}
    </p>
  );
}

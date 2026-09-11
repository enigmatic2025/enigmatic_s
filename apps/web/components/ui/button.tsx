import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-3 whitespace-nowrap font-medium transition-[background-color,border-color,color,opacity] duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-200 [&_svg]:ease-out hover:[&_svg]:translate-x-0.5",
  {
    variants: {
      variant: {
        primary: "rounded-sm bg-foreground text-background hover:bg-foreground/85",
        secondary: "rounded-sm border border-border-strong text-foreground hover:border-foreground/40 hover:bg-surface-2",
        ghost: "rounded-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground",
        link: "text-foreground underline-offset-[6px] decoration-1 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-body-sm",
        md: "h-12 px-5 text-body-sm",
        lg: "h-14 px-6 text-body",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };

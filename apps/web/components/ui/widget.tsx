import * as React from "react";
import { cn } from "@/lib/utils";

const Widget = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { design?: string; size?: string }
>(({ className, design, size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden",
      className
    )}
    {...props}
  />
));
Widget.displayName = "Widget";

const WidgetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
WidgetHeader.displayName = "WidgetHeader";

const WidgetTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
WidgetTitle.displayName = "WidgetTitle";

const WidgetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0 flex flex-col", className)}
    {...props}
  />
));
WidgetContent.displayName = "WidgetContent";

export { Widget, WidgetHeader, WidgetContent, WidgetTitle };

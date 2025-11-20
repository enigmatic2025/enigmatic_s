import { cn } from "@/lib/utils";

interface MenuToggleIconProps {
  className?: string;
  open: boolean;
  duration?: number;
}

export function MenuToggleIcon({
  className,
  open,
  duration = 300,
}: MenuToggleIconProps) {
  const unitHeight = 4;
  const width = 24;
  const height = 24;
  const top = open ? height / 2 - unitHeight / 2 : height / 4 - unitHeight / 2;
  const bottom = open
    ? height / 2 - unitHeight / 2
    : (height * 3) / 4 - unitHeight / 2;
  const transition = `all ${duration}ms ease-in-out`;

  return (
    <div className={cn("relative", className)} style={{ width, height }}>
      <span
        className="absolute left-0 block w-full rounded-full bg-current"
        style={{
          height: unitHeight,
          top,
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          transition,
        }}
      />
      <span
        className="absolute left-0 block w-full rounded-full bg-current"
        style={{
          height: unitHeight,
          top: height / 2 - unitHeight / 2,
          opacity: open ? 0 : 1,
          transition,
        }}
      />
      <span
        className="absolute left-0 block w-full rounded-full bg-current"
        style={{
          height: unitHeight,
          top: bottom,
          transform: open ? "rotate(-45deg)" : "rotate(0deg)",
          transition,
        }}
      />
    </div>
  );
}

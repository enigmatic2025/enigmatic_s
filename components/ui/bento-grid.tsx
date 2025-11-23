import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-px max-w-7xl mx-auto bg-border border border-border rounded-3xl overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 p-6 bg-card text-card-foreground justify-between flex flex-col gap-8",
        className
      )}
    >
      <div>
        {icon}
        <div className="font-sans font-normal text-xl md:text-2xl text-card-foreground mb-2 mt-2">
          {title}
        </div>
        <div className="font-sans font-normal text-base text-muted-foreground leading-relaxed">
          {description}
        </div>
      </div>
      <div className="flex-1 min-h-0 w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] dark:bg-[radial-gradient(#ffffff22_1px,transparent_1px)] rounded-lg">
        {header}
      </div>
    </div>
  );
};

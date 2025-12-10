import React from "react";

export function DescriptionCell({ description }: { description: string }) {
  if (description.includes("|")) {
    const items = description.split("|").map((item) => item.trim());
    return (
      <div className="flex flex-wrap gap-1.5 py-1">
        {items.map((item, index) => {
          const [key, value] = item.split(":").map((s) => s.trim());
          
          if (value) {
            const baseClasses = "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium border";
            const colorClasses = "bg-secondary text-secondary-foreground border-border/50";

            if (value.includes(",")) {
              const subValues = value.split(",").map((v) => v.trim());
              return (
                <span key={index} className={`${baseClasses} ${colorClasses} h-auto`}>
                  <span className="opacity-70 mr-1.5 self-start mt-0.5">{key}:</span>
                  <div className="flex flex-wrap gap-1">
                    {subValues.map((v, i) => (
                      <span key={i} className="bg-background/60 px-1 rounded border border-transparent shadow-sm">
                        {v}
                      </span>
                    ))}
                  </div>
                </span>
              );
            }

            return (
              <span key={index} className={`${baseClasses} ${colorClasses}`}>
                <span className="opacity-70 mr-1.5">{key}:</span>
                <span>{value}</span>
              </span>
            );
          }
          return <span key={index} className="text-xs text-muted-foreground">{item}</span>;
        })}
      </div>
    );
  }
  return <div className="text-sm text-muted-foreground line-clamp-2">{description}</div>;
}

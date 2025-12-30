import { ChevronDown, ChevronRight, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface SidebarDraggableItemProps {
  label: string;
  icon: LucideIcon;
  iconColorClass: string;
  bgColorClass: string;
  dataTransferType: string;
}

export function SidebarDraggableItem({
  label,
  icon: Icon,
  iconColorClass,
  bgColorClass,
  dataTransferType,
}: SidebarDraggableItemProps) {
  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("application/reactflow", dataTransferType);
        event.dataTransfer.effectAllowed = "move";
      }}
      className="flex items-center gap-3 p-3 rounded-md border bg-card hover:bg-accent/50 cursor-grab active:cursor-grabbing transition-colors"
    >
      <div className={`p-2 rounded ${bgColorClass}`}>
        <Icon className={`h-5 w-5 ${iconColorClass}`} />
      </div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
}

interface SidebarSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  subtitle?: string;
}

export function SidebarSection({
  title,
  isOpen,
  onToggle,
  children,
  subtitle,
}: SidebarSectionProps) {
  return (
    <div className="border-b">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-4 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {title}
        </div>
        <span className="text-xs text-muted-foreground">
          {isOpen ? "See less" : "See more"}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 pt-2 space-y-6">
          {subtitle && (
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Play } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

interface FlowDesignerProps {
  flowId?: string;
}

export function FlowDesigner({ flowId }: FlowDesignerProps) {
  const router = useRouter();
  const params = useParams();

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-14 border-b bg-background flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push(`/nodal/${params.slug}/dashboard/flow-studio`)
            }
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold">
              {flowId ? `Flow #${flowId}` : "New Flow"}
            </h2>
            <span className="text-xs text-muted-foreground">
              {flowId ? "Last saved 2 mins ago" : "Unsaved changes"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Play className="h-4 w-4" />
            Test Run
          </Button>
          <Button size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            Save Flow
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-muted/10 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">Flow Designer Canvas</p>
            <p className="text-sm">
              Drag and drop actions here to build your flow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

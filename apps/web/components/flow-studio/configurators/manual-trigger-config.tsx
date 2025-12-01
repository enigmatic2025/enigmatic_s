"use client";

import { Label } from "@/components/ui/label";

interface ManualTriggerConfigProps {
  data: any;
  onUpdate: (newData: any) => void;
}

export function ManualTriggerConfig({ data, onUpdate }: ManualTriggerConfigProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-md bg-muted/20 text-sm text-muted-foreground">
        This trigger is manual. It does not require any additional configuration.
        You can trigger this flow by clicking the "Run" button in the dashboard or via API.
      </div>
    </div>
  );
}

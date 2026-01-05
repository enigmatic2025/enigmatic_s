import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";

export function LoopConfig({ data, onUpdate }: { data: any; onUpdate: (data: any) => void }) {
  
  const updateField = (field: string, value: string) => {
    onUpdate({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-md p-3 flex gap-3 text-sm text-blue-700 dark:text-blue-300">
        <Info className="h-5 w-5 shrink-0" />
        <div>
            <strong>How it works:</strong> This node runs the "Item" path for every element in the array. When the list is finished, it runs the "Done" path once.
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
            <Label>Array to Loop Over</Label>
            <Input 
                placeholder="{{ steps.trigger.items }}" 
                value={data.items || ""}
                onChange={(e) => updateField("items", e.target.value)}
                className="font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
                Select an array variable from a previous step.
            </p>
        </div>
        
        <div className="p-3 bg-muted/20 rounded border border-dashed text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Tip:</span> Inside the loop, you can access the current item using <code>{`{{ steps.${data.id || 'loop'}.item }}`}</code>
        </div>
      </div>
    </div>
  );
}

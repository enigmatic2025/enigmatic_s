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


      <div className="space-y-4">
        <div className="space-y-2">
            <Label>Array to Loop Over <span className="text-red-500">*</span></Label>
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

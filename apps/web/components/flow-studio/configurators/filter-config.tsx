import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";

export function FilterConfig({ data, onUpdate }: { data: any; onUpdate: (data: any) => void }) {
  const settings = data.settings || { 
    arrayVariable: "", 
    field: "", 
    operator: "==", 
    value: "" 
  };

  const updateSettings = (field: string, value: string) => {
    onUpdate({
      ...data,
      settings: {
        ...settings,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-md p-3 flex gap-3 text-sm text-blue-700 dark:text-blue-300">
        <Info className="h-5 w-5 shrink-0" />
        <div>
            This node filters an array of items. Only items matching the condition will typically be passed to the output.
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
            <Label>Array to Filter (Variable)</Label>
            <Input 
                placeholder="{{ steps.trigger.items }}" 
                value={settings.arrayVariable}
                onChange={(e) => updateSettings("arrayVariable", e.target.value)}
                className="font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground">Select an array from a previous step.</p>
        </div>

        <div className="border rounded-md p-4 space-y-4 bg-muted/20">
            <h5 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Keep items where...</h5>
            
            <div className="grid grid-cols-[1fr,120px,1fr] gap-2 items-start">
               {/* 1. Field */}
               <div className="space-y-1">
                   <Label className="text-[10px]">Item Field</Label>
                   <Input 
                        placeholder="price" 
                        value={settings.field}
                        onChange={(e) => updateSettings("field", e.target.value)}
                        className="font-mono text-xs"
                   />
               </div>

               {/* 2. Operator */}
               <div className="space-y-1">
                   <Label className="text-[10px]">Operator</Label>
                   <Select 
                        value={settings.operator} 
                        onValueChange={(val) => updateSettings("operator", val)}
                   >
                        <SelectTrigger className="font-mono text-xs h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="==">Equals</SelectItem>
                          <SelectItem value="!=">Not Equals</SelectItem>
                          <SelectItem value=">">Greater (&gt;)</SelectItem>
                          <SelectItem value="<">Less (&lt;)</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                        </SelectContent>
                   </Select>
               </div>

               {/* 3. Value */}
               <div className="space-y-1">
                   <Label className="text-[10px]">Value</Label>
                   <Input 
                        placeholder="100" 
                        value={settings.value}
                        onChange={(e) => updateSettings("value", e.target.value)}
                        className="font-mono text-xs"
                   />
               </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
                Example: Keep items where <code>price</code> <code>&gt;</code> <code>100</code>
            </p>
        </div>
      </div>
    </div>
  );
}

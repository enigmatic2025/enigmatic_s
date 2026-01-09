import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Info } from "lucide-react";

interface MapConfigProps {
  data: any;
  onUpdate: (newData: any) => void;
}

export function MapConfig({ data, onUpdate }: MapConfigProps) {
  const mappings = data.mappings || [];

  const updateData = (updates: any) => {
      // Calculate derived schema based on the *future* state
      const nextMappings = updates.mappings !== undefined ? updates.mappings : mappings;
      const nextFromArray = updates.fromArray !== undefined ? updates.fromArray : data.fromArray;
      
      const sample: Record<string, string> = {};
      nextMappings.forEach((m: any) => {
        if (m.target) sample[m.target] = "string"; 
      });
      
      const schema = nextFromArray 
         ? { data: [sample], count: 0 } 
         : sample;

      onUpdate({
          ...updates,
          lastRunResult: schema
      });
  };

  const updateField = (field: string, value: any) => {
    updateData({ [field]: value });
  };

  const addMapping = () => {
    const newMappings = [...mappings, { target: "", source: "" }];
    updateData({
        mappings: newMappings,
        description: `Mapping ${newMappings.length} fields`
    });
  };

  const removeMapping = (index: number) => {
    const newMappings = mappings.filter((_: any, i: number) => i !== index);
    updateData({
        mappings: newMappings,
        description: `Mapping ${newMappings.length} fields`
    });
  };

  const updateMapping = (index: number, field: string, value: string) => {
    const newMappings = [...mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    // updateField calls updateData via recursive logic if I'm not careful.
    // updateField uses updateData.
    // Here we want to update mappings directly.
    updateData({ mappings: newMappings });
  };

  return (
    <div className="space-y-6">


      <div className="space-y-4">
        {/* Source Array Input */}
        <div className="space-y-2">
            <Label>Input Array (Optional)</Label>
            <div className="flex gap-2">
                <Input 
                    value={data.fromArray || ""}
                    onChange={(e) => updateField("fromArray", e.target.value)}
                    placeholder="{{ steps.trigger.items }}"
                    className="font-mono text-sm"
                />
            </div>
            <p className="text-[10px] text-muted-foreground">
                Select an array to process multiple items. Leave empty to process a single object. Use <code>{"{{ item }}"}</code> to reference the current item in array mode.
            </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
            <Label>Mapping Fields</Label>
            <Button variant="outline" size="sm" onClick={addMapping} className="h-6 text-[10px]">
                <Plus className="h-3 w-3 mr-1" /> Add Field
            </Button>
        </div>
        
        <div className="space-y-2">
            {mappings.length === 0 && (
                <div className="text-xs text-muted-foreground italic p-4 border border-dashed rounded text-center">
                    No fields defined. The output will be an empty object <code>{"{}"}</code>.
                </div>
            )}
            
            {mappings.length > 0 && (
                 <div className="grid grid-cols-[1fr_1fr_24px] gap-2 px-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <div>Key (Target)</div>
                    <div>Value (Source)</div>
                    <div></div>
                 </div>
            )}

            {mappings.map((mapping: any, index: number) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_24px] gap-2 items-center">
                    <Input 
                        value={mapping.target}
                        onChange={(e) => updateMapping(index, "target", e.target.value)}
                        className="h-8 text-xs font-mono"
                        placeholder="e.g. user_id"
                    />
                    <Input 
                        value={mapping.source}
                        onChange={(e) => updateMapping(index, "source", e.target.value)}
                        className="h-8 text-xs font-mono"
                        placeholder="{{ steps.api.id }}"
                    />
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeMapping(index)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

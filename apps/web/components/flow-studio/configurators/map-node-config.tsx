import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export function MapNodeConfig({ data, onUpdate }: { data: any; onUpdate: (data: any) => void }) {
  const mappings = data.mappings || [];

  const addMapping = () => {
    onUpdate({
      mappings: [...mappings, { target: "", source: "" }]
    });
  };

  const updateMapping = (index: number, field: string, value: string) => {
    const newMappings = [...mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    onUpdate({ mappings: newMappings });
  };

  const removeMapping = (index: number) => {
    const newMappings = mappings.filter((_: any, i: number) => i !== index);
    onUpdate({ mappings: newMappings });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          This node transforms data from the previous step into a new structure.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Label>Mappings</Label>
        <Button variant="outline" size="sm" onClick={addMapping} className="h-7 text-xs gap-1">
          <Plus className="h-3 w-3" /> Add Field
        </Button>
      </div>

      <div className="space-y-2">
        {mappings.length === 0 && (
          <div className="text-xs text-muted-foreground text-center p-4 border rounded-md border-dashed">
            No mappings defined. The output will be the same as input.
          </div>
        )}
        
        {mappings.map((mapping: any, index: number) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1 space-y-1">
              <Input
                placeholder="Target Key (e.g. userName)"
                value={mapping.target}
                onChange={(e) => updateMapping(index, "target", e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Input
                placeholder="Source Value (e.g. {{ name }})"
                value={mapping.source}
                onChange={(e) => updateMapping(index, "source", e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => removeMapping(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

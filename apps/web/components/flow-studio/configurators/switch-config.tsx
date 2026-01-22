import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Info } from "lucide-react";

export function SwitchConfig({ data, onUpdate }: { data: any; onUpdate: (data: any) => void }) {
  
  const updateField = (field: string, value: any) => {
    onUpdate({
      ...data,
      [field]: value
    });
  };

  const cases = data.cases || [];

  const addCase = () => {
    const newCase = {
        id: self.crypto.randomUUID(),
        label: `Case ${cases.length + 1}`
    };
    const newCases = [...cases, newCase];
    updateField("cases", newCases);
  };

  const removeCase = (index: number) => {
    const newCases = cases.filter((_: any, i: number) => i !== index);
    updateField("cases", newCases);
  };

  const updateCaseLabel = (index: number, val: string) => {
    const newCases = [...cases];
    // Handle migration from string to object if needed
    if (typeof newCases[index] === 'string') {
        newCases[index] = { id: self.crypto.randomUUID(), label: val };
    } else {
        newCases[index] = { ...newCases[index], label: val };
    }
    updateField("cases", newCases);
  };

  return (
    <div className="space-y-6">


      <div className="space-y-4">
        <div className="space-y-2">
            <Label>Variable to Check <span className="text-red-500">*</span></Label>
            <Input 
                placeholder="{{ steps.trigger.data.status }}" 
                value={data.variable || ""}
                onChange={(e) => updateField("variable", e.target.value)}
                className="font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
                Enter the variable you want to switch on.
            </p>
        </div>

        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label>Cases</Label>
                <Button variant="outline" size="sm" onClick={addCase} className="h-6 text-[10px]">
                    <Plus className="h-3 w-3 mr-1" /> Add Case
                </Button>
            </div>
            
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {cases.length === 0 && (
                    <div className="text-xs text-muted-foreground italic p-2 border border-dashed rounded text-center">
                        No cases defined. Flow will always go to Default.
                    </div>
                )}
                {cases.map((caseItem: any, index: number) => {
                    const isObject = typeof caseItem === 'object';
                    const label = isObject ? caseItem.label : caseItem;

                    return (
                        <div key={index} className="flex gap-2 items-center">
                            <div className="text-[10px] font-mono text-muted-foreground w-6 text-center">
                                #{index + 1}
                            </div>
                            <Input 
                                value={label}
                                onChange={(e) => updateCaseLabel(index, e.target.value)}
                                className="h-8 text-xs font-mono flex-1"
                                placeholder="Value to match"
                            />
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeCase(index)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded border text-muted-foreground">
                 <div className="text-[10px] font-mono w-6 text-center">
                    Def
                 </div>
                 <div className="text-xs italic">
                    Default Path (Always Active)
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}

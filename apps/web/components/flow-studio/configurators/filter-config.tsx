import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Braces, Wand2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Condition {
  field: string;
  operator: string;
  value: string;
}

export function FilterConfig({ data, onUpdate }: { data: any; onUpdate: (data: any) => void }) {
  // Normalize settings with defaults and backward compatibility
  const settings = data.settings || {};
  
  // Migration: If conditions doesn't exist, use legacy single-fields or default to one empty condition
  const conditions: Condition[] = settings.conditions || [
    { 
      field: settings.field || "", 
      operator: settings.operator || "==", 
      value: settings.value || "" 
    }
  ];
  
  const matchType = settings.matchType || "ALL"; // "ALL" (AND) or "ANY" (OR)

  const updateSetting = (key: string, value: any) => {
    onUpdate({
      ...data,
      settings: {
        ...settings,
        [key]: value
      }
    });
  };

  const updateCondition = (index: number, key: keyof Condition, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [key]: value };
    updateSetting("conditions", newConditions);
  };

  const addCondition = () => {
    updateSetting("conditions", [...conditions, { field: "", operator: "==", value: "" }]);
  };

  const removeCondition = (index: number) => {
    if (conditions.length === 1) {
        // Don't remove the last one, just clear it? Or allow empty?
        updateCondition(index, "field", "");
        updateCondition(index, "value", "");
        return;
    }
    const newConditions = conditions.filter((_, i) => i !== index);
    updateSetting("conditions", newConditions);
  };

  // Schema Import State
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);
  const [sampleJson, setSampleJson] = useState("");

  const handleImportSample = () => {
    try {
        if (!sampleJson.trim()) {
            toast.error("Please enter valid JSON");
            return;
        }
        
        const parsed = JSON.parse(sampleJson);
        let resultStructure;

        if (Array.isArray(parsed)) {
            // User pasted an array -> This is the filtered list
            resultStructure = { 
                data: parsed, 
                count: parsed.length 
            };
        } else if (parsed && typeof parsed === 'object') {
            // User pasted an object.
            // If it already has 'data' array, assume it's the full result structure
            if (Array.isArray(parsed.data)) {
                resultStructure = parsed;
            } else {
                // Otherwise, treat as a SINGLE ITEM of the array
                resultStructure = {
                    data: [parsed],
                    count: 1
                };
            }
        } else {
            toast.error("Invalid sample: Must be an Array or Object");
            return;
        }

        // Update the node's 'lastRunResult' to simulate a run
        onUpdate({
            ...data,
            lastRunResult: resultStructure
        });

        toast.success("Schema updated from sample!");
        setIsSchemaOpen(false);
        setSampleJson("");

    } catch (e) {
        toast.error("Invalid JSON syntax");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Array Selection */}
      <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label>Array to Filter (Variable)</Label>
                 <Button variant="outline" size="sm" onClick={() => setIsSchemaOpen(true)} className="h-6 text-[10px] gap-1 h-auto py-1">
                    <Braces className="h-3 w-3" />
                    Define output structure
                </Button>
            </div>
            <Input 
                placeholder="{{ steps.trigger.items }}" 
                value={settings.arrayVariable || ""}
                onChange={(e) => updateSetting("arrayVariable", e.target.value)}
                className="font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground">Select an array from a previous step.</p>
      </div>

      <div className="border rounded-md p-4 space-y-4 bg-muted/20">
            {/* Header: Match Type */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Keep items where</span>
                    <Select 
                        value={matchType} 
                        onValueChange={(val) => updateSetting("matchType", val)}
                    >
                        <SelectTrigger className="h-7 text-xs w-[100px] bg-background">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">ALL (AND)</SelectItem>
                            <SelectItem value="ANY">ANY (OR)</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">conditions match</span>
                </div>
            </div>
            
            {/* Conditions List */}
            <div className="space-y-2">
               {conditions.map((condition: Condition, index: number) => (
                   <div key={index} className="grid grid-cols-[1fr,100px,1fr,32px] gap-2 items-start">
                       {/* Field */}
                       <div className="space-y-1">
                           {index === 0 && <Label className="text-[10px]">Item Field</Label>}
                           <Input 
                                placeholder="e.g. price" 
                                value={condition.field}
                                onChange={(e) => updateCondition(index, "field", e.target.value)}
                                className="font-mono text-xs"
                           />
                       </div>

                       {/* Operator */}
                       <div className="space-y-1">
                           {index === 0 && <Label className="text-[10px]">Operator</Label>}
                           <Select 
                                value={condition.operator} 
                                onValueChange={(val) => updateCondition(index, "operator", val)}
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

                       {/* Value */}
                       <div className="space-y-1">
                           {index === 0 && <Label className="text-[10px]">Value</Label>}
                           <Input 
                                placeholder="e.g. 100" 
                                value={condition.value}
                                onChange={(e) => updateCondition(index, "value", e.target.value)}
                                className="font-mono text-xs"
                           />
                       </div>

                       {/* Delete Button */}
                       <div className="space-y-1 pt-[1px]">
                           {index === 0 && <div className="h-[14px] mb-1"></div> /* Spacer for label */ } 
                           <Button
                                variant="ghost" 
                                size="icon"
                                className="h-9 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeCondition(index)}
                           >
                               <Trash2 className="h-4 w-4" />
                           </Button>
                       </div>
                   </div>
               ))}
            </div>

            <Button 
                variant="outline" 
                size="sm" 
                onClick={addCondition}
                className="text-xs h-7 gap-1"
            >
                <Plus className="h-3 w-3" /> Add Condition
            </Button>
      </div>

       {/* Schema Dialog */}
       <Dialog open={isSchemaOpen} onOpenChange={setIsSchemaOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Define Output Structure</DialogTitle>
                    <DialogDescription>
                        Paste a sample JSON item or array. This will not run the logic, but will update the Variable Explorer so you can select fields in future steps.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Sample JSON Output</Label>
                        <Textarea 
                            placeholder='{"id": 123, "name": "Sample Item"}' 
                            className="font-mono text-xs h-[200px]"
                            value={sampleJson}
                            onChange={(e) => setSampleJson(e.target.value)}
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Tip: Paste a single object representing one item in your filtered list.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSchemaOpen(false)}>Cancel</Button>
                    <Button onClick={handleImportSample}>
                        <Wand2 className="h-3 w-3 mr-2" />
                        Generate Schema
                    </Button>
                </DialogFooter>
            </DialogContent>
       </Dialog>

    </div>
  );
}

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { useFlowStore } from "@/lib/stores/flow-store";

export function VariableConfig({ data, onUpdate }: { data: any; onUpdate: (data: any) => void }) {
  const { variables } = useFlowStore();
  
  const updateField = (field: string, value: string) => {
    onUpdate({
      ...data,
      [field]: value
    });
  };

  const variableNames = Object.keys(variables);

  return (
    <div className="space-y-6">
      <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900 rounded-md p-3 flex gap-3 text-sm text-teal-700 dark:text-teal-300">
        <Info className="h-5 w-5 shrink-0" />
        <div>
            This node updates a global variable. You can verify the value in later steps using <code>{`{{ variables.name }}`}</code>.
        </div>
      </div>

      <div className="space-y-4">
        {/* Variable Selection */}
        <div className="space-y-2">
            <Label>Variable Name</Label>
            <Select 
                value={data.variableName || ""} 
                onValueChange={(val) => updateField("variableName", val)}
            >
                <SelectTrigger className="font-mono text-xs">
                  <SelectValue placeholder="Select a variable..." />
                </SelectTrigger>
                <SelectContent>
                  {variableNames.length === 0 ? (
                      <SelectItem value="_novars" disabled>No variables defined (Create in Sidebar)</SelectItem>
                  ) : (
                      variableNames.map(name => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))
                  )}
                </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
                You must define variables in the "Variables" sidebar tab first.
            </p>
        </div>

        {/* Value Input */}
        <div className="space-y-2">
            <Label>Set To Value</Label>
            <Input 
                placeholder="123 or {{ steps.trigger.data.id }}" 
                value={data.value || ""}
                onChange={(e) => updateField("value", e.target.value)}
                className="font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
                Enter a static value or use a variable reference.
            </p>
        </div>
      </div>
    </div>
  );
}

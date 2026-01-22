import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ConditionConfig({ data, onUpdate }: { data: any; onUpdate: (data: any) => void }) {
  const condition = data.condition || { left: "", operator: "==", right: "" };

  const updateCondition = (field: string, value: string) => {
    onUpdate({
      ...data,
      condition: {
        ...condition,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Define the logic for this branch. If the condition is true, the flow will follow the "True" path.
        </p>
      </div>

      <div className="grid gap-4 border rounded-md p-4 bg-muted/10">
        <div className="space-y-2">
          <Label>Value A (Left) <span className="text-red-500">*</span></Label>
          <Input 
            placeholder="{{ steps.trigger.data.status }}" 
            value={condition.left}
            onChange={(e) => updateCondition("left", e.target.value)}
            className="font-mono text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label>Operator <span className="text-red-500">*</span></Label>
          <Select 
            value={condition.operator} 
            onValueChange={(val) => updateCondition("operator", val)}
          >
            <SelectTrigger className="font-mono text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="==">Equals (==)</SelectItem>
              <SelectItem value="!=">Does Not Equal (!=)</SelectItem>
              <SelectItem value=">">Greater Than (&gt;)</SelectItem>
              <SelectItem value="<">Less Than (&lt;)</SelectItem>
              <SelectItem value=">=">Greater Than or Equal (&gt;=)</SelectItem>
              <SelectItem value="<=">Less Than or Equal (&lt;=)</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="matches">Matches Regex</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Value B (Right) <span className="text-red-500">*</span></Label>
          <Input 
            placeholder="success" 
            value={condition.right}
            onChange={(e) => updateCondition("right", e.target.value)}
            className="font-mono text-xs"
          />
        </div>
      </div>
    </div>
  );
}

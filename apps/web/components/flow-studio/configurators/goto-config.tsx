import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFlowStore } from "@/lib/stores/flow-store"; 
// We use the global store to access all nodes for the dropdown

interface GotoConfigProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function GotoConfig({ data, onUpdate }: GotoConfigProps) {
  const nodes = useFlowStore((state) => state.nodes);

  // Filter out the current node (we don't want to jump to self, technically possible but usually a bug in simple UI)
  // Actually, we don't know "current node ID" easily unless passed. 
  // But purely selecting from list is fine.
  
  // Filter out the Goto node itself to avoid immediate self-recursion?
  // We'll just list all valid targets (not other Gotos maybe? No, chaining Gotos is funny but valid).
  // Let's just list everything.
  
  const validTargets = nodes
    .filter(n => n.type !== 'goto') // Don't jump to another jump (optional, but cleaner)
    .sort((a, b) => (a.data.label || a.id).localeCompare(b.data.label || b.id));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Target Step</Label>
        <Select
          value={data.targetId || ""}
          onValueChange={(value) => onUpdate({ targetId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a step to jump to..." />
          </SelectTrigger>
          <SelectContent>
            {validTargets.map((node) => (
              <SelectItem key={node.id} value={node.id}>
                {node.data.label || node.id} ({node.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground">
            The flow execution will jump instantly to this step.
        </p>
      </div>
    </div>
  );
}

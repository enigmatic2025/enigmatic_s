import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFlowStore } from "@/lib/stores/flow-store";

interface GotoConfigProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function GotoConfig({ data, onUpdate }: GotoConfigProps) {
  const nodes = useFlowStore((state) => state.nodes);

  // Only allow blocking nodes as retry targets (human tasks and wait-for-event)
  const validTargets = nodes
    .filter(n => n.type === 'human-task' || n.type === 'automation')
    .sort((a, b) => (a.data.label || a.id).localeCompare(b.data.label || b.id));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Retry Target</Label>
        {validTargets.length > 0 ? (
          <>
            <Select
              value={data.targetId || ""}
              onValueChange={(value) => onUpdate({ targetId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a step to retry..." />
              </SelectTrigger>
              <SelectContent>
                {validTargets.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.data.label || node.id} ({node.type === 'human-task' ? 'Human Task' : 'Wait for Event'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              Jump back to this blocking step to retry or revisit it.
            </p>
          </>
        ) : (
          <div className="text-center py-4 border border-dashed border-border rounded-lg bg-muted/10">
            <p className="text-xs text-muted-foreground">
              Add a Human Task or Wait for Event step to your flow first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

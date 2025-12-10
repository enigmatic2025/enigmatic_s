import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Plane, AlertCircle } from "lucide-react";

const actions = [
  {
    label: "New Request",
    icon: PlusCircle,
    description: "Start a general approval workflow",
    variant: "default" as const,
  },
  {
    label: "Submit Expense",
    icon: FileText,
    description: "Upload receipts for reimbursement",
    variant: "secondary" as const,
  },
  {
    label: "Time Off",
    icon: Plane,
    description: "Request vacation or sick leave",
    variant: "secondary" as const,
  },
  {
    label: "Report Incident",
    icon: AlertCircle,
    description: "Log a security or system issue",
    variant: "destructive" as const, // Highlight this one
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Frequently used workflows you can start immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 grid-cols-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto flex-col items-start p-4 space-y-2 hover:bg-muted/50 hover:border-primary/50 transition-all"
          >
            <div className={`p-2 rounded-full ${
                action.variant === 'destructive' ? 'bg-red-100 text-red-600' : 
                action.variant === 'default' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
                <action.icon className="h-5 w-5" />
            </div>
            <div className="space-y-1 text-left">
              <span className="font-semibold">{action.label}</span>
              <p className="text-xs text-muted-foreground font-normal leading-snug">
                {action.description}
              </p>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

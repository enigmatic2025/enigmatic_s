import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Calendar, AlertCircle, Car } from "lucide-react";

const actions = [
  {
    label: "Position Request",
    icon: UserPlus,
    description: "Submit a new hiring request",
    variant: "default" as const,
  },
  {
    label: "PTO",
    icon: Calendar,
    description: "Request vacation or sick leave",
    variant: "secondary" as const,
  },
  {
    label: "Report Incident",
    icon: AlertCircle,
    description: "Log a security or system issue",
    variant: "destructive" as const,
  },
  {
    label: "Driver At Risk",
    icon: Car,
    description: "Initiate an at-risk driver case",
    variant: "destructive" as const,
  },
];

export function NewActionFlow() {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>New Action Flow</CardTitle>
        <CardDescription>
          Frequently used Action Flows you can start immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 grid-cols-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto flex-col items-start p-4 space-y-2 hover:bg-muted/50 transition-all"
          >
            <div className="p-2 rounded-full bg-primary/10 text-primary">
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

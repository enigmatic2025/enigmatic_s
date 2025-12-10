import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const systems = [
    { name: "AS400 TMS", status: "Live", isLive: true },
    { name: "Shop Connect View", status: "Live", isLive: true },
    { name: "Azure Active Directory", status: "Live", isLive: true },
    { name: "Tenstreet", status: "Down", isLive: false },
    { name: "UKG", status: "Live", isLive: true },
];

export function SystemStatus({ className }: { className?: string }) {
    return (
        <Card className={cn("shadow-none", className)}>
            <CardHeader>
                <CardTitle>Organization Systems</CardTitle>
                <CardDescription>Critical systems health.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {systems.map((system) => (
                        <div key={system.name} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{system.name}</span>
                            <div className="flex items-center gap-2">
                                <span className={cn("text-xs font-medium", system.isLive ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>
                                    {system.status}
                                </span>
                                <div className={cn(
                                    "h-2 w-2 aspect-square rounded-full",
                                    system.isLive 
                                        ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" 
                                        : "bg-muted-foreground/30"
                                )} />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

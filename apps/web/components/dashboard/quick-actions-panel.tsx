"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  Plus, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Zap,
  MessageSquare
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function QuickActionsPanel() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-4">
        {/* Top Row: "What's on your mind?" style input for Natalie/Flows */}
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/images/avatars/user-1.jpg" />
            <AvatarFallback>ST</AvatarFallback>
          </Avatar>
          <div className="flex-1 relative">
            <Input 
              placeholder="Ask Natalie or start a workflow..." 
              className="h-10 bg-muted/30 border-muted-foreground/20 hover:bg-muted/50 transition-colors rounded-full px-4"
            />
            <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="h-px bg-border/50" />

        {/* Bottom Row: Quick Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button variant="ghost" className="h-auto py-2 flex flex-col gap-1 text-muted-foreground hover:text-foreground">
            <Zap className="h-5 w-5 text-foreground" />
            <span className="text-xs font-medium">Quick Flow</span>
          </Button>
          <Button variant="ghost" className="h-auto py-2 flex flex-col gap-1 text-muted-foreground hover:text-foreground">
            <FileText className="h-5 w-5 text-foreground" />
            <span className="text-xs font-medium">New Report</span>
          </Button>
          <Button variant="ghost" className="h-auto py-2 flex flex-col gap-1 text-muted-foreground hover:text-foreground">
            <Users className="h-5 w-5 text-foreground" />
            <span className="text-xs font-medium">Team Huddle</span>
          </Button>
          <Button variant="ghost" className="h-auto py-2 flex flex-col gap-1 text-muted-foreground hover:text-foreground">
            <BarChart3 className="h-5 w-5 text-foreground" />
            <span className="text-xs font-medium">Analytics</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

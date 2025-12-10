"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Send, Sparkles } from "lucide-react";
import { useState } from "react";

export function NatalieChat() {
  const [query, setQuery] = useState("");

  return (
    <Card className="bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 border-primary/10 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                    <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                    <CardTitle className="text-base">Ask Natalie</CardTitle>
                    <CardDescription className="text-xs">Your AI Workflow Assistant</CardDescription>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="How do I create a new flow?" 
              className="bg-background/50 border-primary/10 focus-visible:ring-primary/20"
          />
          <Button size="icon" variant="ghost" className="shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10">
            <Mic className="h-4 w-4" />
          </Button>
          <Button size="icon" className="shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0 shadow-sm">
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

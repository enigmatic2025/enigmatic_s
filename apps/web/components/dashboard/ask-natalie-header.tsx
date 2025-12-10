"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AskNatalieHeader() {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <Card className="shadow-none border-none relative overflow-hidden transition-all duration-700 ease-in-out">
            <div className="absolute inset-0 bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/25 dark:via-purple-500/25 dark:to-pink-500/25" />
            <div className={cn(
                "absolute inset-0 bg-linear-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 dark:from-indigo-500/40 dark:via-purple-500/40 dark:to-pink-500/40 transition-opacity duration-700 ease-in-out",
                isFocused ? "opacity-100" : "opacity-0"
            )} />
            <div className="relative p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-row justify-center items-center space-x-5">
                    <div className={cn(
                        "h-10 w-10 aspect-square rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm transition-all duration-500",
                        isFocused ? "shadow-lg shadow-purple-500/50 scale-110 rotate-12" : ""
                    )}>
                        <Sparkles className={cn(
                            "h-5 w-5 text-white transition-all duration-500",
                            isFocused ? "animate-pulse" : ""
                        )} />
                    </div>
                    <div className="transition-all duration-500">
                        <h2 className={cn(
                            "text-2xl tracking-tight transition-colors duration-300",
                            isFocused ? "text-primary" : ""
                        )}>
                            Search with Natalie
                        </h2>
                        <p className="text-muted-foreground text-md max-w-xl">
                            Your AI assistant is ready to help you track your tasks, check status, or find information.
                        </p>
                    </div>
                </div>
                <div className="w-full md:w-auto md:min-w-[400px] flex gap-2 relative transition-all duration-500 ease-out">
                    <div className={cn(
                        "relative w-full rounded-md transition-all duration-300",
                        isFocused ? "shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/50" : ""
                    )}>
                        <Search className={cn(
                            "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300",
                            isFocused ? "text-indigo-500" : "text-muted-foreground"
                        )} />
                        <Input
                            placeholder="Ask anything about your Action Flows..."
                            className="h-12 pl-10 text-sm bg-background border-0 shadow-none focus-visible:ring-0 transition-all"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
}

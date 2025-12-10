import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Search } from "lucide-react";

export function AskNatalieHeader() {
    return (
        <Card className="shadow-none bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-none">
            <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-row justify-center items-center space-x-5">
                    <div className="h-10 w-10 aspect-square rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                    <h2 className="text-2xl tracking-tight">Search with Natalie</h2>
                    <p className="text-muted-foreground text-md max-w-xl">
                        Your AI assistant is ready to help you track your tasks, check status, or find information.
                    </p>
                    </div>
                </div>
                <div className="w-full md:w-auto md:min-w-[400px] flex gap-2 relative">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Ask anything about your Action Flows..."
                            className="h-12 pl-10 text-sm bg-background/50 border-0 shadow-none focus-visible:ring-0"
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
}

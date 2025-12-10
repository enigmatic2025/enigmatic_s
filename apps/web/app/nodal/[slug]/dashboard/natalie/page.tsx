"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mic, Sparkles, User, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const suggestions = [
  "Start a new hiring request",
  "Check status of recent Actions",
  "Show my overdue Actions",
  "Show my active Action Flows"
];

export default function NataliePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [userName, setUserName] = useState("there");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name.split(' ')[0]);
      }
    };
    getUser();
  }, []);

  const handleSendMessage = (text: string = inputValue) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Simulate response
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I can help you with that. Let me check your active tasks...",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, responseMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto w-full h-full flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center p-8">
              <div className="h-16 w-16 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Hi {userName}, how can I help?
                </h2>
                <p className="text-muted-foreground">
                  I can help you search resources, analyze data, or manage your tasks.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    className="h-auto py-4 px-6 justify-between text-left font-normal hover:bg-muted/50 shadow-xs group"
                    onClick={() => handleSendMessage(suggestion)}
                  >
                    {suggestion}
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className={`h-8 w-8 ${
                    message.role === "assistant" 
                    ? "bg-linear-to-tr from-indigo-500 to-purple-500" 
                    : "bg-muted"
                }`}>
                  {message.role === "assistant" ? (
                    <div className="flex items-center justify-center w-full h-full">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  )}
                </Avatar>
                
                <div
                  className={`rounded-lg p-3 max-w-[80%] text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground dark:bg-zinc-800 dark:text-white"
                      : "bg-background"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background/50">
        <div className="flex items-end gap-2 max-w-3xl mx-auto w-full">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask Natalie anything..."
            className="bg-background border-primary/10 focus-visible:ring-0 focus-visible:border-primary/10 min-h-20 resize-none"
          />
          <div className="flex gap-2 pb-1">
            <Button 
                size="icon" 
                variant="ghost" 
                className="shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

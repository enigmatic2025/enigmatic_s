"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mic, Sparkles, Send, Paperclip, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ActionExecutionPanelProps {
  actionName: string;
  actionType: string;
  actionDescription?: string;
  requiresExternal?: boolean;
}

export function ActionExecutionPanel({ 
  actionName, 
  actionType, 
  actionDescription,
  requiresExternal
}: ActionExecutionPanelProps) {
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
    
    // Initial greeting based on action
    setMessages([{
      id: "init",
      role: "assistant",
      content: `Hi ${userName || 'there'}! I'm here to help you complete the "${actionName}" action. ${actionDescription || ''}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  }, [actionName, actionDescription]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Simulate response
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I've received your input. Processing...",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, responseMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b shrink-0">
        <h3 className="font-medium text-sm">
          {actionName}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {actionDescription}
        </p>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <div className="space-y-4">
              {requiresExternal ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-3 p-6 border rounded border-dashed">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">External Action Required</h4>
                    <p className="text-xs text-muted-foreground max-w-[250px]">
                      This action needs to be completed in an external system.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
                    Open External Link
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 text-sm max-w-[85%]",
                      message.role === "user" ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      {message.role === "assistant" ? (
                        <AvatarFallback className="bg-muted">
                          <Sparkles className="h-4 w-4 text-foreground" />
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-muted">
                          {userName[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className={cn(
                      "rounded-lg p-3",
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground dark:bg-zinc-800 dark:text-white" 
                        : "bg-background"
                    )}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {!requiresExternal && (
            <div className="p-4 border-t mt-auto shrink-0">
              <div className="relative">
                <Textarea
                  placeholder={`Ask about "${actionName}"...`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="min-h-[70px] pr-12 resize-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

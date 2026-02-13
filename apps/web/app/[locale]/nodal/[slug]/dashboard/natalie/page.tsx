"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Send, Terminal, Loader2, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useChat } from "@ai-sdk/react";
import { Streamdown } from "streamdown";
import { DefaultChatTransport } from "ai";

export default function NataliePage() {
  const { slug } = useParams();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Manual input state
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/chat/stream',
      fetch: async (url, init) => {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = new Headers(init?.headers);
        if (session?.access_token) {
          headers.set('Authorization', `Bearer ${session.access_token}`);
        }

        // Transform body for legacy backend (expects 'message' string, not 'messages' array)
        let body = init?.body;
        if (typeof body === 'string') {
          try {
            const parsed = JSON.parse(body);
             if (parsed.messages && Array.isArray(parsed.messages)) {
              const lastMsg = parsed.messages[parsed.messages.length - 1];
              // Extract text from content string or parts
              let messageText = "";
              if (typeof lastMsg.content === 'string') {
                  messageText = lastMsg.content;
              } else if (lastMsg.parts && Array.isArray(lastMsg.parts)) {
                  messageText = lastMsg.parts
                    .filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text)
                    .join('');
              }
              
              if (messageText) {
                 body = JSON.stringify({ 
                     message: messageText,
                     context: parsed.context || "" // Preserve context if present
                 });
              }
            }
          } catch (e) {
            console.error("Failed to transform chat payload", e);
          }
        }

        const res = await fetch(url, { ...init, headers, body });
        
        if (!res.ok) {
            let errorMsg = `Error ${res.status}: ${res.statusText}`;
            try {
                const text = await res.text();
                // Try JSON parse
                const json = JSON.parse(text);
                if (json.error || json.message) {
                    errorMsg = json.message || json.error || errorMsg;
                } else {
                    errorMsg += ` - ${text.substring(0, 100)}`;
                }
            } catch (e) {
                // Ignore parse error
            }
            throw new Error(errorMsg);
        }
        
        return res;
      },
      body: {
        context: "" // Global context is injected by backend
      }
    }),
    onError: (e: Error) => {
        toast.error(e.message || "Something went wrong connected to Natalie.");
    }
  });

  // Derive isLoading from status
  const isLoading = status === 'submitted' || status === 'streaming';

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    
    try {
        await sendMessage({ text: userMessage });
    } catch (err) {
       // fallback
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black relative overflow-hidden">
        
        {/* Header - Minimalist */}
        <div className="flex-none p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-md flex items-center justify-center">
                    <Terminal className="w-4 h-4" />
                </div>
                <div>
                    <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Natalie</h1>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Operational
                    </div>
                </div>
            </div>
            
            {slug === 'enigmatic-i2v2i' && (
                 <div className="px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-[10px] font-medium uppercase tracking-wider rounded">
                     System Context
                 </div>
            )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">
            
            <div className="max-w-3xl mx-auto space-y-6">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 mt-20 opacity-50">
                        <Terminal className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                        <p className="text-sm text-zinc-400 dark:text-zinc-600">Start a conversation with Natalie</p>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const content = msg.parts 
                        ? msg.parts.filter(p => p.type === 'text').map(p => p.text).join('')
                        : '';
                        
                    return (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''} animate-in fade-in duration-300`}>
                        {msg.role === 'assistant' && (
                             <div className="w-6 h-6 mt-1 shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center">
                                 <Terminal className="w-3 h-3 text-zinc-500" />
                             </div>
                        )}
                        
                        <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`text-sm leading-relaxed ${
                                msg.role === 'user' 
                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-2 rounded-lg' 
                                    : 'text-zinc-700 dark:text-zinc-300'
                            }`}>
                                {msg.role === 'assistant' ? (
                                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-50 dark:prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800 prose-code:font-mono prose-code:text-zinc-700 dark:prose-code:text-zinc-300 font-normal">
                                        <Streamdown>{content}</Streamdown>
                                    </div>
                                ) : (
                                    content
                                )}
                            </div>
                        </div>
                    </div>
                    );
                })}
                
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                     <div className="flex gap-3">
                        <div className="w-6 h-6 mt-1 shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center">
                             <Loader2 className="w-3 h-3 text-zinc-400 animate-spin" />
                        </div>
                        <div className="text-sm text-zinc-400 italic">Thinking...</div>
                     </div>
                )}

                <div ref={scrollRef} />
            </div>

        </div>

        {/* Input Area */}
        <div className="flex-none p-4 md:p-6 bg-white dark:bg-black z-20">
            <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="relative flex items-center bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-colors">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask Natalie..."
                        className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
                        disabled={isLoading}
                    />
                    <div className="pr-2 pl-2">
                        <Button 
                            type="submit"
                            size="icon" 
                            variant="ghost"
                            disabled={!input.trim() || isLoading}
                            className="h-8 w-8 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            {isLoading ? <StopCircle className="w-4 h-4" onClick={() => stop()} /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>
                </form>
                
                <p className="text-center text-[10px] text-zinc-400 mt-2">
                    Natalie can make mistakes. Check important info.
                </p>
            </div>
        </div>

    </div>
  );
}

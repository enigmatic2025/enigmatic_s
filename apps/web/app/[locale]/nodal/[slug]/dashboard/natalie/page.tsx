"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Send, Terminal, Loader2, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function NataliePage() {
  const { slug } = useParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    setInputValue("");

    // Add user message
    const userMsgId = Date.now().toString();
    const userMsg: Message = {
      id: userMsgId,
      role: "user",
      content: userMessage,
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Create assistant message placeholder
    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          message: userMessage,
          context: "",
        }),
        signal: abortControllerRef.current.signal,
      });

      console.log('[Natalie] Response:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try {
          const json = JSON.parse(errorText);
          errorMsg = json.message || json.error || errorMsg;
        } catch (e) {
          // Ignore parse error
        }
        throw new Error(errorMsg);
      }

      // Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          // Parse Data Stream Protocol v1 format
          if (line.startsWith('0:')) {
            // Text chunk: 0:"content"
            try {
              const content = JSON.parse(line.slice(2));
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg && lastMsg.role === 'assistant') {
                  // Create a new object instead of mutating
                  newMessages[newMessages.length - 1] = {
                    ...lastMsg,
                    content: lastMsg.content + content
                  };
                }
                return newMessages;
              });
            } catch (e) {
              console.error('[Natalie] Failed to parse text chunk:', e);
            }
          } else if (line.startsWith('d:')) {
            // Data/finish message: d:{metadata}
            try {
              const data = JSON.parse(line.slice(2));
              console.log('[Natalie] Finish data:', data);
            } catch (e) {
              console.error('[Natalie] Failed to parse finish data:', e);
            }
          }
        }
      }

      console.log('[Natalie] Stream complete');
    } catch (err: any) {
      console.error("[Natalie] Failed to send message", err);

      // Remove the assistant message placeholder if there was an error
      setMessages(prev => prev.filter(m => m.id !== assistantMsgId));

      if (err.name !== 'AbortError') {
        toast.error(err.message || "Something went wrong with Natalie.");
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
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

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''} animate-in fade-in duration-300`}>
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
                                        <Streamdown>{msg.content}</Streamdown>
                                    </div>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </div>
                    </div>
                ))}

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
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask Natalie..."
                        className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
                        disabled={isLoading}
                    />
                    <div className="pr-2 pl-2">
                        <Button
                            type={isLoading ? "button" : "submit"}
                            size="icon"
                            variant="ghost"
                            disabled={!inputValue.trim() && !isLoading}
                            className="h-8 w-8 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            onClick={isLoading ? () => stop() : undefined}
                        >
                            {isLoading ? <StopCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
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

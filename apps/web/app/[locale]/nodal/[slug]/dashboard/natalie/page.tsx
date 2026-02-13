"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Bot, Send, Sparkles, User, Lightbulb, Command, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

// Configure marked for safe Markdown rendering
marked.setOptions({
  gfm: true,
  breaks: true,
});

export default function NataliePage() {
  const { slug } = useParams();
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { 
        role: 'assistant', 
        content: `**Hello.** I'm Natalie.\n\nI can help you analyze your workflows, debug errors, or recall data from the Enigmatic platform.\n\nWhat would you like to focus on today?` 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || input;
    if (!text.trim() || isLoading) return;

    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);

    try {
        // Get auth session
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const res = await fetch('/api/ai/chat/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                message: text,
                context: "" // Global context is injected by backend
            }),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to connect");
        }

        // Stream handling
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

        if (reader) {
            let buffer = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    const data = line.slice(6);
                    if (data === "[DONE]") break;

                    try {
                        const chunk = JSON.parse(data);
                        const content = chunk.choices?.[0]?.delta?.content || "";
                        if (content) {
                            assistantContent += content;
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                                return updated;
                            });
                        }
                    } catch { /* ignore json parse errors */ }
                }
            }
        }
    } catch (e: any) {
        toast.error(e.message || "Something went wrong");
        setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error connecting to the system. Please try again." }]);
    } finally {
        setIsLoading(false);
        // Re-focus input after response
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const suggestions = [
      { icon: Sparkles, label: "Analyze recent failures", prompt: "Analyze the most recent failed action flows and tell me why they failed." },
      { icon: Command, label: "List active workflows", prompt: "List all currently running workflows and their status." },
      { icon: Lightbulb, label: "Explain system status", prompt: "What is the current health status of the Enigmatic platform?" },
  ];

  const renderMarkdown = (content: string) => {
      const rawMarkup = marked.parse(content) as string;
      const sanitized = DOMPurify.sanitize(rawMarkup);
      return { __html: sanitized };
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-950 relative overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
            <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-500/5 dark:bg-purple-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
        </div>

        {/* Header */}
        <div className="flex-none p-6 border-b border-zinc-100 dark:border-zinc-800/50 backdrop-blur-sm z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200 dark:shadow-zinc-900/20">
                    <Bot className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Natalie</h1>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Active • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
            </div>
            
            {/* Optional: Org Scope Badge */}
            {slug === 'enigmatic-i2v2i' && (
                 <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                     Super Admin Access
                 </div>
            )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 z-10 space-y-8">
            
            <div className="max-w-3xl mx-auto space-y-8">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        {msg.role === 'assistant' && (
                             <div className="w-8 h-8 mt-1 shrink-0 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                                 <Sparkles className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                             </div>
                        )}
                        
                        <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-br-none' 
                                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none'
                            }`}>
                                {msg.role === 'assistant' ? (
                                    <div 
                                        className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-pink-50 dark:prose-code:bg-pink-500/10 prose-code:px-1 prose-code:rounded font-normal"
                                        dangerouslySetInnerHTML={renderMarkdown(msg.content)}
                                    />
                                ) : (
                                    msg.content
                                )}
                            </div>
                            {idx === messages.length - 1 && isLoading && msg.role === 'user' && (
                                <div className="text-xs text-zinc-400 animate-pulse pl-1">Natalie is thinking...</div>
                            )}
                        </div>

                         {msg.role === 'user' && (
                             <div className="w-8 h-8 mt-1 shrink-0 bg-zinc-900/5 dark:bg-white/10 rounded-lg flex items-center justify-center">
                                 <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                             </div>
                        )}
                    </div>
                ))}
                
                {isLoading && messages[messages.length - 1].role === 'user' && (
                     <div className="flex gap-4">
                        <div className="w-8 h-8 mt-1 shrink-0 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                             <Sparkles className="w-4 h-4 text-zinc-500 dark:text-zinc-400 animate-pulse" />
                        </div>
                        <div className="px-5 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                        </div>
                     </div>
                )}

                <div ref={scrollRef} />
            </div>

        </div>

        {/* Input Area */}
        <div className="flex-none p-6 z-20">
            <div className="max-w-3xl mx-auto space-y-4">
                
                {/* Suggestions (Only show if empty or few messages) */}
                {messages.length < 3 && !isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {suggestions.map((s, i) => (
                            <button 
                                key={i}
                                onClick={() => handleSend(s.prompt)}
                                className="flex items-center gap-3 p-3 text-left bg-white/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all duration-200 group"
                            >
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/20 rounded-lg text-zinc-500 group-hover:text-blue-600 dark:text-zinc-400 dark:group-hover:text-blue-400 transition-colors">
                                    <s.icon className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
                                    {s.label}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur-md"></div>
                    <div className="relative flex items-center bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/50 overflow-hidden">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask Natalie about your data..."
                            className="flex-1 px-5 py-4 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
                            disabled={isLoading}
                        />
                        <div className="pr-3">
                            <Button 
                                size="icon" 
                                onClick={() => handleSend()} 
                                disabled={!input.trim() || isLoading}
                                className={`h-9 w-9 rounded-lg transition-all duration-300 ${
                                    input.trim() 
                                    ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:scale-105' 
                                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed'
                                }`}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
                
                <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-600">
                    Natalie uses AI and may produce inaccurate information. Verify critical data.
                </p>
            </div>
        </div>

    </div>
  );
}

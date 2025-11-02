import { useState, useEffect, useRef } from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const sessionId = getSessionId();

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadChatHistory() {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading chat:", error);
      return;
    }

    if (data && data.length > 0) {
      setMessages(data.map(msg => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content
      })));
    } else {
      // Show welcome message for new users
      const welcomeMsg: Message = {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm your MindAid assistant. How are you feeling today? Remember, our chat is anonymous and secure."
      };
      setMessages([welcomeMsg]);
    }
  }

  async function sendMessage() {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `temp_${Date.now()}`,
      role: "user",
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Save user message
    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      role: "user",
      content: userMessage.content
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: messages.concat(userMessage).map(m => ({
              role: m.role,
              content: m.content
            }))
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      let assistantContent = "";
      const assistantId = `ai_${Date.now()}`;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;

        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.role === "assistant" && lastMsg.id === assistantId) {
                  return prev.map(m => 
                    m.id === assistantId ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { id: assistantId, role: "assistant", content: assistantContent }];
              });
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }

      // Save assistant message
      if (assistantContent) {
        await supabase.from("chat_messages").insert({
          session_id: sessionId,
          role: "assistant",
          content: assistantContent
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      
      <main className="flex-1 pt-20 pb-32 px-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <Avatar className="h-10 w-10 shrink-0 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    AI
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "glass"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
              
              {message.role === "user" && (
                <Avatar className="h-10 w-10 shrink-0 border-2 border-primary/20">
                  <AvatarFallback className="bg-secondary">
                    You
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-10 w-10 shrink-0 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="glass rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-75" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4">
        <div className="mx-auto max-w-2xl">
          <div className="glass rounded-2xl p-3 flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
              className="min-h-[44px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="shrink-0 h-11 w-11 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

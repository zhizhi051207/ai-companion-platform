import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatInput } from "@/components/chat-input";
import { MessageBubble, StreamingMessage } from "@/components/message-bubble";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Bot, Sparkles } from "lucide-react";
import type { Conversation, Message } from "@shared/schema";

interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export default function ChatPage() {
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: activeConversation, isLoading: messagesLoading } = useQuery<ConversationWithMessages>({
    queryKey: ["/api/conversations", activeConversationId],
    enabled: !!activeConversationId,
  });

  // Auto-select the most recent conversation on initial load
  useEffect(() => {
    if (!conversationsLoading && conversations.length > 0 && activeConversationId === null) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, conversationsLoading, activeConversationId]);

  const createConversation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/conversations", { title: "New Chat" });
      return response.json();
    },
    onSuccess: (data: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setActiveConversationId(data.id);
    },
  });

  const deleteConversation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/conversations/${id}`);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (activeConversationId === deletedId) {
        setActiveConversationId(null);
      }
    },
  });

  const sendMessage = useCallback(async (content: string) => {
    if (!activeConversationId || isStreaming) return;

    setIsStreaming(true);
    setStreamingContent("");

    const userMessage: Message = {
      id: Date.now(),
      conversationId: activeConversationId,
      role: "user",
      content,
      createdAt: new Date(),
    };

    queryClient.setQueryData<ConversationWithMessages>(
      ["/api/conversations", activeConversationId],
      (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: [...old.messages, userMessage],
        };
      }
    );

    setTimeout(scrollToBottom, 100);

    try {
      const response = await fetch(`/api/conversations/${activeConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                setStreamingContent(fullContent);
                scrollToBottom();
              }
              if (data.done) {
                setIsStreaming(false);
                queryClient.invalidateQueries({ queryKey: ["/api/conversations", activeConversationId] });
                queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsStreaming(false);
    }
  }, [activeConversationId, isStreaming, scrollToBottom]);

  useEffect(() => {
    if (activeConversation?.messages) {
      scrollToBottom();
    }
  }, [activeConversation?.messages, scrollToBottom]);

  const handleNewChat = () => {
    createConversation.mutate();
  };

  const sidebarStyle = {
    "--sidebar-width": "280px",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full overflow-hidden">
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={setActiveConversationId}
          onNew={handleNewChat}
          onDelete={(id) => deleteConversation.mutate(id)}
          isLoading={createConversation.isPending}
        />

        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-medium text-foreground">
                {activeConversation?.title || "AI Companion"}
              </span>
            </div>
            <ThemeToggle />
          </header>

          <div className="flex-1 overflow-hidden">
            {!activeConversationId ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Welcome to AI Companion
                </h2>
                <p className="text-muted-foreground max-w-md mb-8">
                  I'm here to chat with you anytime. Start a new conversation and let's talk about anything on your mind.
                </p>
                <Button
                  onClick={handleNewChat}
                  disabled={createConversation.isPending}
                  className="rounded-full px-6"
                  data-testid="button-start-chat"
                >
                  Start a New Chat
                </Button>
              </div>
            ) : messagesLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-4 md:p-6 space-y-6 min-h-full">
                  {activeConversation?.messages?.length === 0 && !isStreaming && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                        <Bot className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-muted-foreground max-w-sm">
                        Hi there! I'm your AI companion. Feel free to share what's on your mind.
                      </p>
                    </div>
                  )}
                  
                  {activeConversation?.messages?.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}

                  {isStreaming && (
                    <StreamingMessage content={streamingContent} isStreaming={true} />
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            )}
          </div>

          {activeConversationId && (
            <ChatInput
              onSend={sendMessage}
              disabled={isStreaming}
              placeholder="Share your thoughts..."
            />
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}

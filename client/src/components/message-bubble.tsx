import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import type { Message } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 w-full",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      data-testid={`message-${message.role}-${message.id}`}
    >
      <Avatar className={cn(
        "h-8 w-8 shrink-0",
        isUser ? "bg-primary" : "bg-gradient-to-br from-primary/80 to-primary"
      )}>
        <AvatarFallback className={cn(
          "text-primary-foreground",
          isUser ? "bg-primary" : "bg-gradient-to-br from-primary/80 to-primary"
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex flex-col max-w-[80%] md:max-w-[70%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : "bg-card text-card-foreground rounded-tl-md border border-card-border"
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

interface StreamingMessageProps {
  content: string;
  isStreaming?: boolean;
}

export function StreamingMessage({ content, isStreaming }: StreamingMessageProps) {
  return (
    <div className="flex gap-3 w-full flex-row" data-testid="message-streaming">
      <Avatar className="h-8 w-8 shrink-0 bg-gradient-to-br from-primary/80 to-primary">
        <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col max-w-[80%] md:max-w-[70%] items-start">
        <div className="px-4 py-3 rounded-2xl rounded-tl-md text-sm leading-relaxed bg-card text-card-foreground border border-card-border">
          {content || (
            <span className="text-muted-foreground">Thinking...</span>
          )}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary animate-pulse rounded-sm" />
          )}
        </div>
      </div>
    </div>
  );
}

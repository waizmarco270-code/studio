"use client";

import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import type { Stream } from "@/app/(ai)/ai/chat/actions";
import { useStreamingText } from "@/hooks/use-streaming-text";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string | React.ReactNode;
  stream?: Stream;
}

export function ChatMessage({ role, content, stream }: ChatMessageProps) {
  const isUser = role === "user";
  const streamedContent = useStreamingText(stream);

  return (
    <div
      className={cn(
        "flex items-start gap-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 border">
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </div>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-lg px-4 py-3 shadow-sm",
          isUser
            ? "bg-muted text-foreground"
            : "bg-card text-foreground"
        )}
      >
        {stream ? (
          <ReactMarkdown
            className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-p:m-0 prose-headings:font-semibold prose-headings:text-foreground prose-headings:m-0 prose-ul:m-0 prose-ol:m-0 prose-table:my-2 prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1 prose-th:border prose-td:border"
          >
            {streamedContent}
          </ReactMarkdown>
        ) : typeof content === 'string' ? (
          <ReactMarkdown
            className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-p:m-0 prose-headings:font-semibold prose-headings:text-foreground prose-headings:m-0 prose-ul:m-0 prose-ol:m-0 prose-table:my-2 prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1 prose-th:border prose-td:border"
          >
            {content}
          </ReactMarkdown>
        ) : (
           content
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 border">
          <AvatarImage
            src="https://picsum.photos/seed/chat-user/40/40"
            alt="User"
            data-ai-hint="person face"
          />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

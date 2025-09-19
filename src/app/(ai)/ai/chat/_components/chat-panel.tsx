"use client";
import React, { useState, useTransition } from "react";
import {
  Paperclip,
  Send,
  Bot,
  BrainCircuit,
  GraduationCap,
  Sparkles,
  Loader2,
  Mic,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { FileUploadDialog } from "./file-upload-dialog";
import { implementAIIdentity } from "@/ai/flows/implement-ai-identity";
import { useToast } from "@/hooks/use-toast";
import { AvatarCanvas } from "../../avatar/_components/avatar-canvas";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: input },
    ];
    setMessages(newMessages);
    const currentInput = input;
    setInput("");

    startTransition(async () => {
      try {
        const result = await implementAIIdentity(currentInput);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result },
        ]);
      } catch (error) {
        const errorMessage =
          (error as Error)?.message || "Something went wrong. Please try again.";
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage.includes("API key")
            ? "The Gemini API Key is missing. Please add it in the Settings page."
            : errorMessage,
        });
        setMessages(newMessages); // Restore previous messages on error
      }
    });
  };

  const handleFileUploadClick = () => {
    setDialogOpen(true);
  };

  const handleFileConfirm = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center bg-background text-foreground">
      <header className="absolute top-0 right-0 p-4">
        <ThemeToggle />
      </header>

      <div className="flex flex-1 flex-col w-full max-w-3xl pt-16 pb-32">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
             <div className="h-48 w-48">
              <AvatarCanvas isAnimated={true} />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tighter">
              How can I help you today?
            </h1>
          </div>
        ) : (
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <ChatMessage key={index} {...message} />
              ))}
              {isPending && (
                <ChatMessage
                  role="assistant"
                  content={<Loader2 className="h-5 w-5 animate-spin" />}
                />
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/50 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-3xl p-4 space-y-4">
          <div className="flex justify-center gap-2">
             <Button variant="outline" size="sm" className="rounded-full">
                <GraduationCap className="mr-2 h-4 w-4" /> Study
              </Button>
               <Button variant="outline" size="sm" className="rounded-full">
                <BrainCircuit className="mr-2 h-4 w-4" /> Exam
              </Button>
               <Button variant="outline" size="sm" className="rounded-full">
                <Bot className="mr-2 h-4 w-4" /> General
              </Button>
               <Button variant="outline" size="sm" className="rounded-full">
                <Sparkles className="mr-2 h-4 w-4" /> Fun
              </Button>
          </div>
          <form
            onSubmit={handleSendMessage}
            className="relative flex items-center"
          >
             <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message MarcoAI..."
              className="min-h-[50px] w-full resize-none rounded-2xl border-2 border-border bg-card pr-24 pl-12 shadow-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  handleSendMessage(e);
                }
              }}
              disabled={isPending}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2"
              onClick={handleFileUploadClick}
              disabled={isPending}
            >
              <Paperclip className="h-5 w-5" />
              <span className="sr-only">Upload file</span>
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" />

            <Button
              type="submit"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isPending || !input.trim()}
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
           <p className="text-center text-xs text-muted-foreground">
             MarcoAI can make mistakes. Consider checking important information.
            </p>
        </div>
      </div>
      <FileUploadDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleFileConfirm}
      />
    </div>
  );
}

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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { PromptTemplates } from "./prompt-templates";
import { FileUploadDialog } from "./file-upload-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { implementAIIdentity } from "@/ai/flows/implement-ai-identity";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "I am Marco AI, born from the vision of WaizMarco — here to make your journey legendary. How can I assist you today?",
  },
];

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const newMessages: Message[] = [...messages, { role: "user", content: input }];
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
         const errorMessage = (error as Error)?.message || "Something went wrong. Please try again.";
         toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage.includes('API key') 
            ? "The Gemini API Key is missing. Please add it in the Settings page."
            : errorMessage,
        });
        // Restore user input on failure
        setMessages(newMessages);
      }
    });
  };
  
  const handleFileUploadClick = () => {
    setDialogOpen(true);
  };
  
  const handleFileConfirm = () => {
    fileInputRef.current?.click();
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="font-headline text-2xl font-bold">Chat</h1>
          <p className="text-muted-foreground">Interact with MarcoAI</p>
        </div>
        <div className="hidden md:block">
           <ThemeToggle />
        </div>
      </div>

      <Tabs defaultValue="study" className="mt-4 flex flex-1 flex-col">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-4">
          <TabsTrigger value="study">
            <GraduationCap className="mr-2 h-4 w-4" /> Study
          </TabsTrigger>
          <TabsTrigger value="exam">
            <BrainCircuit className="mr-2 h-4 w-4" /> Exam
          </TabsTrigger>
          <TabsTrigger value="general">
            <Bot className="mr-2 h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="creative">
            <Sparkles className="mr-2 h-4 w-4" /> Fun
          </TabsTrigger>
        </TabsList>
        <div className="mt-4 flex flex-1 gap-6 overflow-hidden">
          <div className="hidden w-1/3 flex-col gap-4 lg:flex">
             <h2 className="font-headline text-lg font-semibold">Prompt Tools</h2>
             <PromptTemplates />
          </div>
          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border bg-card">
            <TabsContent value="study" className="h-full flex-1 flex-col overflow-hidden data-[state=inactive]:hidden">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <ChatMessage key={index} {...message} />
                  ))}
                  {isPending && (
                    <ChatMessage
                      role="assistant"
                      content={
                        <Loader2 className="h-5 w-5 animate-spin" />
                      }
                    />
                  )}
                </div>
              </ScrollArea>
              <div className="border-t p-4">
                <form
                  onSubmit={handleSendMessage}
                  className="relative flex items-center gap-2"
                >
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about anything..."
                    className="min-h-[40px] flex-1 resize-none pr-20"
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
                    className="absolute right-11 top-1/2 -translate-y-1/2"
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
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    disabled={isPending}
                  >
                    {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </div>
            </TabsContent>
            {/* Add TabsContent for other modes */}
            <TabsContent value="exam" className="p-4 text-center text-muted-foreground">Exam Mode coming soon.</TabsContent>
            <TabsContent value="general" className="p-4 text-center text-muted-foreground">General Chat coming soon.</TabsContent>
            <TabsContent value="creative" className="p-4 text-center text-muted-foreground">Fun Mode coming soon.</TabsContent>
          </div>
        </div>
      </Tabs>
      <FileUploadDialog open={isDialogOpen} onOpenChange={setDialogOpen} onConfirm={handleFileConfirm} />
    </div>
  );
}

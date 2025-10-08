
"use client";
import React, { useState, useTransition, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Send,
  Loader2,
  Mic,
  MicOff,
  Paperclip,
  PanelLeft,
  BookMarked,
  Settings,
  X as VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { summarizeUploadedFiles } from "@/ai/flows/summarize-uploaded-files";
import { useToast } from "@/hooks/use-toast";
import { AvatarCanvas } from "../../avatar/_components/avatar-canvas";
import { FileUploadDialog } from "./file-upload-dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { useTypingEffect } from "@/hooks/use-typing-effect";
import type { Message } from "@/app/(ai)/ai/chat/actions";
import { getChat, saveChat, streamChat } from "@/app/(ai)/ai/chat/actions";
import Link from "next/link";


const examplePrompts = [
  "Explain me about MindMate.",
  "How can I improve my focus?",
  "Create a study plan for my exams.",
  "Suggest a morning routine for success.",
];

const placeholderPrompts = [
    "Ask anything...",
    "Explain a complex topic...",
    "Help me brainstorm ideas...",
    "Translate a phrase...",
];

const initialMessages: Message[] = [
    {
      role: "assistant",
      content: "Hey 👋 Welcome MindMate Users",
    },
    {
      role: "assistant",
      content: "Hello! I am Marco AI. How can I help you today?",
    },
];

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatPanelProps {
  onShowTemplates: () => void;
  chatId: string;
  userId: string;
}

export function ChatPanel({ onShowTemplates, chatId, userId }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileSummary, setFileSummary] = useState<{ name: string; summary: string | null; progress: string | null } | null>(null);
  const { toggleSidebar } = useSidebar();
  const placeholder = useTypingEffect(placeholderPrompts, 100, 2000);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);

   useEffect(() => {
    if (typeof window !== 'undefined') {
      const tts = localStorage.getItem('marco-ai-tts-enabled') === 'true';
      setIsTtsEnabled(tts);
    }
  }, []);

  useEffect(() => {
    // When the chat ID changes, fetch the corresponding chat messages
    if (chatId !== 'new' && userId) {
      startTransition(async () => {
        const chat = await getChat(chatId, userId);
        if (chat && chat.messages && chat.messages.length > 0) {
          setMessages(chat.messages.map(m => ({role: m.role, content: m.content})));
        } else {
          setMessages(initialMessages);
        }
      });
    } else {
      setMessages(initialMessages);
    }
  }, [chatId, userId]);


  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSendMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        toast({
          variant: "destructive",
          title: "Voice Error",
          description: `An error occurred with speech recognition: ${event.error}`,
        });
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

  }, [toast]);
  
   useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, fileSummary]);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      toast({
          variant: "destructive",
          title: "Not Supported",
          description: "Your browser does not support voice recognition.",
        });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    if (isPending) return;

    const newUserMessage: Message = { role: "user", content: text };
    
    const currentMessages = chatId === 'new' && messages.length === initialMessages.length
        ? []
        : messages;

    const newMessages = [...currentMessages, newUserMessage];
    setMessages(newMessages);
    setInput("");

    startTransition(async () => {
      try {
        const stream = await streamChat(newMessages);
        const assistantMessage: Message = { role: 'assistant', content: '', stream };
        setMessages(prev => [...prev, assistantMessage]);

        let fullResponse = '';
        if (assistantMessage.stream) {
          for await (const chunk of assistantMessage.stream) {
              fullResponse += chunk;
          }
        }

        if (isTtsEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(fullResponse);
            window.speechSynthesis.speak(utterance);
        }
        
        const finalMessages = [...newMessages, { role: "assistant" as const, content: fullResponse }];
        
        const wasNewChat = chatId === 'new';
        await saveChat(chatId, userId, finalMessages);
        
        if (wasNewChat) {
            window.dispatchEvent(new CustomEvent('chatCreated'));
        }

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
        
        setMessages(newMessages); 
      }
    });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  }
  
  const handleExamplePrompt = (prompt: string) => {
    setInput(prompt);
    handleSendMessage(prompt);
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileToUpload(file);
      setShowUploadDialog(true);
    }
  };

  const handleUploadConfirm = () => {
    if (fileToUpload) {
      setShowUploadDialog(false);
      startTransition(async () => {
        setFileSummary({ name: fileToUpload.name, summary: null, progress: "Uploading..." });
        const reader = new FileReader();
        reader.readAsDataURL(fileToUpload);
        reader.onload = async () => {
          const fileDataUri = reader.result as string;
          try {
            setFileSummary(prev => prev ? {...prev, progress: "Analyzing..."} : null);
            const result = await summarizeUploadedFiles({ fileDataUri });
            setFileSummary(prev => prev ? {...prev, summary: result.summary, progress: result.progress } : null);
          } catch (error) {
            toast({ variant: "destructive", title: "File Error", description: "Could not analyze the file." });
            setFileSummary(null);
          }
        };
        setFileToUpload(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      });
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <header className="flex h-16 items-center justify-between border-b bg-card px-4 shrink-0">
         <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden"
            >
              <PanelLeft />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <div className="flex items-center gap-2">
              <Image src="/logo.jpg" alt="MindMate Logo" width={32} height={32} />
              <span className="font-semibold text-lg hidden md:block">MindMate</span>
            </div>
         </div>
         <div className="flex items-center gap-2">
          <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onShowTemplates}
              title="Show Prompt Templates"
            >
              <BookMarked className="h-5 w-5" />
              <span className="sr-only">Show Templates</span>
            </Button>
            <Button asChild
              type="button"
              variant="ghost"
              size="icon"
              title="Settings"
            >
              <Link href="/ai/settings">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
         </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="px-4 py-6 space-y-6 max-w-3xl mx-auto">
            {chatId === 'new' && messages.length === initialMessages.length && !fileSummary ? (
                 <div className="flex flex-col items-center justify-center text-center pt-10 md:pt-16">
                    <div className="h-32 w-32 mb-4">
                        <AvatarCanvas isAnimated={!isPending} />
                    </div>
                     <h1 className="mt-4 text-3xl font-bold">How can I help you today?</h1>
                     <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-md">
                        {examplePrompts.map((prompt, i) => (
                             <Card 
                                key={i}
                                className="p-4 flex items-center justify-center text-center cursor-pointer hover:bg-accent transition-colors rounded-xl"
                                onClick={() => handleExamplePrompt(prompt)}
                            >
                                <p className="text-sm font-medium">{prompt}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                messages.map((message, index) => (
                    <ChatMessage key={index} {...message} />
                ))
            )}
            {isPending && messages[messages.length -1]?.role !== 'assistant' && (
              <ChatMessage
                role="assistant"
                content={
                  <div className="w-16 h-16 mx-auto">
                    <AvatarCanvas isAnimated={isPending} />
                  </div>
                }
              />
            )}
             {fileSummary && (
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Paperclip className="h-5 w-5" />
                    <p className="font-medium">{fileSummary.name}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setFileSummary(null)}>
                    <VolumeX className="h-4 w-4" />
                  </Button>
                </div>
                {fileSummary.summary ? (
                  <p className="mt-2 text-sm text-muted-foreground">{fileSummary.summary}</p>
                ) : (
                  <div className="mt-4 space-y-2">
                     <Progress value={fileSummary.progress === 'Analyzing...' ? 50 : 10} className="h-2" />
                     <p className="text-xs text-muted-foreground">{fileSummary.progress}</p>
                  </div>
                )}
                 {fileSummary.progress && <Badge variant="outline" className="mt-2">{fileSummary.progress}</Badge>}
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      <footer className="w-full shrink-0 border-t bg-background">
        <div className="mx-auto w-full max-w-3xl p-4">
          <form
            onSubmit={handleSubmit}
            className="flex w-full items-start gap-2"
          >
            <div className="relative flex h-auto min-h-12 w-full items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                onClick={handleFileButtonClick}
                disabled={isPending}
              >
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Upload file</span>
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                className="min-h-[48px] w-full resize-none rounded-full border-2 border-border bg-muted py-3 pl-12 pr-20 shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    handleSubmit(e);
                  }
                }}
                disabled={isPending}
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {input.trim() || isPending ? (
                  <Button
                    type="submit"
                    size="icon"
                    className="shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/80"
                    disabled={isPending || !input.trim()}
                  >
                    {isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                    <span className="sr-only">Send</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={handleMicClick}
                    disabled={isPending}
                  >
                    {isListening ? (
                      <MicOff className="h-5 w-5 text-destructive" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                    <span className="sr-only">Toggle voice recognition</span>
                  </Button>
                )}
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
            />
          </form>
        </div>
      </footer>
      <FileUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onConfirm={handleUploadConfirm}
      />
    </div>
  );
}

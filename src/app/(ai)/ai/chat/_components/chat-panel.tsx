"use client";
import React, { useState, useTransition, useEffect, useRef } from "react";
import {
  Send,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { implementAIIdentity } from "@/ai/flows/implement-ai-identity";
import { summarizeUploadedFiles } from "@/ai/flows/summarize-uploaded-files";
import { useToast } from "@/hooks/use-toast";
import { AvatarCanvas } from "../../avatar/_components/avatar-canvas";
import { ThemeToggle } from "@/components/theme-toggle";
import { FileUploadDialog } from "./file-upload-dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type Message = {
  role: "user" | "assistant";
  content: string | React.ReactNode;
};

const examplePrompts = [
  "Explain quantum computing in simple terms",
  "Got any creative ideas for a 10-year-old’s birthday?",
  "How do I make an HTTP request in Javascript?",
  "What's the meaning of life?",
];

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileSummary, setFileSummary] = useState<{ name: string; summary: string | null; progress: string | null } | null>(null);

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

    setMessages([
      {
        role: "assistant",
        content: "Hello! I am Marco AI, your MindMate companion. How can I help you today?"
      }
    ]);
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
    if (!text.trim() || isPending) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(newMessages);
    setInput("");

    startTransition(async () => {
      try {
        const result = await implementAIIdentity(text);
        if (isTtsEnabled) {
            const utterance = new SpeechSynthesisUtterance(result);
            window.speechSynthesis.speak(utterance);
        }
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
        setMessages(messages);
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
    <div className="relative flex h-screen w-full flex-col items-center bg-background text-foreground">
      <header className="absolute top-4 right-4 flex items-center gap-2">
         <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsTtsEnabled(!isTtsEnabled)}
          >
            {isTtsEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            <span className="sr-only">Toggle TTS</span>
          </Button>
        <ThemeToggle />
      </header>

      <div className="flex flex-1 flex-col w-full max-w-3xl pt-16 pb-32">
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.length === 1 && !fileSummary ? (
                 <div className="flex flex-col items-center justify-center text-center pt-16">
                    <div className="h-48 w-48">
                        <AvatarCanvas isAnimated={true} />
                    </div>
                     <h1 className="mt-4 text-3xl font-bold">How can I help you today?</h1>
                     <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                        {examplePrompts.map((prompt, i) => (
                            <Button key={i} variant="outline" className="text-left h-auto whitespace-normal" onClick={() => handleExamplePrompt(prompt)}>
                                {prompt}
                            </Button>
                        ))}
                    </div>
                </div>
            ) : (
                messages.map((message, index) => (
                    <ChatMessage key={index} {...message} />
                ))
            )}
            {isPending && !fileSummary && (
              <ChatMessage
                role="assistant"
                content={<Loader2 className="h-5 w-5 animate-spin" />}
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
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/50 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-3xl p-4 space-y-4">
            <form
              onSubmit={handleSubmit}
              className="relative flex items-center gap-2"
            >
              <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={handleFileButtonClick}
                  disabled={isPending}
              >
                  <Paperclip className="h-5 w-5" />
                  <span className="sr-only">Upload file</span>
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
              />
            
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message MarcoAI..."
                className="min-h-[50px] w-full resize-none rounded-2xl border-2 border-border bg-card pr-24 shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    handleSubmit(e);
                  }
                }}
                disabled={isPending}
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                 <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={handleMicClick}
                  disabled={isPending}
                >
                  {isListening ? <MicOff className="h-5 w-5 text-destructive" /> : <Mic className="h-5 w-5" />}
                  <span className="sr-only">Toggle voice recognition</span>
                </Button>
                <Button
                  type="submit"
                  size="icon"
                  className="shrink-0 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
                  disabled={isPending || !input.trim()}
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  <span className="sr-only">Send</span>
                </Button>
              </div>
          </form>
           <p className="text-center text-xs text-muted-foreground">
             MarcoAI may display inaccurate info, including about people, so double-check its responses.
            </p>
        </div>
      </div>
      <FileUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onConfirm={handleUploadConfirm}
      />
    </div>
  );
}

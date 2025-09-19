
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
  Trash2,
  PanelLeft,
  Image as ImageIcon,
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
import { useSidebar } from "@/components/ui/sidebar";
import { PasswordDialog } from "./password-dialog";
import { Card } from "@/components/ui/card";
import { useTypingEffect } from "@/hooks/use-typing-effect";

type Message = {
  role: "user" | "assistant";
  content: string | React.ReactNode;
};

const examplePrompts = [
  "Explain quantum computing",
  "Creative birthday ideas?",
  "HTTP requests in Javascript",
  "What's the meaning of life?",
];

const placeholderPrompts = [
    "Ask anything...",
    "Explain a complex topic...",
    "Help me brainstorm ideas...",
    "Translate a phrase...",
];

const REQUEST_LIMIT = 5;
const UNLOCK_PASSWORD = "marcoaiuc";

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
  const { toggleSidebar } = useSidebar();
  const [requestCount, setRequestCount] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const placeholder = useTypingEffect(placeholderPrompts, 100, 50);

  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem('chatMessages');
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          setMessages(parsedMessages);
        } else {
          setMessages(initialMessages);
        }
      } else {
        setMessages(initialMessages);
      }

      const storedCount = localStorage.getItem('requestCount');
      const unlockedStatus = localStorage.getItem('isUnlocked');
      if (unlockedStatus === 'true') {
        setIsUnlocked(true);
      } else if (storedCount) {
        setRequestCount(parseInt(storedCount, 10));
      }
    } catch (error) {
      console.error("Could not access localStorage.", error);
       setMessages(initialMessages);
    }
  }, []);

  useEffect(() => {
    try {
      // Don't save the initial placeholder messages
      if (messages.length > initialMessages.length) {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
      } else if (messages.length === 0) {
        localStorage.removeItem('chatMessages');
      }
    } catch (error) {
      console.error("Could not access localStorage.", error);
    }
  }, [messages]);


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
    if (!text.trim() || isPending) return;

     if (!isUnlocked && requestCount >= REQUEST_LIMIT) {
      setShowPasswordDialog(true);
      return;
    }

    const newUserMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInput("");

    startTransition(async () => {
      try {
        const result = await implementAIIdentity(text);
        if (isTtsEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(result);
            window.speechSynthesis.speak(utterance);
        }
        const newCount = requestCount + 1;
        setRequestCount(newCount);
        if (!isUnlocked) {
          try {
            localStorage.setItem('requestCount', newCount.toString());
          } catch (error) {
            console.error("Could not access localStorage.", error);
          }
        }

        const aiMessage: Message = { role: "assistant", content: result };
        setMessages([...newMessages, aiMessage]);

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
        
        setMessages(newMessages.slice(0, -1)); 
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
  
  const handleClearHistory = () => {
    setMessages(initialMessages);
    setFileSummary(null);
     try {
       localStorage.removeItem('chatMessages');
    } catch (error) {
      console.error("Could not access localStorage.", error);
    }
    toast({
        title: "Chat Cleared",
        description: "The current conversation has been removed.",
    });
  };

  const handlePasswordSubmit = (password: string) => {
    if (password === UNLOCK_PASSWORD) {
      setIsUnlocked(true);
      try {
        localStorage.setItem('isUnlocked', 'true');
        localStorage.removeItem('requestCount');
      } catch (error) {
        console.error("Could not access localStorage.", error);
      }
      setShowPasswordDialog(false);
      toast({
        title: "Success",
        description: "You have unlocked unlimited requests.",
      });
      handleSendMessage(input);
    } else {
      toast({
        variant: "destructive",
        title: "Incorrect Password",
        description: "Please try again.",
      });
    }
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
         </div>
         <div className="flex items-center gap-2">
          <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClearHistory}
              title="Clear current chat"
            >
              <Trash2 className="h-5 w-5" />
              <span className="sr-only">Clear History</span>
            </Button>
          <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsTtsEnabled(!isTtsEnabled)}
              title="Toggle Text-to-Speech"
            >
              {isTtsEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              <span className="sr-only">Toggle TTS</span>
            </Button>
          <ThemeToggle />
         </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="px-4 py-6 space-y-6 max-w-3xl mx-auto">
            {messages.length <= initialMessages.length && !fileSummary ? (
                 <div className="flex flex-col items-center justify-center text-center pt-10 md:pt-16">
                    <div className="h-32 w-32 mb-4">
                        <AvatarCanvas isAnimated={true} />
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
      </main>

       <footer className="w-full shrink-0 border-t bg-background">
        <div className="mx-auto w-full max-w-3xl p-4 space-y-3">
            {!isUnlocked && requestCount >= REQUEST_LIMIT && (
              <div className="text-center text-sm text-destructive font-medium">
                You have reached your message limit. Enter the password to continue.
              </div>
            )}
            <form
              onSubmit={handleSubmit}
              className="flex w-full items-center gap-2"
            >
              <div className="relative flex-1">
                 <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholder}
                    className="min-h-[48px] w-full resize-none rounded-full border-2 border-border bg-muted py-3 pl-12 pr-4 shadow-sm"
                    onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        handleSubmit(e);
                    }
                    }}
                    disabled={isPending}
                 />
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
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

               <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={handleMicClick}
                  disabled={isPending}
                  >
                  {isListening ? <MicOff className="h-5 w-5 text-destructive" /> : <Mic className="h-5 w-5" />}
                  <span className="sr-only">Toggle voice recognition</span>
              </Button>

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
          </form>
           <p className="text-center text-xs text-muted-foreground">
             MarcoAI is your companion. Crafted by WaizMarco, designed for legends.
            </p>
        </div>
      </footer>
      <FileUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onConfirm={handleUploadConfirm}
      />
      <PasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onConfirm={handlePasswordSubmit}
       />
    </div>
  );
}

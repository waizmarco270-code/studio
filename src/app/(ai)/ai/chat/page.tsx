
"use client";

import { useState, useEffect, useTransition } from "react";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { ChatPanel } from "./_components/chat-panel";
import { RecentChats } from "./_components/recent-chats";
import { PromptTemplates } from "./_components/prompt-templates";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TokenEntry } from "./_components/token-entry";
import { Loader2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { getChats, createChat } from "./actions";

export default function ChatPage() {
  const [showTemplates, setShowTemplates] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [chatId, setChatId] = useState<string>('new');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

   useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const accessGranted = localStorage.getItem('marco-ai-access-granted');
        let currentUserId = localStorage.getItem('marco-ai-user-id');

        if (accessGranted === 'true') {
          setIsVerified(true);
          if (currentUserId) {
            setUserId(currentUserId);
          } else {
            currentUserId = uuidv4();
            setUserId(currentUserId);
            localStorage.setItem('marco-ai-user-id', currentUserId);
          }
        } else {
          setIsVerified(false);
        }
      } catch (error) {
        console.error("Could not access localStorage.", error);
        setIsVerified(false);
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
       startTransition(async () => {
         const chats = await getChats(userId);
         if (chats.length > 0) {
            setChatId(chats[0].id);
         } else {
            const newChat = await createChat(userId);
            setChatId(newChat.id);
         }
       });
    }
  }, [userId]);

  const handleNewChat = () => {
    setChatId('new');
  }

  const handleChatCreated = async () => {
     const chats = await getChats(userId);
     if(chats.length > 0) {
        setChatId(chats[0].id);
     }
  }

  useEffect(() => {
     window.addEventListener('chatCreated', handleChatCreated);
     return () => {
        window.removeEventListener('chatCreated', handleChatCreated);
     }
  }, [userId]);


  const onVerificationSuccess = () => {
    try {
      const newUserId = uuidv4();
      localStorage.setItem("marco-ai-access-granted", "true");
      localStorage.setItem("marco-ai-user-id", newUserId);
      setIsVerified(true);
      setUserId(newUserId);
      toast({
        title: "Access Granted",
        description: "Welcome to Marco AI!",
      });
    } catch (error) {
      console.error("Could not access localStorage.", error);
       toast({
        variant: "destructive",
        title: "Storage Error",
        description: "Could not save access status. Please enable cookies/site data.",
      });
    }
  }

  if (isVerified === null || (isVerified && isPending)) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-background">
              <Loader2 className="h-10 w-10 animate-spin" />
          </div>
      )
  }

  if (!isVerified) {
      return <TokenEntry onVerificationSuccess={onVerificationSuccess} />
  }


  return (
    <SidebarProvider>
      <Sidebar>
        <RecentChats 
            userId={userId} 
            activeChatId={chatId} 
            onChatSelect={setChatId}
            onNewChat={handleNewChat}
        />
      </Sidebar>
      <SidebarInset>
        <ChatPanel 
            onShowTemplates={() => setShowTemplates(true)} 
            chatId={chatId}
            userId={userId}
        />
        <Sheet open={showTemplates} onOpenChange={setShowTemplates}>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Prompt Templates</SheetTitle>
            </SheetHeader>
            <div className="h-full overflow-y-auto py-4">
              <PromptTemplates />
            </div>
          </SheetContent>
        </Sheet>
      </SidebarInset>
    </SidebarProvider>
  );
}

    

'use client';

import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { RecentChats } from "./chat/_components/recent-chats";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { TokenEntry } from "./chat/_components/token-entry";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


export default function AiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userId, setUserId] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const { toast } = useToast();

   useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const theme = localStorage.getItem("marco-ai-theme-color");
        if (theme) {
          document.documentElement.className = theme;
        }

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

  const onVerificationSuccess = (userName: string) => {
    try {
      const newUserId = uuidv4();
      localStorage.setItem("marco-ai-access-granted", "true");
      localStorage.setItem("marco-ai-user-id", newUserId);
      localStorage.setItem("marco-ai-user-name", userName);
      setIsVerified(true);
      setUserId(newUserId);
      toast({
        title: "Access Granted",
        description: `Welcome to Marco AI, ${userName}!`,
      });
    } catch (error)
     {
      console.error("Could not access localStorage.", error);
       toast({
        variant: "destructive",
        title: "Storage Error",
        description: "Could not save access status. Please enable cookies/site data.",
      });
    }
  }

  if (isVerified === null) {
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
        <RecentChats userId={userId} />
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

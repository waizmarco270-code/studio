
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Plus, MessageSquare, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Chat } from "@/lib/chat-history";
import { getChats } from "@/lib/chat-history";


export function RecentChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const { toggleSidebar } = useSidebar();
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const loadChats = async () => {
      const userChats = await getChats(userId);
      setChats(userChats);
    };

    loadChats();

    const handleChatHistoryUpdate = (e: Event) => {
        const updatedChats = (e as CustomEvent).detail.chats as Chat[];
        if(updatedChats) {
            setChats(updatedChats);
        } else {
            loadChats();
        }
    };
    
    window.addEventListener('chatHistoryUpdated', handleChatHistoryUpdate);
    
    return () => {
      window.removeEventListener('chatHistoryUpdated', handleChatHistoryUpdate);
    };
  }, [isLoaded, userId]);

  const handleSwitchChat = (chatId: string) => {
    window.dispatchEvent(new CustomEvent('switchChat', { detail: { chatId } }));
  };

  const handleNewChat = () => {
     window.dispatchEvent(new CustomEvent('switchChat', { detail: { chatId: 'new' } }));
  }

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between">
           <Button variant="ghost" size="icon" onClick={handleNewChat}>
               <Plus />
           </Button>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
               <PanelLeft />
           </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                onClick={() => handleSwitchChat(chat.id)}
                tooltip={chat.title}
              >
                <MessageSquare />
                <span>{chat.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}

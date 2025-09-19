"use client";

import { useEffect, useState } from "react";
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

type Chat = {
  id: string;
  title: string;
};

export function RecentChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    // Function to load chats
    const loadChats = () => {
      try {
        const savedState = JSON.parse(localStorage.getItem("chatState") || "{}");
        if (savedState.chats) {
          setChats(savedState.chats);
        }
      } catch (error) {
        console.error("Failed to load chats from local storage:", error);
      }
    };

    // Load chats on initial render
    loadChats();

    // Listen for custom event to update chats
    window.addEventListener('chatHistoryUpdated', loadChats);
    
    // Clean up
    return () => {
      window.removeEventListener('chatHistoryUpdated', loadChats);
    };
  }, []);

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

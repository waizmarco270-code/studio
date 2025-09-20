
"use client";

import { useEffect, useState } from "react";
import { Plus, MessageSquare, PanelLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  useSidebar,
  SidebarMenuAction,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import type { Chat } from "@/app/(ai)/ai/chat/actions";
import { getChats, createChat } from "@/app/(ai)/ai/chat/actions";

interface RecentChatsProps {
  userId: string;
  activeChatId: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

export function RecentChats({ userId, activeChatId, onChatSelect, onNewChat }: RecentChatsProps) {
  const { toggleSidebar } = useSidebar();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
 
  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      getChats(userId).then((userChats) => {
        setChats(userChats);
        setIsLoading(false);
      });
    }
  }, [userId]);

  const handleNewChat = async () => {
    const newChat = await createChat(userId);
    setChats([newChat, ...chats]);
    onNewChat();
  }

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between">
           <Button variant="ghost" size="icon" onClick={handleNewChat} title="New Chat">
               <Plus />
           </Button>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
               <PanelLeft />
           </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
            <div className="flex flex-col gap-2 px-2">
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
            </div>
        ) : (
        <SidebarMenu>
            {chats.map((chat) => (
                 <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                        onClick={() => onChatSelect(chat.id)}
                        isActive={activeChatId === chat.id}
                        tooltip={chat.title}
                    >
                        <MessageSquare />
                        <span>{chat.title}</span>
                    </SidebarMenuButton>
                     <SidebarMenuAction showOnHover>
                        <Trash2 />
                    </SidebarMenuAction>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
        )}
      </SidebarContent>
    </>
  );
}

    
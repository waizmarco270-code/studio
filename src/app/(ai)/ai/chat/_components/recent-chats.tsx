
"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, MessageSquare, PanelLeft, Trash2, Settings, LogOut } from "lucide-react";
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
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import type { Chat } from "@/app/(ai)/ai/chat/actions";
import { getChats } from "@/app/(ai)/ai/chat/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";


interface RecentChatsProps {
  userId: string;
}

export function RecentChats({ userId }: RecentChatsProps) {
  const { toggleSidebar } = useSidebar();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const activeChatId = pathname.split('id=')[1] || 'new';
 
  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      getChats(userId).then((userChats) => {
        setChats(userChats);
        setIsLoading(false);
      });
    }
  }, [userId]);
  
  useEffect(() => {
    const handleChatCreated = () => {
        startTransition(async() => {
            if (!userId) return;
            setIsLoading(true);
            const userChats = await getChats(userId);
            setChats(userChats);
            setIsLoading(false);
        });
    }
    window.addEventListener('chatCreated', handleChatCreated);
    return () => window.removeEventListener('chatCreated', handleChatCreated);
  }, [userId]);

  const handleNewChat = () => {
    router.push(`/ai/chat?id=new`);
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem('marco-ai-access-granted');
      localStorage.removeItem('marco-ai-user-id');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      window.location.reload();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not log out. Please clear your site data manually.",
      });
    }
  };

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
                        asChild
                        isActive={activeChatId === chat.id}
                        tooltip={chat.title}
                    >
                      <Link href={`/ai/chat?id=${chat.id}`}>
                        <MessageSquare />
                        <span>{chat.title}</span>
                      </Link>
                    </SidebarMenuButton>
                     <SidebarMenuAction showOnHover>
                        <Trash2 />
                    </SidebarMenuAction>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
         <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/ai/settings'}>
                 <Link href="/ai/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} variant="ghost">
                  <LogOut />
                  <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </>
  );
}

    

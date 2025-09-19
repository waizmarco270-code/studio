
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

export function RecentChats() {
  const { toggleSidebar } = useSidebar();
 
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
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => {}}
                tooltip={"New Chat"}
              >
                <MessageSquare />
                <span>New Chat</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}

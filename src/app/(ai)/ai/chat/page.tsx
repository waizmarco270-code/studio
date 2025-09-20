
"use client";

import { useState } from "react";
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

export default function ChatPage() {
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <SidebarProvider>
      <Sidebar>
        <RecentChats />
      </Sidebar>
      <SidebarInset>
        <ChatPanel onShowTemplates={() => setShowTemplates(true)} />
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

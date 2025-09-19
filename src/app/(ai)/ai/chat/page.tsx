import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { ChatPanel } from "./_components/chat-panel";
import { RecentChats } from "./_components/recent-chats";

export default function ChatPage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <RecentChats />
      </Sidebar>
      <SidebarInset>
        <ChatPanel />
      </SidebarInset>
    </SidebarProvider>
  );
}

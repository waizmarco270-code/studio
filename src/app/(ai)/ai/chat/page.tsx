import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { ChatPanel } from "./_components/chat-panel";
import { RecentChats } from "./_components/recent-chats";
import { PromptTemplates } from "./_components/prompt-templates";

export default function ChatPage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <RecentChats />
      </Sidebar>
      <SidebarInset>
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={70} minSize={40}>
            <ChatPanel />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
            <div className="h-full overflow-y-auto p-4">
               <h2 className="text-lg font-semibold mb-4">Prompt Templates</h2>
               <PromptTemplates />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </SidebarInset>
    </SidebarProvider>
  );
}


'use client';
// This layout can be used to wrap all AI-related pages if needed in the future.
// For now, the main logic is in /ai/layout.tsx to handle verification.
export default function AiAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex min-h-screen flex-col bg-background">{children}</div>;
}

    
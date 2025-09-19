export default function AiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex min-h-screen flex-col bg-background">{children}</div>;
}

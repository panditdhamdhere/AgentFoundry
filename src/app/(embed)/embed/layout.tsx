export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-zinc-950 py-6">
      {children}
    </div>
  );
}

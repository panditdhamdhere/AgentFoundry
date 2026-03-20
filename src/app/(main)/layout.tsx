import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-theme(spacing.14))] flex-1 flex-col">
        {children}
      </main>
      <Footer />
    </>
  );
}

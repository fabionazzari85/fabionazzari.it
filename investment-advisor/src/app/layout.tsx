import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Investment Advisor",
  description: "Il tuo assistente AI per gli investimenti",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="h-full antialiased">
      <body className="h-full flex flex-col bg-background text-foreground">
        <main className="flex-1 overflow-auto pb-16">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}

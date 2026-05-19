import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { ReadingProvider } from "@/context/ReadingContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oracle — 现代塔罗",
  description: "具有神秘氛围的高端数字塔罗体验。克制、沉浸、电影级光影。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full bg-void font-sans text-frost antialiased">
        <AuthProvider>
          <ReadingProvider>
            <Navbar />
            <main className="relative">{children}</main>
            <AuthModal />
            <NoiseOverlay />
          </ReadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

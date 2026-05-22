import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { ReadingProvider } from "@/context/ReadingContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ParticleInteractionProvider } from "@/context/ParticleInteractionContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oracle — 现代塔罗",
  description: "AI 引导的沉浸式数字神秘仪式空间。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full" data-theme="astral-void">
      <body className="min-h-full bg-void font-sans text-frost antialiased">
        <ThemeProvider>
          <ParticleInteractionProvider>
            <AuthProvider>
              <ReadingProvider>
                <Navbar />
                <main className="relative">{children}</main>
                <AuthModal />
                <NoiseOverlay />
              </ReadingProvider>
            </AuthProvider>
          </ParticleInteractionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

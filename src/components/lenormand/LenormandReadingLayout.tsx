"use client";

import { ReadingLayout } from "@/components/tarot/ReadingLayout";
import type { ReactNode } from "react";

interface LenormandReadingLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  wide?: boolean;
  dissolve?: number;
  performanceMode?: boolean;
}

/** 与全站一致的占卜布局；雷诺曼流程略降低粒子强度。 */
export function LenormandReadingLayout({
  children,
  title,
  subtitle,
  wide = false,
  dissolve = 0.85,
  performanceMode = false,
}: LenormandReadingLayoutProps) {
  return (
    <ReadingLayout
      title={title}
      subtitle={subtitle}
      dissolve={dissolve}
      wide={wide}
      badge="Lenormand Reading"
      performanceMode={performanceMode}
    >
      {children}
    </ReadingLayout>
  );
}

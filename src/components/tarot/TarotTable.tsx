"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface TarotTableProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  enablePan?: boolean;
  /** 裁切左上空白，纠正牌阵偏右下 */
  cropTopLeft?: { top: number; left: number };
}

export function TarotTable({
  children,
  className = "",
  style,
  enablePan = false,
  cropTopLeft,
}: TarotTableProps) {
  return (
    <div
      className={`relative mx-auto overflow-hidden rounded-3xl border border-white/[0.06] ${className}`}
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 50% 45%, rgba(35,30,55,0.5) 0%, rgba(8,8,12,0.95) 70%)",
        boxShadow:
          "inset 0 0 80px rgba(0,0,0,0.5), 0 24px 60px rgba(0,0,0,0.45)",
        ...style,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full blur-[80px]"
        style={{ background: "rgba(110,91,255,0.12)" }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative h-full w-full overflow-hidden"
        style={
          cropTopLeft
            ? {
                clipPath: `inset(${cropTopLeft.top}px 0 0 ${cropTopLeft.left}px)`,
              }
            : undefined
        }
        drag={enablePan ? "x" : false}
        dragConstraints={{ left: -180, right: 180 }}
        dragElastic={0.08}
      >
        {children}
      </motion.div>
    </div>
  );
}

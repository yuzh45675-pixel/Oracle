"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  downloadReadingImageFilename,
  exportReadingImage,
} from "@/lib/export-reading-image";
import type { ReadingSession } from "@/types/tarot";

interface ReadingExportButtonProps {
  session: ReadingSession;
  variant?: "primary" | "ghost";
  className?: string;
}

export function ReadingExportButton({
  session,
  variant = "primary",
  className = "",
}: ReadingExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleDownload = async () => {
    if (loading) return;
    setLoading(true);
    setDone(false);
    try {
      const blob = await exportReadingImage(session);
      const filename = downloadReadingImageFilename(session);
      const file = new File([blob], filename, { type: "image/png" });

      // 手机浏览器优先打开系统分享面板，用户可直接保存到相册。
      if (
        typeof navigator !== "undefined" &&
        "canShare" in navigator &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          title: "Oracle 解读长图",
          text: "保存你的牌面解读结果",
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      }
      setDone(true);
      window.setTimeout(() => setDone(false), 2500);
    } catch {
      window.alert("生成图片失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const base =
    variant === "primary"
      ? "border-accent/40 bg-accent/15 text-frost hover:bg-accent/25"
      : "border-white/10 bg-white/[0.04] text-muted hover:border-accent/30 hover:text-frost";

  return (
    <motion.button
      type="button"
      onClick={() => void handleDownload()}
      disabled={loading}
      whileTap={{ scale: 0.98 }}
      className={`rounded-full border px-5 py-2.5 text-sm transition disabled:cursor-wait disabled:opacity-60 ${base} ${className}`}
    >
      {loading ? "正在生成图片…" : done ? "已打开保存面板" : "保存解读长图"}
    </motion.button>
  );
}

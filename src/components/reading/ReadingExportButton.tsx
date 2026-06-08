"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { logExportImageActivity } from "@/lib/activity-client";
import {
  downloadReadingImageFilename,
  exportReadingImage,
  prefetchExportImages,
} from "@/lib/export-reading-image";
import {
  getSessionDeckLabel,
  getSessionSpreadLabel,
} from "@/lib/session-labels";
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

  useEffect(() => {
    prefetchExportImages(session);
  }, [session]);

  const handleDownload = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setDone(false);
    try {
      const blob = await exportReadingImage(session);
      const filename = downloadReadingImageFilename(session);
      const file = new File([blob], filename, { type: "image/jpeg" });

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

      const cardNames = session.cards.map((d) => d.card.name);
      void logExportImageActivity({
        sessionId: session.id,
        deck: getSessionDeckLabel(session),
        spreadTitle: getSessionSpreadLabel(session),
        question: session.question,
        cardNames,
        filename,
        source: "web",
      });

      setDone(true);
      window.setTimeout(() => setDone(false), 2500);
    } catch {
      window.alert("生成图片失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [loading, session]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "s") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      void handleDownload();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleDownload]);

  const base =
    variant === "primary"
      ? "border-accent/40 bg-accent/15 text-frost hover:bg-accent/25"
      : "border-white/10 bg-white/[0.04] text-muted hover:border-accent/30 hover:text-frost";

  const shortcutLabel =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.userAgent)
      ? "⌘S"
      : "Ctrl+S";

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        type="button"
        onClick={() => void handleDownload()}
        disabled={loading}
        whileTap={{ scale: 0.98 }}
        className={`rounded-full border px-5 py-2.5 text-sm transition disabled:cursor-wait disabled:opacity-60 ${base} ${className}`}
      >
        {loading ? "正在生成图片…" : done ? "已保存" : "保存解读长图"}
      </motion.button>
      <p className="text-[10px] text-muted">
        快捷键 <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-frost/80">{shortcutLabel}</kbd>
      </p>
    </div>
  );
}

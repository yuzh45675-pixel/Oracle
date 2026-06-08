"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [filename, setFilename] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    prefetchExportImages(session);
  }, [session]);

  const revokePreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewOpen(false);
    setPreviewBlob(null);
    setSaved(false);
    revokePreviewUrl();
  }, [revokePreviewUrl]);

  const logExport = useCallback(
    (name: string) => {
      void logExportImageActivity({
        sessionId: session.id,
        deck: getSessionDeckLabel(session),
        spreadTitle: getSessionSpreadLabel(session),
        question: session.question,
        cardNames: session.cards.map((d) => d.card.name),
        filename: name,
        source: "web",
      });
    },
    [session],
  );

  const generatePreview = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setSaved(false);
    try {
      const blob = await exportReadingImage(session);
      const name = downloadReadingImageFilename(session);
      revokePreviewUrl();
      const url = URL.createObjectURL(blob);
      previewUrlRef.current = url;
      setPreviewUrl(url);
      setPreviewBlob(blob);
      setFilename(name);
      setPreviewOpen(true);
    } catch {
      window.alert("生成图片失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [loading, revokePreviewUrl, session]);

  const downloadBlob = useCallback(
    (blob: Blob, name: string) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      link.click();
      URL.revokeObjectURL(url);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!previewBlob || saving) return;
    setSaving(true);
    setSaved(false);
    try {
      const file = new File([previewBlob], filename, {
        type: previewBlob.type || "image/jpeg",
      });

      if (
        typeof navigator !== "undefined" &&
        "share" in navigator &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          title: "Oracle 解读长图",
          text: "保存到相册",
          files: [file],
        });
      } else {
        downloadBlob(previewBlob, filename);
      }

      logExport(filename);
      setSaved(true);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      downloadBlob(previewBlob, filename);
      logExport(filename);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }, [downloadBlob, filename, logExport, previewBlob, saving]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "s") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      if (previewOpen && previewBlob) {
        void handleSave();
      } else {
        void generatePreview();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [generatePreview, handleSave, previewBlob, previewOpen]);

  useEffect(() => () => revokePreviewUrl(), [revokePreviewUrl]);

  const base =
    variant === "primary"
      ? "border-accent/40 bg-accent/15 text-frost hover:bg-accent/25"
      : "border-white/10 bg-white/[0.04] text-muted hover:border-accent/30 hover:text-frost";

  const canNativeShare =
    typeof navigator !== "undefined" &&
    "share" in navigator &&
    typeof navigator.canShare === "function";

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <motion.button
          type="button"
          onClick={() => void generatePreview()}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className={`rounded-full border px-5 py-2.5 text-sm transition disabled:cursor-wait disabled:opacity-60 ${base} ${className}`}
        >
          {loading ? "正在生成长图…" : "保存解读长图"}
        </motion.button>
        <p className="text-center text-[10px] text-muted">
          先生成预览，确认后再保存
          <span className="hidden md:inline">
            {" "}
            · 快捷键{" "}
            <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-frost/80">
              {typeof navigator !== "undefined" &&
              /Mac|iPhone|iPad/i.test(navigator.userAgent)
                ? "⌘S"
                : "Ctrl+S"}
            </kbd>
          </span>
        </p>
      </div>

      <AnimatePresence>
        {previewOpen && previewUrl && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePreview}
          >
            <motion.div
              role="dialog"
              aria-labelledby="export-preview-title"
              className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-white/[0.1] bg-void shadow-2xl sm:max-h-[90dvh] sm:rounded-2xl"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
                <div>
                  <p
                    id="export-preview-title"
                    className="text-sm font-medium text-frost"
                  >
                    长图预览
                  </p>
                  <p className="text-[10px] text-muted">
                    确认内容无误后保存到相册
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePreview}
                  className="rounded-full px-3 py-1 text-xs text-muted hover:text-frost"
                >
                  关闭
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto bg-black/30 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="解读长图预览"
                  className="mx-auto w-full rounded-lg border border-white/[0.08] shadow-lg"
                />
              </div>

              <div className="space-y-2 border-t border-white/[0.08] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleSave()}
                  className="w-full rounded-xl border border-accent/40 bg-accent/20 py-3 text-sm font-medium text-frost disabled:opacity-50"
                >
                  {saving
                    ? "正在打开保存…"
                    : saved
                      ? "已保存 ✓"
                      : canNativeShare
                        ? "保存到相册"
                        : "下载图片"}
                </button>
                {canNativeShare && (
                  <p className="text-center text-[10px] leading-relaxed text-muted">
                    将打开系统分享面板，选择「存储到相册」或「保存图像」
                  </p>
                )}
                {!canNativeShare && (
                  <p className="text-center text-[10px] leading-relaxed text-muted">
                    也可长按上方图片，选择「存储图像」
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

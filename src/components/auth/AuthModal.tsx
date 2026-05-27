"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AvatarPicker } from "@/components/auth/AvatarPicker";
import type { AvatarSelection } from "@/lib/avatars";
import { API_COLD_START_HINT } from "@/lib/api-fetch";
import { useAuth } from "@/context/AuthContext";

export function AuthModal() {
  const { authOpen, closeAuth, login, register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<AvatarSelection>({
    avatarType: "theme",
    avatarTheme: "astral-void",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [slowHint, setSlowHint] = useState(false);

  useEffect(() => {
    if (!busy) {
      setSlowHint(false);
      return;
    }
    const timer = window.setTimeout(() => setSlowHint(true), 4000);
    return () => window.clearTimeout(timer);
  }, [busy]);

  const resetForm = () => {
    setError(null);
    setUsername("");
    setPassword("");
  };

  const handleClose = () => {
    resetForm();
    closeAuth();
  };

  const run = async (action: "login" | "register") => {
    setBusy(true);
    setError(null);
    try {
      if (action === "login") await login(username, password);
      else await register(username, password, avatar);
      resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {authOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="关闭"
            onClick={handleClose}
          />
          <motion.div
            role="dialog"
            aria-labelledby="auth-title"
            className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-surface/95 p-6 shadow-2xl backdrop-blur-xl"
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
          >
            <h2
              id="auth-title"
              className="font-display text-xl font-light text-frost"
            >
              登录 Oracle
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              登录后每日 3 次免费 AI 解读；内测超出次数可免费继续，正式版将接入支付宝。
            </p>

            <div className="mt-5 space-y-3">
              <label className="block text-xs text-muted">用户名</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-frost outline-none focus:border-accent/40"
                placeholder="至少 3 个字符"
              />
              <label className="block text-xs text-muted">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-frost outline-none focus:border-accent/40"
                placeholder="至少 6 位"
              />
            </div>

            <AvatarPicker value={avatar} onChange={setAvatar} />

            {error && (
              <p className="mt-3 text-sm text-red-300">{error}</p>
            )}

            {busy && slowHint && !error && (
              <p className="mt-3 animate-pulse text-xs leading-relaxed text-muted">
                {API_COLD_START_HINT}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={busy}
                onClick={() => void run("login")}
                className="flex-1 rounded-xl border border-accent/40 bg-accent/20 py-2.5 text-sm text-frost disabled:opacity-50"
              >
                {busy ? "连接中…" : "登录"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void run("register")}
                className="flex-1 rounded-xl border border-white/[0.12] py-2.5 text-sm text-muted hover:text-frost disabled:opacity-50"
              >
                {busy ? "连接中…" : "注册"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

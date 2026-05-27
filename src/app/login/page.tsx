"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ReadingLayout } from "@/components/tarot/ReadingLayout";
import { AuthField } from "@/components/auth/AuthField";
import { AvatarPicker } from "@/components/auth/AvatarPicker";
import type { AvatarSelection } from "@/lib/avatars";
import { updateUserAvatar } from "@/lib/auth-client";
import { API_COLD_START_HINT, pingApiHealth } from "@/lib/api-fetch";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, refreshUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<AvatarSelection>({
    avatarType: "theme",
    avatarTheme: "astral-void",
  });
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>(
    {},
  );
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [slowHint, setSlowHint] = useState(false);

  useEffect(() => {
    pingApiHealth();
  }, []);

  useEffect(() => {
    if (!busy) {
      setSlowHint(false);
      return;
    }
    const timer = window.setTimeout(() => setSlowHint(true), 4000);
    return () => window.clearTimeout(timer);
  }, [busy]);

  const validate = () => {
    const next: typeof errors = {};
    if (!username.trim()) next.username = "用户名不能为空";
    if (password.length < 6) next.password = "密码不能少于 6 位";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerError(null);
    if (!validate()) return;

    setBusy(true);
    try {
      await login(username.trim(), password);
      if (avatarDirty) {
        try {
          await updateUserAvatar(avatar);
          await refreshUser();
        } catch {
          /* 头像更新失败不阻断登录 */
        }
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ReadingLayout title="登录" subtitle="欢迎回到 Oracle" badge="Sign In">
      <motion.div
        className="mx-auto w-full max-w-md lg:max-w-lg"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {bannerError && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          >
            {bannerError}
          </p>
        )}

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl md:p-8"
          noValidate
        >
          <AuthField
            id="login-username"
            label="用户名"
            value={username}
            onChange={setUsername}
            autoComplete="username"
            error={errors.username}
          />
          <div className="mt-4">
            <AuthField
              id="login-password"
              label="密码"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              error={errors.password}
            />
          </div>

          <AvatarPicker
            value={avatar}
            onChange={(next) => {
              setAvatar(next);
              setAvatarDirty(true);
            }}
          />

          <button
            type="submit"
            disabled={busy}
            className="mt-8 w-full rounded-xl border border-accent/40 bg-accent/20 py-3 text-sm font-medium text-frost transition hover:border-accent/60 hover:bg-accent/30 disabled:opacity-50"
          >
            {busy ? "连接中…" : "登录"}
          </button>
          {busy && slowHint && !bannerError && (
            <p className="mt-3 animate-pulse text-center text-xs leading-relaxed text-muted">
              {API_COLD_START_HINT}
            </p>
          )}
          <p className="mt-6 text-center text-xs text-muted">
            还没有账号？{" "}
            <Link
              href="/register"
              className="text-accent/90 underline-offset-2 hover:text-accent hover:underline"
            >
              去注册
            </Link>
          </p>
        </form>
      </motion.div>
    </ReadingLayout>
  );
}

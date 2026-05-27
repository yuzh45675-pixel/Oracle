"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ReadingLayout } from "@/components/tarot/ReadingLayout";
import { AuthField } from "@/components/auth/AuthField";
import type { AvatarSelection } from "@/lib/avatars";
import { AvatarPicker } from "@/components/auth/AvatarPicker";
import { registerUser, setStoredToken } from "@/lib/auth-client";
import { API_COLD_START_HINT, pingApiHealth } from "@/lib/api-fetch";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [slowHint, setSlowHint] = useState(false);
  const [avatar, setAvatar] = useState<AvatarSelection>({
    avatarType: "theme",
    avatarTheme: "astral-void",
  });

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
    if (confirm !== password) next.confirm = "两次输入的密码不一致";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerError(null);
    if (!validate()) return;

    setBusy(true);
    try {
      const res = await registerUser(username.trim(), password, avatar);
      if (res.code === 0 && res.token) {
        setStoredToken(res.token);
        await refreshUser();
        router.push("/");
        router.refresh();
        return;
      }
      setBannerError(res.msg || "注册失败");
    } catch {
      setBannerError("无法连接服务器，请检查网络或稍后再试");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ReadingLayout
      title="注册账号"
      subtitle="创建 Oracle 账号，每日享 3 次免费 AI 解读（内测超出可免费继续）"
      badge="Sign Up"
    >
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
            id="reg-username"
            label="用户名"
            value={username}
            onChange={setUsername}
            placeholder="请输入用户名"
            autoComplete="username"
            error={errors.username}
          />

          <div className="mt-4">
            <AuthField
              id="reg-password"
              label="密码"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="至少 6 位"
              autoComplete="new-password"
              error={errors.password}
            />
          </div>

          <div className="mt-4">
            <AuthField
              id="reg-confirm"
              label="确认密码"
              type="password"
              value={confirm}
              onChange={setConfirm}
              placeholder="再次输入密码"
              autoComplete="new-password"
              error={errors.confirm}
            />
          </div>

          <AvatarPicker value={avatar} onChange={setAvatar} />

          <button
            type="submit"
            disabled={busy}
            className="mt-8 w-full rounded-xl border border-accent/40 bg-accent/20 py-3 text-sm font-medium text-frost transition hover:border-accent/60 hover:bg-accent/30 disabled:opacity-50"
          >
            {busy ? "连接中…" : "注册"}
          </button>
          {busy && slowHint && !bannerError && (
            <p className="mt-3 animate-pulse text-center text-xs leading-relaxed text-muted">
              {API_COLD_START_HINT}
            </p>
          )}

          <p className="mt-6 text-center text-xs text-muted">
            已有账号？{" "}
            <Link
              href="/login"
              className="text-accent/90 underline-offset-2 hover:text-accent hover:underline"
            >
              去登录
            </Link>
          </p>
        </form>
      </motion.div>
    </ReadingLayout>
  );
}

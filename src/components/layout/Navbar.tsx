"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { ThemeOrbStrip } from "@/components/ui/ThemeOrbStrip";
import { useTheme } from "@/context/ThemeContext";

const links = [
  { href: "/", label: "入口" },
  { href: "/breathe", label: "呼吸" },
  { href: "/about", label: "关于" },
  { href: "/history", label: "记录" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const inRitual = pathname.startsWith("/reading");
  const { theme } = useTheme();

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-0 right-0 left-0 z-50 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]"
      >
        <nav
          className={`mx-auto flex max-w-lg items-center justify-between ${
            inRitual
              ? "px-1 py-2"
              : "glass-panel rounded-full px-4 py-2.5"
          }`}
        >
          <Link href="/" className="flex items-center gap-2 py-1">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-accent"
              animate={{ opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            {!inRitual && (
              <span className="font-display text-sm tracking-[0.18em] text-frost/90 uppercase">
                Oracle
              </span>
            )}
          </Link>

          {!inRitual && (
            <div className="hidden items-center gap-1 md:flex">
              {links.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 text-xs tracking-wide ${
                      active ? "text-frost" : "text-muted hover:text-frost"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {!loading &&
                (user ? (
                  <button
                    type="button"
                    onClick={logout}
                    className="ml-2 rounded-full p-0.5 transition hover:ring-2 hover:ring-accent/30"
                    aria-label="退出登录"
                    title="退出登录"
                  >
                    <UserAvatar user={user} size={28} />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="ml-2 text-[10px] text-accent/90"
                  >
                    登录
                  </Link>
                ))}
            </div>
          )}

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]"
            onClick={() => setOpen((v) => !v)}
            aria-label="意识菜单"
          >
            <span className="absolute h-px w-4 bg-frost/80" />
            <span className="absolute h-px w-2.5 bg-muted translate-y-1.5" />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col backdrop-blur-2xl"
            style={{ background: theme.colors.glass }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
              <span className="text-[10px] tracking-[0.35em] text-muted uppercase">
                意识层
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted"
              >
                关闭
              </button>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-2 px-8">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="font-display block py-4 text-2xl text-frost"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {!loading &&
                (user ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="mt-4 flex items-center gap-3 text-left"
                    aria-label="退出登录"
                  >
                    <UserAvatar user={user} size={36} />
                    <span className="text-sm text-muted">退出</span>
                  </button>
                ) : (
                  <div className="mt-4 flex gap-4">
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="text-sm text-accent"
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="text-sm text-muted"
                    >
                      注册
                    </Link>
                  </div>
                ))}
            </div>

            <div className="border-t border-white/[0.06] px-5 py-8">
              <p className="mb-4 text-center text-[9px] tracking-[0.3em] text-muted uppercase">
                切换意识色调
              </p>
              <ThemeOrbStrip compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

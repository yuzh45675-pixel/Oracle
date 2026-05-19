"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/", label: "首页" },
  { href: "/reading", label: "占卜" },
  { href: "/history", label: "记录" },
  { href: "/about", label: "关于" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, logout, loading } = useAuth();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-5 md:px-10"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/[0.06] bg-void/60 px-5 py-3 backdrop-blur-2xl">
        <Link href="/" className="group flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_rgba(110,91,255,0.8)]" />
          <span className="font-display text-lg tracking-[0.2em] text-frost uppercase">
            Oracle
          </span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <ul className="flex items-center gap-1">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative px-4 py-2 text-sm tracking-wide transition-colors ${
                    active ? "text-frost" : "text-muted hover:text-frost"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/[0.06]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        {!loading && (
          user ? (
            <div className="flex items-center gap-2 border-l border-white/[0.08] pl-3">
              <span className="text-xs text-muted">{user.username}</span>
              <button
                type="button"
                onClick={logout}
                className="text-xs text-accent/90 hover:text-accent"
              >
                退出
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-white/[0.08] pl-3">
              <Link
                href="/login"
                className="rounded-full border border-accent/30 px-3 py-1.5 text-xs text-frost hover:bg-accent/10"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="text-xs text-muted hover:text-frost"
              >
                注册
              </Link>
            </div>
          )
        )}
        </div>

        <button
          type="button"
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="菜单"
        >
          <span className="h-px w-6 bg-frost" />
          <span className="h-px w-4 bg-muted" />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto mt-2 max-w-6xl rounded-2xl border border-white/[0.06] bg-surface/95 p-4 backdrop-blur-2xl md:hidden"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm text-muted hover:text-frost"
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

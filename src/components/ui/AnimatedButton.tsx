"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}

const spring = { type: "spring" as const, stiffness: 400, damping: 28 };

export function AnimatedButton({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
}: AnimatedButtonProps) {
  const base =
    "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-3.5 text-sm font-medium tracking-wide transition-colors duration-500";
  const variants = {
    primary:
      "bg-white/[0.08] text-frost backdrop-blur-xl border border-white/[0.12] hover:bg-white/[0.14] hover:border-accent/30 shadow-glow",
    ghost:
      "bg-transparent text-muted border border-white/[0.08] hover:text-frost hover:border-white/[0.16]",
  };

  const classes = `${base} ${variants[variant]} ${disabled ? "opacity-40 pointer-events-none" : ""} ${className}`;

  const inner = (
  <>
      <motion.span
        className="absolute inset-0 bg-gradient-accent opacity-0"
        whileHover={{ opacity: variant === "primary" ? 0.12 : 0 }}
        transition={{ duration: 0.4 }}
      />
      <span className="relative z-10">{children}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring}>
        <Link href={href} className={classes}>
          {inner}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={spring}
    >
      {inner}
    </motion.button>
  );
}

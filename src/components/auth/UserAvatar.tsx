"use client";

import { useRef, useState } from "react";
import type { AuthUser } from "@/lib/auth-client";
import { ThemeDefaultAvatar } from "./ThemeDefaultAvatar";
import type { ThemeId } from "@/lib/themes";

interface UserAvatarProps {
  user: Pick<AuthUser, "avatarType" | "avatarTheme" | "avatarData">;
  size?: number;
  className?: string;
  title?: string;
}

export function UserAvatar({
  user,
  size = 32,
  className = "",
  title,
}: UserAvatarProps) {
  const themeId = (user.avatarTheme ?? "astral-void") as ThemeId;

  if (user.avatarType === "custom" && user.avatarData) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarData}
        alt=""
        title={title}
        className={`rounded-full object-cover ring-1 ring-white/10 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span title={title} className={`inline-flex ${className}`}>
      <ThemeDefaultAvatar
        themeId={themeId}
        size={size}
      />
    </span>
  );
}

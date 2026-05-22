"use client";

import { useRef, useState } from "react";
import {
  avatarSelectionToPayload,
  DEFAULT_THEME_AVATARS,
  readAvatarFile,
  type AvatarSelection,
} from "@/lib/avatars";
import type { ThemeId } from "@/lib/themes";
import { ThemeDefaultAvatar } from "./ThemeDefaultAvatar";

interface AvatarPickerProps {
  value: AvatarSelection;
  onChange: (next: AvatarSelection) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const pickTheme = (themeId: ThemeId) => {
    setUploadError(null);
    onChange({ avatarType: "theme", avatarTheme: themeId });
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    try {
      const avatarData = await readAvatarFile(file);
      onChange({ avatarType: "custom", avatarData });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "上传失败");
    }
  };

  return (
    <div className="mt-4">
      <p className="mb-3 text-xs tracking-widest text-muted uppercase">
        选择头像
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {DEFAULT_THEME_AVATARS.map(({ id, label }) => {
          const selected =
            value.avatarType === "theme" && value.avatarTheme === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => pickTheme(id)}
              className="flex flex-col items-center gap-1.5"
              aria-pressed={selected}
            >
              <ThemeDefaultAvatar themeId={id} size={52} selected={selected} />
              <span
                className={`text-[9px] tracking-wider ${
                  selected ? "text-accent" : "text-muted/80"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center gap-1.5"
          aria-pressed={value.avatarType === "custom"}
        >
          <span
            className={`flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-full border ${
              value.avatarType === "custom"
                ? "border-accent/60 ring-2 ring-accent/40"
                : "border-white/10 bg-white/[0.04]"
            }`}
          >
            {value.avatarType === "custom" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value.avatarData}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg text-muted/70">+</span>
            )}
          </span>
          <span
            className={`text-[9px] tracking-wider ${
              value.avatarType === "custom" ? "text-accent" : "text-muted/80"
            }`}
          >
            上传
          </span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />

      {uploadError && (
        <p className="mt-2 text-center text-xs text-red-300">{uploadError}</p>
      )}
    </div>
  );
}

export { avatarSelectionToPayload };

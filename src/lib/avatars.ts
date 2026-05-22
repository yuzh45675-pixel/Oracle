import type { ThemeId } from "@/lib/themes";

export type AvatarSelection =
  | { avatarType: "theme"; avatarTheme: ThemeId }
  | { avatarType: "custom"; avatarData: string };

export const DEFAULT_THEME_AVATARS: {
  id: ThemeId;
  label: string;
}[] = [
  { id: "astral-void", label: "深空" },
  { id: "rose-mist", label: "玫瑰" },
  { id: "matcha-sanctuary", label: "茶室" },
  { id: "solar-archive", label: "档案" },
];

export function avatarSelectionToPayload(selection: AvatarSelection) {
  if (selection.avatarType === "custom") {
    return {
      avatarType: "custom" as const,
      avatarData: selection.avatarData,
    };
  }
  return {
    avatarType: "theme" as const,
    avatarTheme: selection.avatarTheme,
  };
}

export async function readAvatarFile(file: File): Promise<string> {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    throw new Error("请上传 JPG、PNG 或 WebP 图片");
  }
  if (file.size > 300_000) {
    throw new Error("图片请小于 300KB");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("读取图片失败"));
    };
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });
}

const THEME_AVATARS = new Set([
  "astral-void",
  "rose-mist",
  "matcha-sanctuary",
  "solar-archive",
]);

const MAX_CUSTOM_BYTES = 400_000;

function normalizeAvatar(input) {
  if (!input || typeof input !== "object") {
    return {
      ok: true,
      avatar: {
        avatarType: "theme",
        avatarTheme: "astral-void",
        avatarData: null,
      },
    };
  }

  const type = input.avatarType ?? input.type;

  if (type === "theme") {
    const theme = String(input.avatarTheme ?? input.themeId ?? "astral-void");
    if (!THEME_AVATARS.has(theme)) {
      return { ok: false, msg: "请选择有效的默认头像" };
    }
    return {
      ok: true,
      avatar: { avatarType: "theme", avatarTheme: theme, avatarData: null },
    };
  }

  if (type === "custom") {
    const data = String(input.avatarData ?? "");
    if (!/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(data)) {
      return { ok: false, msg: "请上传 JPG、PNG 或 WebP 图片" };
    }
    if (Buffer.byteLength(data, "utf8") > MAX_CUSTOM_BYTES) {
      return { ok: false, msg: "头像图片过大，请小于 300KB" };
    }
    return {
      ok: true,
      avatar: { avatarType: "custom", avatarTheme: null, avatarData: data },
    };
  }

  return { ok: false, msg: "无效的头像类型" };
}

function avatarForPublic(user) {
  const avatarType = user.avatarType === "custom" ? "custom" : "theme";
  if (avatarType === "custom" && user.avatarData) {
    return {
      avatarType: "custom",
      avatarTheme: null,
      avatarData: user.avatarData,
    };
  }
  return {
    avatarType: "theme",
    avatarTheme: THEME_AVATARS.has(user.avatarTheme)
      ? user.avatarTheme
      : "astral-void",
    avatarData: null,
  };
}

module.exports = { normalizeAvatar, avatarForPublic, THEME_AVATARS };

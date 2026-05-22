export type ThemeId =
  | "astral-void"
  | "rose-mist"
  | "matcha-sanctuary"
  | "solar-archive";

export type FormationId =
  | "moon"
  | "venus"
  | "rose"
  | "heart-rune"
  | "zodiac"
  | "hexagram"
  | "wheel"
  | "alchemy"
  | "eye"
  | "serpent"
  | "none";

export type ReadingWorld = "tarot" | "lenormand";

export interface OracleTheme {
  id: ThemeId;
  name: string;
  tagline: string;
  world: ReadingWorld | "both";
  formations: FormationId[];
  isLight: boolean;
  colors: {
    void: string;
    voidDeep: string;
    surface: string;
    mystic: string;
    accent: string;
    accentSoft: string;
    accentDim: string;
    frost: string;
    muted: string;
    metal: string;
    particleA: string;
    particleB: string;
    particleC: string;
    glowPrimary: string;
    glowSecondary: string;
    fog: string;
    cardBackFrom: string;
    cardBackTo: string;
    glass: string;
    border: string;
  };
  particles: {
    trail: number;
    intensity: number;
    attract: number;
  };
}

const LEGACY_THEME_MAP: Record<string, ThemeId> = {
  "velvet-venus": "rose-mist",
  "obsidian-gold": "matcha-sanctuary",
  "emerald-phantom": "solar-archive",
};

/** 纯黑底 + 单一高饱和 accent —— 结构与 Astral Void 一致，仅色相不同 */
function darkAccentTheme(
  id: ThemeId,
  meta: Pick<OracleTheme, "name" | "tagline" | "world" | "formations">,
  palette: {
    mystic: string;
    accent: string;
    accentSoft: string;
    accentDim: string;
    metal: string;
    particleA: string;
    particleB: string;
    particleC: string;
    glowPrimary: string;
    glowSecondary: string;
  },
  particles: OracleTheme["particles"] = {
    trail: 0.35,
    intensity: 1,
    attract: 0.28,
  },
): OracleTheme {
  return {
    id,
    ...meta,
    isLight: false,
    colors: {
      void: "#050505",
      voidDeep: "#030308",
      surface: "#0A0A0C",
      mystic: palette.mystic,
      accent: palette.accent,
      accentSoft: palette.accentSoft,
      accentDim: palette.accentDim,
      frost: "#E8E6F0",
      muted: "#8B8798",
      metal: palette.metal,
      particleA: palette.particleA,
      particleB: palette.particleB,
      particleC: palette.particleC,
      glowPrimary: palette.glowPrimary,
      glowSecondary: palette.glowSecondary,
      fog: "#050505",
      cardBackFrom: palette.mystic,
      cardBackTo: "#050505",
      glass: "rgba(8, 8, 10, 0.72)",
      border: "rgba(255, 255, 255, 0.08)",
    },
    particles,
  };
}

export const ORACLE_THEMES: Record<ThemeId, OracleTheme> = {
  "astral-void": {
    id: "astral-void",
    name: "Astral Void",
    tagline: "深空意识 · AI 神秘学",
    world: "tarot",
    isLight: false,
    formations: ["moon", "hexagram", "zodiac"],
    colors: {
      void: "#050505",
      voidDeep: "#030308",
      surface: "#0F1115",
      mystic: "#1B1830",
      accent: "#9B8CFF",
      accentSoft: "#D4CCFF",
      accentDim: "#6B5FD4",
      frost: "#E8E6F0",
      muted: "#8B8798",
      metal: "#C8C4E8",
      particleA: "#8A82D4",
      particleB: "#F0EEFF",
      particleC: "#A8B4FF",
      glowPrimary: "rgba(155, 140, 255, 0.32)",
      glowSecondary: "rgba(200, 210, 255, 0.18)",
      fog: "#050505",
      cardBackFrom: "#1B1830",
      cardBackTo: "#050505",
      glass: "rgba(15, 17, 21, 0.6)",
      border: "rgba(255, 255, 255, 0.08)",
    },
    particles: { trail: 0.35, intensity: 1, attract: 0.28 },
  },
  "rose-mist": darkAccentTheme(
    "rose-mist",
    {
      name: "Rose Mist",
      tagline: "晨雾玫瑰 · 柔和梦境",
      world: "both",
      formations: ["moon", "rose", "venus", "heart-rune"],
    },
    {
      mystic: "#140810",
      accent: "#E8B4C4",
      accentSoft: "#FFF0F4",
      accentDim: "#C9899E",
      metal: "#F5C6D4",
      particleA: "#E8B4C4",
      particleB: "#FFF5F8",
      particleC: "#F0C4D0",
      glowPrimary: "rgba(245, 196, 210, 0.36)",
      glowSecondary: "rgba(255, 236, 242, 0.24)",
    },
    { trail: 0.38, intensity: 1, attract: 0.3 },
  ),
  "matcha-sanctuary": darkAccentTheme(
    "matcha-sanctuary",
    {
      name: "Matcha Sanctuary",
      tagline: "京都茶室 · 疗愈禅意",
      world: "both",
      formations: ["hexagram", "wheel", "moon"],
    },
    {
      mystic: "#081018",
      accent: "#A8D4FF",
      accentSoft: "#EEF6FF",
      accentDim: "#6BA3D4",
      metal: "#D8ECFF",
      particleA: "#8EC5FF",
      particleB: "#F4FAFF",
      particleC: "#C5E4FF",
      glowPrimary: "rgba(168, 212, 255, 0.38)",
      glowSecondary: "rgba(255, 255, 255, 0.18)",
    },
  ),
  "solar-archive": darkAccentTheme(
    "solar-archive",
    {
      name: "Solar Archive",
      tagline: "阳光档案 · 古典占卜",
      world: "lenormand",
      formations: ["zodiac", "wheel", "moon"],
    },
    {
      mystic: "#0A0C14",
      accent: "#C8D8F0",
      accentSoft: "#F2F6FC",
      accentDim: "#8494B0",
      metal: "#E2EAF4",
      particleA: "#E8C060",
      particleB: "#FFF6E8",
      particleC: "#F0A848",
      glowPrimary: "rgba(200, 220, 245, 0.34)",
      glowSecondary: "rgba(255, 255, 255, 0.14)",
    },
  ),
};

export const THEME_LIST = Object.values(ORACLE_THEMES);

export function normalizeThemeId(raw: string | null): ThemeId {
  if (raw && raw in ORACLE_THEMES) return raw as ThemeId;
  if (raw && raw in LEGACY_THEME_MAP) return LEGACY_THEME_MAP[raw]!;
  return "astral-void";
}

export function themeForWorld(_world: ReadingWorld): ThemeId {
  return "astral-void";
}

export function applyThemeToDocument(theme: OracleTheme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme.id);
  root.setAttribute("data-light", theme.isLight ? "true" : "false");
  const c = theme.colors;
  root.style.setProperty("--void", c.void);
  root.style.setProperty("--void-deep", c.voidDeep);
  root.style.setProperty("--surface", c.surface);
  root.style.setProperty("--mystic", c.mystic);
  root.style.setProperty("--accent", c.accent);
  root.style.setProperty("--accent-soft", c.accentSoft);
  root.style.setProperty("--accent-dim", c.accentDim);
  root.style.setProperty("--frost", c.frost);
  root.style.setProperty("--muted", c.muted);
  root.style.setProperty("--metal", c.metal);
  root.style.setProperty("--particle-a", c.particleA);
  root.style.setProperty("--particle-b", c.particleB);
  root.style.setProperty("--particle-c", c.particleC);
  root.style.setProperty("--glow-primary", c.glowPrimary);
  root.style.setProperty("--glow-secondary", c.glowSecondary);
  root.style.setProperty("--fog", c.fog);
  root.style.setProperty("--card-back-from", c.cardBackFrom);
  root.style.setProperty("--card-back-to", c.cardBackTo);
  root.style.setProperty("--glass", c.glass);
  root.style.setProperty("--border-subtle", c.border);
  root.style.setProperty("--background", c.void);
  root.style.setProperty("--foreground", c.frost);
}

import {
  getSessionDeckLabel,
  getSessionSpreadLabel,
} from "@/lib/session-labels";
import type { CardReadingSnapshot, ReadingSession } from "@/types/tarot";

const WIDTH = 1080;
const PAD = 72;
const CONTENT_W = WIDTH - PAD * 2;

const COLORS = {
  bg: "#0c0b14",
  bg2: "#141222",
  accent: "#9b8cff",
  accentSoft: "rgba(155, 140, 255, 0.15)",
  frost: "#ebe9f5",
  muted: "#8f8ba3",
  line: "rgba(255,255,255,0.08)",
  cardBg: "#f5f0e8",
};

const SITE_URL = "oracle-tarot-xi.vercel.app";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    const url = src.startsWith("http")
      ? src
      : `${window.location.origin}${src.startsWith("/") ? src : `/${src}`}`;
    img.src = url;
  });
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const paragraphs = text.split("\n");
  const lines: string[] = [];
  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const char of para) {
      const test = line + char;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = char;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const lines = wrapLines(ctx, text, maxWidth);
  for (const line of lines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

function estimateHeight(
  ctx: CanvasRenderingContext2D,
  session: ReadingSession,
): number {
  let h = PAD + 220;

  if (session.question) h += 80;
  const previewCount = Math.min(session.cards.length, 8);
  const previewRows = Math.max(1, Math.ceil(previewCount / 4));
  h += previewRows * 300 + 80;

  if (session.aiInterpretation) {
    ctx.font = "28px sans-serif";
    const lines = wrapLines(ctx, session.aiInterpretation, CONTENT_W - 48);
    h += 120 + lines.length * 44;
  }

  h += 120;
  return Math.max(h, 1400);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function exportReadingImage(
  session: ReadingSession,
): Promise<Blob> {
  const measureCanvas = document.createElement("canvas");
  measureCanvas.width = WIDTH;
  const measureCtx = measureCanvas.getContext("2d");
  if (!measureCtx) throw new Error("Canvas not supported");

  const height = estimateHeight(measureCtx, session);
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, COLORS.bg);
  bgGrad.addColorStop(0.4, COLORS.bg2);
  bgGrad.addColorStop(1, "#0a0812");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, WIDTH, height);

  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(PAD / 2, PAD / 2, WIDTH - PAD, height - PAD);

  let y = PAD + 20;

  try {
    const logo = await loadImage("/share/oracle-logo.svg");
    ctx.drawImage(logo, WIDTH / 2 - 48, y, 96, 96);
    y += 112;
  } catch {
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath();
    ctx.arc(WIDTH / 2, y + 24, 8, 0, Math.PI * 2);
    ctx.fill();
    y += 48;
  }

  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.frost;
  ctx.font = "bold 42px Georgia, 'Times New Roman', serif";
  ctx.fillText("Oracle", WIDTH / 2, y);
  y += 36;

  ctx.fillStyle = COLORS.accent;
  ctx.font = "22px sans-serif";
  ctx.fillText("ORACLE READING REPORT", WIDTH / 2, y);
  y += 48;

  const spreadLabel = getSessionSpreadLabel(session);
  const deckLabel = getSessionDeckLabel(session);
  const dateStr = new Date(session.createdAt).toLocaleString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  roundRect(ctx, PAD, y, CONTENT_W, 88, 16);
  ctx.fillStyle = COLORS.accentSoft;
  ctx.fill();
  ctx.strokeStyle = "rgba(155,140,255,0.25)";
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.muted;
  ctx.font = "22px sans-serif";
  ctx.fillText(`${deckLabel} · ${spreadLabel}`, PAD + 28, y + 36);
  ctx.fillText(dateStr, PAD + 28, y + 68);
  y += 108;

  if (session.question) {
    ctx.textAlign = "center";
    ctx.fillStyle = COLORS.frost;
    ctx.font = "italic 30px Georgia, serif";
    y = drawWrappedText(
      ctx,
      `「${session.question}」`,
      WIDTH / 2,
      y,
      CONTENT_W - 40,
      42,
    );
    y += 24;
  }

  const cardReadings =
    session.cardReadings ??
    session.cards.map((d) => ({
      cardId: d.card.id,
      cardName: d.card.name,
      image: d.card.image,
      position: d.position,
      reversed: d.reversed,
      summary: "",
      detail: "",
    }));

  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.accent;
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("✦ 牌面概览", PAD, y);
  y += 36;

  const cardCount = Math.min(cardReadings.length, 8);
  const cols = Math.min(cardCount, 4);
  const cardW = cols <= 3 ? 160 : 132;
  const cardH = Math.round(cardW * 1.45);
  const gap = cols <= 3 ? 32 : 22;
  const rowGap = 118;

  const cardImages = await Promise.all(
    cardReadings.slice(0, 8).map(async (r) => {
      try {
        return await loadImage(r.image);
      } catch {
        return null;
      }
    }),
  );

  for (let i = 0; i < cardCount; i++) {
    const r = cardReadings[i];
    const row = Math.floor(i / 4);
    const col = i % 4;
    const countInRow = Math.min(4, cardCount - row * 4);
    const rowW = countInRow * cardW + (countInRow - 1) * gap;
    const cx = (WIDTH - rowW) / 2 + col * (cardW + gap);
    const cy = y + row * (cardH + rowGap);

    roundRect(ctx, cx, cy, cardW, cardH, 10);
    ctx.fillStyle = COLORS.cardBg;
    ctx.fill();
    ctx.strokeStyle = "rgba(155,140,255,0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const img = cardImages[i];
    if (img) {
      const pad = 6;
      ctx.drawImage(img, cx + pad, cy + pad, cardW - pad * 2, cardH - pad * 2);
    }

    ctx.textAlign = "center";
    ctx.fillStyle = COLORS.accent;
    ctx.font = "18px sans-serif";
    if (r.position) {
      ctx.fillText(r.position, cx + cardW / 2, cy + cardH + 28);
    }

    ctx.fillStyle = COLORS.frost;
    ctx.font = "20px sans-serif";
    ctx.fillText(r.cardName, cx + cardW / 2, cy + cardH + (r.position ? 54 : 32));

    if (session.deck !== "lenormand" && r.reversed !== undefined) {
      ctx.fillStyle = COLORS.muted;
      ctx.font = "16px sans-serif";
      ctx.fillText(
        r.reversed ? "逆位" : "正位",
        cx + cardW / 2,
        cy + cardH + (r.position ? 78 : 56),
      );
    }
  }

  y += Math.ceil(cardCount / 4) * (cardH + rowGap) + 12;

  if (session.aiInterpretation) {
    ctx.textAlign = "left";
    ctx.fillStyle = COLORS.accent;
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("✦ AI 解读", PAD, y);
    y += 36;

    roundRect(ctx, PAD, y, CONTENT_W, 24, 14);
    const boxTop = y;
    ctx.font = "28px sans-serif";
    const aiLines = wrapLines(ctx, session.aiInterpretation, CONTENT_W - 48);
    const boxH = Math.max(aiLines.length * 42 + 48, 80);
    roundRect(ctx, PAD, boxTop, CONTENT_W, boxH, 14);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fill();
    ctx.strokeStyle = COLORS.line;
    ctx.stroke();

    ctx.fillStyle = COLORS.frost;
    y = drawWrappedText(
      ctx,
      session.aiInterpretation,
      PAD + 24,
      boxTop + 40,
      CONTENT_W - 48,
      42,
    );
    y += 32;
  }

  y = height - 80;
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.accent;
  ctx.font = "22px sans-serif";
  ctx.fillText(SITE_URL, WIDTH / 2, y);
  ctx.fillStyle = COLORS.muted;
  ctx.font = "18px sans-serif";
  ctx.fillText("仅供娱乐与自我探索参考 · Oracle 塔罗", WIDTH / 2, y + 32);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create image"));
      },
      "image/png",
      1,
    );
  });
}

export function downloadReadingImageFilename(session: ReadingSession): string {
  const d = new Date(session.createdAt);
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}_${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;
  return `Oracle解读_${stamp}.png`;
}

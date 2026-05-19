/**
 * Split "Das Spiel der Hofnung (The Game of Hope)" — 36-card Lenormand sheet.
 * https://commons.wikimedia.org/wiki/File:Das_Spiel_der_Hofnung_(The_Game_of_Hope).png
 *
 * Grid: 6×6, row-major (1=top-left … 36=bottom-right). Do NOT trim the sheet or
 * cells — trim shifts crops and mixes neighboring cards.
 */
import { spawn } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const cardsDir = join(root, "public", "cards");
const sheetPath = join(cardsDir, "_game-of-hope-sheet.png");
const deckPath = join(root, "src", "data", "lenormand-deck.json");

const SHEET_URL =
  "https://upload.wikimedia.org/wikipedia/commons/a/a6/Das_Spiel_der_Hofnung_%28The_Game_of_Hope%29.png";

const COLS = 6;
const ROWS = 6;
/** Margin around the card grid (fraction of sheet width/height) */
const TRIM = Number(process.env.GAME_OF_HOPE_TRIM || 0.018);
/** Inset inside each cell (fraction of cell size) */
const CELL_INSET = Number(process.env.GAME_OF_HOPE_CELL_INSET || 0.04);
const OUT_W = 420;
const OUT_H = 640;
const PARCHMENT = { r: 245, g: 238, b: 228 };
const IMAGE_VERSION = process.env.LENORMAND_IMAGE_VERSION || "goh-2";

mkdirSync(cardsDir, { recursive: true });

function curlDownload(url, dest) {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      "curl",
      [
        "-L",
        "--fail",
        "--retry",
        "5",
        "--connect-timeout",
        "60",
        "--max-time",
        "600",
        "-o",
        dest,
        url,
      ],
      { stdio: "inherit" }
    );
    proc.on("error", reject);
    proc.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`curl exit ${code}`))
    );
  });
}

const forceSheet = process.argv.includes("--redownload-sheet");
if (forceSheet && existsSync(sheetPath)) {
  const { unlinkSync } = await import("fs");
  unlinkSync(sheetPath);
}

console.log("Downloading Game of Hope sheet…");
if (!existsSync(sheetPath)) {
  await curlDownload(SHEET_URL, sheetPath);
}

const sheet = sharp(sheetPath);
const meta = await sheet.metadata();
const W = meta.width ?? 0;
const H = meta.height ?? 0;
if (W < 100 || H < 100) throw new Error("Invalid sheet dimensions");

const gridW = W * (1 - TRIM * 2);
const gridH = H * (1 - TRIM * 2);
const offsetX = W * TRIM;
const offsetY = H * TRIM;
const cellW = Math.floor(gridW / COLS);
const cellH = Math.floor(gridH / ROWS);

console.log(`Sheet ${W}×${H}, grid ${COLS}×${ROWS}, cell ~${cellW}×${cellH}`);

const deck = JSON.parse(readFileSync(deckPath, "utf8"));

for (let n = 1; n <= Math.min(deck.length, COLS * ROWS); n++) {
  const i = n - 1;
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const insetX = Math.round(cellW * CELL_INSET);
  const insetY = Math.round(cellH * CELL_INSET);
  const left = Math.round(offsetX + col * cellW + insetX);
  const top = Math.round(offsetY + row * cellH + insetY);
  const width = Math.max(8, cellW - insetX * 2);
  const height = Math.max(8, cellH - insetY * 2);
  const dest = join(cardsDir, `lenormand-${String(n).padStart(2, "0")}.png`);

  await sheet
    .clone()
    .extract({ left, top, width, height })
    .resize(OUT_W, OUT_H, {
      fit: "contain",
      background: PARCHMENT,
    })
    .png({ compressionLevel: 9 })
    .toFile(dest);

  const rel = `/cards/lenormand-${String(n).padStart(2, "0")}.png?v=${IMAGE_VERSION}`;
  const card = deck.find((c) => c.number === n);
  if (card) card.image = rel;
  console.log(
    `  ${String(n).padStart(2, "0")} ${card?.name ?? ""} (${card?.nameEn ?? ""})`
  );
}

writeFileSync(deckPath, JSON.stringify(deck, null, 2) + "\n", "utf8");
console.log(`\nDone (${IMAGE_VERSION}). Hard-refresh the app (Ctrl+F5).`);

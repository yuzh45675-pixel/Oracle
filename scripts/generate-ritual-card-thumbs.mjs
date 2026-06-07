/**
 * 生成牌阵揭示用 WebP 缩略图（~400px），避免翻开 10MB+ PNG 时长时间解码。
 * 输出：public/cards/ritual/*.webp
 */
import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const cardsDir = join(root, "public", "cards");
const ritualDir = join(cardsDir, "ritual");

const RITUAL_WIDTH = 400;
const WEBP_QUALITY = 78;

mkdirSync(ritualDir, { recursive: true });

const pngs = readdirSync(cardsDir).filter(
  (f) => f.endsWith(".png") && !f.startsWith("."),
);

let created = 0;
let skipped = 0;

for (const file of pngs) {
  const src = join(cardsDir, file);
  const dest = join(ritualDir, file.replace(/\.png$/i, ".webp"));
  if (existsSync(dest) && statSync(dest).mtimeMs >= statSync(src).mtimeMs) {
    skipped += 1;
    continue;
  }
  await sharp(src)
    .resize(RITUAL_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(dest);
  created += 1;
  if (created % 10 === 0) {
    console.log(`…已生成 ${created} 张`);
  }
}

console.log(`完成：新建 ${created}，跳过 ${skipped}，共 ${pngs.length} 张源图`);

/**
 * Static page to verify all 36 Lenormand images vs names.
 * Open: http://localhost:3000/lenormand-audit.html
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const deck = JSON.parse(
  readFileSync(join(root, "src", "data", "lenormand-deck.json"), "utf8")
);

const rows = deck
  .sort((a, b) => a.number - b.number)
  .map(
    (c) => `
    <figure>
      <img src="${c.image}" alt="${c.nameEn}" loading="lazy" />
      <figcaption>
        <strong>${String(c.number).padStart(2, "0")}</strong>
        ${c.name} · ${c.nameEn}
        <code>${c.id}</code>
      </figcaption>
    </figure>`
  )
  .join("");

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>雷诺曼 36 张对照</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; padding: 1.5rem; background: #1a1814; color: #e8e0d4; }
    h1 { font-weight: 400; }
    p { color: #a89f90; max-width: 52rem; line-height: 1.6; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
    figure { margin: 0; background: #f5f0e8; border-radius: 8px; overflow: hidden; }
    img { width: 100%; aspect-ratio: 21/32; object-fit: contain; display: block; }
    figcaption { padding: 0.5rem 0.6rem; font-size: 0.75rem; background: #2a2520; color: #e8e0d4; line-height: 1.4; }
    figcaption code { display: block; opacity: 0.65; font-size: 0.65rem; margin-top: 0.2rem; }
    figcaption strong { font-size: 1rem; margin-right: 0.35rem; }
  </style>
</head>
<body>
  <h1>雷诺曼 36 张 · 牌面与名称对照</h1>
  <p>每张图上方应能看到印刷编号（1–36），并与下方中文/英文名一致。若某张不对，请记下编号反馈。</p>
  <div class="grid">${rows}</div>
</body>
</html>`;

writeFileSync(join(root, "public", "lenormand-audit.html"), html, "utf8");
console.log("Wrote public/lenormand-audit.html");

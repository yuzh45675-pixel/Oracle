/**
 * 生成网站访问二维码 PNG
 * 用法: npm run qrcode
 * 自定义地址: SITE_URL=https://www.oracletarot.top npm run qrcode
 */
import QRCode from "qrcode";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "share");

const siteUrl =
  process.env.SITE_URL?.replace(/\/$/, "") ||
  "https://oracle-tarot-xi.vercel.app";

const qrOptions = {
  margin: 2,
  color: {
    dark: "#E8E4DC",
    light: "#0A0A0F",
  },
};

mkdirSync(outDir, { recursive: true });

await QRCode.toFile(join(outDir, "oracle-qrcode.png"), siteUrl, {
  ...qrOptions,
  width: 1024,
});

await QRCode.toFile(join(outDir, "oracle-qrcode-sm.png"), siteUrl, {
  ...qrOptions,
  width: 512,
});

console.log(`二维码已生成 → ${siteUrl}`);
console.log(`  public/share/oracle-qrcode.png (1024px，适合打印)`);
console.log(`  public/share/oracle-qrcode-sm.png (512px，适合网页)`);

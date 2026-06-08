/**
 * 定时访问 Neon 数据库，防止免费版长期休眠。
 * GitHub Actions 使用：在仓库 Secrets 设置 DATABASE_URL
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("缺少 DATABASE_URL 环境变量");
  process.exit(1);
}

let connectionString = url;
if (connectionString.startsWith("postgres://")) {
  connectionString = `postgresql://${connectionString.slice("postgres://".length)}`;
}
if (!connectionString.includes("sslmode=")) {
  connectionString += connectionString.includes("?")
    ? "&sslmode=require"
    : "?sslmode=require";
}

const sql = neon(connectionString);

const ping = await sql`SELECT 1 AS ok, NOW() AS server_time`;
console.log("Neon ping OK:", ping[0]);

const rows = await sql`SELECT key, updated_at FROM app_data ORDER BY key`;
console.log(
  "app_data keys:",
  rows.map((r) => `${r.key}@${r.updated_at}`).join(", ") || "(empty)",
);

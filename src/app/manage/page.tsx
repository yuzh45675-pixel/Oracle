"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearAdminKey,
  fetchAdminOverview,
  getAdminKey,
  verifyAdminPassword,
  type AdminOverview,
} from "@/lib/admin-api";

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("zh-CN", { hour12: false });
  } catch {
    return iso;
  }
}

export default function ManagePage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminOverview | null>(null);
  const [tab, setTab] = useState<"readings" | "feedback" | "users" | "orders">(
    "readings",
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const overview = await fetchAdminOverview();
      setData(overview);
      setAuthed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
      if (
        e instanceof Error &&
        (e.message.includes("密钥") || e.message.includes("401"))
      ) {
        clearAdminKey();
        setAuthed(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getAdminKey()) {
      load();
    }
  }, [load]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verifyAdminPassword(password);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminKey();
    setAuthed(false);
    setData(null);
    setPassword("");
  };

  if (!authed) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-void px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-xl"
        >
          <p className="text-[10px] tracking-[0.35em] text-accent uppercase">
            Oracle Console
          </p>
          <h1 className="mt-2 font-display text-2xl font-light text-frost">
            管理后台
          </h1>
          <p className="mt-2 text-sm text-muted">
            输入服务器环境变量 <code className="text-accent/80">ADMIN_PASSWORD</code>
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="管理密钥"
            className="mt-6 w-full rounded-xl border border-white/[0.1] bg-black/30 px-4 py-3 text-sm text-frost outline-none focus:border-accent/40"
            autoComplete="current-password"
          />
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="mt-6 w-full rounded-full border border-accent/35 bg-accent/15 py-3 text-sm text-frost transition hover:bg-accent/25 disabled:opacity-50"
          >
            {loading ? "验证中…" : "进入"}
          </button>
        </form>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="min-h-[100dvh] bg-void px-4 py-8 text-frost sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.35em] text-accent uppercase">
              Oracle Console
            </p>
            <h1 className="font-display text-3xl font-light">运营总览</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="rounded-full border border-white/10 px-4 py-2 text-xs text-muted hover:text-frost"
            >
              {loading ? "刷新中…" : "刷新"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-white/10 px-4 py-2 text-xs text-muted hover:text-frost"
            >
              退出
            </button>
          </div>
        </header>

        {error && (
          <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["用户", stats?.users],
            ["微信用户", stats?.wechatUsers],
            ["今日解读", stats?.todayReadings],
            ["累计解读", stats?.totalReadings],
            ["反馈", stats?.feedback],
            ["已付款", stats?.paidOrders],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-5"
            >
              <p className="text-[10px] tracking-widest text-muted uppercase">
                {label}
              </p>
              <p className="mt-2 font-display text-2xl">{value ?? "—"}</p>
            </div>
          ))}
        </div>

        <nav className="mb-4 flex flex-wrap gap-2">
          {(
            [
              ["readings", "AI 解读记录"],
              ["feedback", "用户反馈"],
              ["users", "注册用户"],
              ["orders", "订单"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-2 text-xs tracking-wide ${
                tab === id
                  ? "bg-accent/20 text-accent"
                  : "border border-white/10 text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          {tab === "readings" && (
            <Table
              empty="暂无解读记录（用户登录后点「生成解读」会记录在这里）"
              rows={data?.readings ?? []}
              columns={[
                ["时间", (r) => fmtTime(r.createdAt)],
                ["用户", (r) => r.username],
                ["牌阵", (r) => r.spreadTitle ?? "—"],
                ["牌面", (r) => r.cardNames?.join("、") || "—"],
                ["问题", (r) => r.question ?? "—"],
                ["类型", (r) => (r.kind === "followup" ? "追问" : "首次")],
                ["计费", (r) => r.billing],
              ]}
            />
          )}
          {tab === "feedback" && (
            <Table
              empty="暂无反馈"
              rows={data?.feedback ?? []}
              columns={[
                ["时间", (r) => fmtTime(r.timestamp)],
                ["用户", (r) => r.username ?? "匿名"],
                ["准确度", (r) => r.accuracy],
                ["付费意愿", (r) => r.price],
                ["牌阵", (r) => r.spreadTitle ?? "—"],
                ["意见", (r) => r.dislike || "—"],
              ]}
            />
          )}
          {tab === "users" && (
            <Table
              empty="暂无用户"
              rows={data?.users ?? []}
              columns={[
                ["注册", (r) => fmtTime(r.createdAt)],
                ["用户名", (r) => r.username],
                ["登录方式", (r) => (r.authProvider === "wechat" ? "微信" : "账号")],
                ["额度", (r) => String(r.credits)],
                ["今日已用", (r) => String(r.freeUsedToday)],
              ]}
            />
          )}
          {tab === "orders" && (
            <Table
              empty="暂无订单"
              rows={data?.orders ?? []}
              columns={[
                ["时间", (r) => fmtTime(r.createdAt)],
                ["用户", (r) => r.username],
                ["金额", (r) => `¥${r.amount}`],
                ["状态", (r) => r.status],
                ["渠道", (r) => r.channel],
              ]}
            />
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          数据保存在 API 服务器本地文件（users / orders / activity / feedback.json）
        </p>
      </div>
    </div>
  );
}

function Table<T extends Record<string, unknown>>({
  rows,
  columns,
  empty,
}: {
  rows: T[];
  columns: [string, (row: T) => string][];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="p-8 text-center text-sm text-muted">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] text-[10px] tracking-widest text-muted uppercase">
            {columns.map(([h]) => (
              <th key={h} className="px-4 py-3 font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-white/[0.04] hover:bg-white/[0.03]"
            >
              {columns.map(([h, render]) => (
                <td key={h} className="max-w-[240px] truncate px-4 py-3 text-frost/90">
                  {render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

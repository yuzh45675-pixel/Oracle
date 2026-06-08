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

function activityKindLabel(kind: string) {
  if (kind === "draw") return "抽牌";
  if (kind === "followup") return "AI追问";
  if (kind === "initial") return "AI解读";
  return kind || "—";
}

function eventKindLabel(kind: string) {
  const map: Record<string, string> = {
    register: "注册",
    login: "登录",
    draw: "抽牌",
    ai_reading: "AI解读",
    ai_followup: "AI追问",
    feedback: "反馈",
  };
  return map[kind] ?? kind;
}

export default function ManagePage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminOverview | null>(null);
  const [tab, setTab] = useState<
    "events" | "readings" | "feedback" | "users" | "orders"
  >("events");

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

  useEffect(() => {
    if (!authed) return;
    const timer = window.setInterval(() => {
      void load();
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [authed, load]);

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
            <h1 className="font-display text-3xl font-light">
              运营总览
              <span className="ml-2 text-[10px] text-muted">v3</span>
            </h1>
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

        {data?.storage === "file" && (
          <p className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            当前数据存在服务器临时硬盘上，重新部署会丢失（例如用户从 9 个变回 7 个）。
            请在 Render 设置 <code className="text-amber-200">DATABASE_URL</code>{" "}
            接入免费 PostgreSQL 后数据才永久保存。
          </p>
        )}

        <p className="mb-6 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-frost/85">
          <span className="text-accent">记录说明：</span>
          「全部操作」记录注册、登录、抽牌、AI 解读、反馈。
          存储：{data?.storage === "postgres" ? "PostgreSQL（永久）" : "临时文件"}。
          每 30 秒自动刷新。
        </p>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["用户", stats?.users],
            ["微信用户", stats?.wechatUsers],
            ["今日操作", stats?.todayEvents],
            ["累计操作", stats?.totalEvents],
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

        <nav className="mb-4 flex flex-wrap gap-2" aria-label="后台数据分类">
          {(
            [
              ["events", "全部操作"],
              ["readings", "活动记录"],
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
          {tab === "events" && (
            <Table
              empty="暂无操作记录"
              rows={data?.eventLog ?? []}
              columns={[
                { header: "时间", render: (r) => fmtTime(r.createdAt) },
                { header: "用户", render: (r) => r.username },
                { header: "操作", render: (r) => eventKindLabel(r.kind) },
                { header: "摘要", render: (r) => r.summary, wrap: true },
                { header: "来源", render: (r) => r.source },
              ]}
            />
          )}
          {tab === "readings" && (
            <Table
              empty="暂无活动（用户抽牌到结果页，或完成 AI 解读后会出现在这里）"
              rows={data?.readings ?? []}
              columns={[
                { header: "时间", render: (r) => fmtTime(r.createdAt) },
                { header: "用户", render: (r) => r.username },
                { header: "类型", render: (r) => activityKindLabel(r.kind) },
                { header: "牌阵", render: (r) => r.spreadTitle ?? "—" },
                { header: "牌面", render: (r) => r.cardNames?.join("、") || "—", wrap: true },
                { header: "问题", render: (r) => r.question ?? "—", wrap: true },
                { header: "计费", render: (r) => r.billing },
              ]}
            />
          )}
          {tab === "feedback" && (
            <FeedbackList items={data?.feedback ?? []} />
          )}
          {tab === "users" && (
            <Table
              empty="暂无用户"
              rows={data?.users ?? []}
              columns={[
                { header: "注册", render: (r) => fmtTime(r.createdAt) },
                { header: "用户名", render: (r) => r.username },
                {
                  header: "登录方式",
                  render: (r) => (r.authProvider === "wechat" ? "微信" : "账号"),
                },
                { header: "额度", render: (r) => String(r.credits) },
                { header: "今日已用", render: (r) => String(r.freeUsedToday) },
              ]}
            />
          )}
          {tab === "orders" && (
            <Table
              empty="暂无订单"
              rows={data?.orders ?? []}
              columns={[
                { header: "时间", render: (r) => fmtTime(r.createdAt) },
                { header: "用户", render: (r) => r.username },
                { header: "金额", render: (r) => `¥${r.amount}` },
                { header: "状态", render: (r) => r.status },
                { header: "渠道", render: (r) => r.channel },
              ]}
            />
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          数据保存在 PostgreSQL（Neon）永久库；刷新页面可拉取最新记录
        </p>
      </div>
    </div>
  );
}

type ColumnDef<T> = {
  header: string;
  render: (row: T) => string;
  wrap?: boolean;
};

function Table<T extends Record<string, unknown>>({
  rows,
  columns,
  empty,
}: {
  rows: T[];
  columns: ColumnDef<T>[];
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
            {columns.map((col) => (
              <th key={col.header} className="px-4 py-3 font-normal">
                {col.header}
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
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={`px-4 py-3 text-frost/90 ${
                    col.wrap
                      ? "max-w-md whitespace-pre-wrap break-words align-top"
                      : "max-w-[200px] truncate"
                  }`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeedbackList({
  items,
}: {
  items: Array<{
    timestamp: string;
    username: string | null;
    accuracy: string;
    price: string;
    spreadTitle: string | null;
    question: string | null;
    dislike: string;
  }>;
}) {
  if (items.length === 0) {
    return <p className="p-8 text-center text-sm text-muted">暂无反馈</p>;
  }
  return (
    <ul className="divide-y divide-white/[0.06]">
      {items.map((fb, i) => (
        <li key={i} className="space-y-3 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span className="text-sm text-frost">{fb.username ?? "匿名"}</span>
            <time>{fmtTime(fb.timestamp)}</time>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-accent">
              {fb.accuracy}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-muted">
              {fb.price}
            </span>
            {fb.spreadTitle && (
              <span className="rounded-full border border-white/10 px-3 py-1 text-muted">
                {fb.spreadTitle}
              </span>
            )}
          </div>
          {fb.question && (
            <p className="text-sm text-frost/80">
              <span className="text-muted">问题：</span>
              {fb.question}
            </p>
          )}
          <div className="rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3">
            <p className="text-[10px] tracking-widest text-muted uppercase">
              用户意见
            </p>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-frost/95">
              {fb.dislike?.trim() ? fb.dislike : "（未填写文字意见）"}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

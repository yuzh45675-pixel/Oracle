import { getApiBase } from "@/lib/api-base";

const STORAGE_KEY = "oracle_admin_key";

export function getAdminKey() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(STORAGE_KEY) ?? "";
}

export function setAdminKey(key: string) {
  sessionStorage.setItem(STORAGE_KEY, key);
}

export function clearAdminKey() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export type AdminOverview = {
  ok: boolean;
  storage?: "postgres" | "file";
  stats: {
    users: number;
    wechatUsers: number;
    paidOrders: number;
    pendingOrders: number;
    feedback: number;
    totalReadings: number;
    todayReadings: number;
    totalEvents?: number;
    todayEvents?: number;
  };
  eventLog?: Array<{
    id: string;
    kind: string;
    username: string;
    summary: string;
    source: string;
    createdAt: string;
  }>;
  readings: Array<{
    id: string;
    username: string;
    deck: string | null;
    spreadTitle: string | null;
    question: string | null;
    cardNames: string[];
    kind: string;
    billing: string;
    source: string;
    filename?: string | null;
    createdAt: string;
  }>;
  feedback: Array<{
    accuracy: string;
    dislike: string;
    price: string;
    username: string | null;
    spreadTitle: string | null;
    question: string | null;
    timestamp: string;
  }>;
  users: Array<{
    id: string;
    username: string;
    authProvider: string;
    credits: number;
    freeUsedToday: number;
    createdAt: string;
  }>;
  orders: Array<{
    id: string;
    username: string;
    amount: number;
    status: string;
    channel: string;
    createdAt: string;
    paidAt: string | null;
  }>;
};

async function adminFetch(path: string, init?: RequestInit) {
  const key = getAdminKey();
  const res = await fetch(`${getApiBase()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": key,
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data === "object" && data && "error" in data
        ? String((data as { error: string }).error)
        : `请求失败 (${res.status})`,
    );
  }
  return data;
}

export async function verifyAdminPassword(password: string) {
  const res = await fetch(`${getApiBase()}/api/admin/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data === "object" && data && "error" in data
        ? String((data as { error: string }).error)
        : "验证失败",
    );
  }
  setAdminKey(password);
  return data as { ok: boolean };
}

export async function fetchAdminOverview() {
  return adminFetch("/api/admin/overview") as Promise<AdminOverview>;
}

export const AUTH_TOKEN_KEY = "oracle_auth_token";

export type AuthUser = {
  id: string;
  username: string;
  credits: number;
  freeAvailable: boolean;
  freeRemaining: number;
  freeUsedToday: number;
  dailyFreeLimit: number;
  betaMode: boolean;
  readingPrice: number;
  today: string;
};

export type RegisterResponse = {
  code: number;
  msg: string;
  token?: string;
  user?: AuthUser;
};

function getApiBase(): string {
  const direct = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (direct) return direct;
  if (typeof window !== "undefined") return "/api-server";
  return "http://127.0.0.1:3002";
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function authHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers as Record<string, string>),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "msg" in data
        ? String((data as { msg: string }).msg)
        : typeof data === "object" && data && "error" in data
          ? String((data as { error: string }).error)
          : res.statusText;
    const err = new Error(msg || `请求失败 (${res.status})`);
    (err as Error & { status?: number }).status = res.status;
    (err as Error & { payload?: unknown }).payload = data;
    throw err;
  }
  return data as T;
}

/** 注册接口：按 code 判断成败，不抛异常 */
export async function registerUser(
  username: string,
  password: string,
): Promise<RegisterResponse> {
  let res: Response;
  try {
    res = await fetch(`${getApiBase()}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    return {
      code: -1,
      msg: "无法连接后端，请先运行 npm run server（端口 3002）",
    };
  }

  const data = (await res.json().catch(() => null)) as
    | RegisterResponse
    | { error?: string }
    | null;

  if (res.status === 404) {
    return {
      code: -1,
      msg: "后端未提供注册接口（多半是旧进程占用了 3002 端口）。请关掉旧终端里的 node，再重新运行 npm run server",
    };
  }

  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "msg" in data
        ? String((data as RegisterResponse).msg)
        : data && typeof data === "object" && "error" in data
          ? String((data as { error: string }).error)
          : `请求失败 (${res.status})`;
    return { code: -1, msg };
  }

  if (data && typeof data === "object" && "code" in data) {
    return data as RegisterResponse;
  }

  return { code: -1, msg: "服务器返回格式异常，请重启 npm run server 后重试" };
}

export async function loginUser(username: string, password: string) {
  return apiFetch<{ ok: boolean; token: string; user: AuthUser }>("/api/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function fetchMe() {
  return apiFetch<{ ok: boolean; user: AuthUser }>("/api/me");
}

export async function fetchQuota() {
  return apiFetch<AuthUser & { ok: boolean }>("/api/quota");
}

export async function betaUnlockReading() {
  return apiFetch<{
    ok: boolean;
    betaMode: boolean;
    message: string;
    user: AuthUser;
  }>("/api/payment/beta-unlock", { method: "POST", body: "{}" });
}

export async function createPayment() {
  return apiFetch<{
    ok: boolean;
    orderId: string;
    amount: number;
    payUrl?: string;
    devMode?: boolean;
    message?: string;
  }>("/api/payment/create", { method: "POST", body: "{}" });
}

export async function devCompletePayment(orderId: string) {
  return apiFetch<{ ok: boolean; user: AuthUser }>("/api/payment/dev-complete", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}

export async function fetchPaymentStatus(orderId: string) {
  return apiFetch<{
    ok: boolean;
    orderId: string;
    status: string;
    user: AuthUser;
  }>(`/api/payment/status/${orderId}`);
}

import { getApiBase } from "@/lib/api-base";

/** 免费 Render 冷启动可能 30–90s；首次请求给足时间 */
const DEFAULT_TIMEOUT_MS = 75_000;
const RETRY_TIMEOUT_MS = 90_000;

export const API_COLD_START_HINT =
  "后端正在唤醒（免费服务器冷启动约 1 分钟），请稍候再试…";

export class ApiNetworkError extends Error {
  readonly retryable: boolean;

  constructor(message: string, retryable = true) {
    super(message);
    this.name = "ApiNetworkError";
    this.retryable = retryable;
  }
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException && error.name === "AbortError"
  );
}

export async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (isAbortError(error)) {
      throw new ApiNetworkError(
        `${API_COLD_START_HINT} 若仍失败，请刷新页面后重试。`,
      );
    }
    throw new ApiNetworkError(
      "无法连接后端，请检查网络或稍后再试（免费 API 冷启动约 1 分钟）",
    );
  } finally {
    clearTimeout(timer);
  }
}

/** 后台 ping，提前唤醒 Render，不阻塞 UI */
export function pingApiHealth(): void {
  if (typeof window === "undefined") return;
  void fetchWithTimeout(`${getApiBase()}/api/health`, { method: "GET" }, 20_000).catch(
    () => {
      /* 唤醒失败可忽略 */
    },
  );
}

export async function fetchApiWithRetry(
  path: string,
  init?: RequestInit,
  options?: { timeoutMs?: number; retry?: boolean },
): Promise<Response> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retry = options?.retry ?? true;
  const url = `${getApiBase()}${path}`;
  try {
    return await fetchWithTimeout(url, init, timeoutMs);
  } catch (error) {
    if (retry && error instanceof ApiNetworkError && error.retryable) {
      return fetchWithTimeout(url, init, RETRY_TIMEOUT_MS);
    }
    throw error;
  }
}

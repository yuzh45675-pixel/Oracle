export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

import { authHeaders } from "@/lib/auth-client";
import { fetchApiWithRetry } from "@/lib/api-fetch";

export type ChatResponse = {
  reply: string;
  user?: import("@/lib/auth-client").AuthUser;
  billing?: { type: "free" | "credit" };
};

export async function fetchChatHealth(): Promise<{
  ok: boolean;
  hasApiKey?: boolean;
}> {
  const res = await fetchApiWithRetry("/api/health", { method: "GET" });
  if (!res.ok) throw new Error("AI 服务未启动");
  const data = (await res.json()) as { ok?: boolean; hasApiKey?: boolean };
  if (data.hasApiKey === false) {
    throw new Error("Missing DEEPSEEK_API_KEY");
  }
  return { ok: Boolean(data.ok), hasApiKey: data.hasApiKey };
}

export async function sendChatRequest(options: {
  message?: string;
  messages?: ChatMessage[];
}): Promise<ChatResponse> {
  const res = await fetchApiWithRetry("/api/chat", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(options),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "error" in data
        ? String((data as { error: string }).error)
        : res.statusText;
    const err = new Error(msg || `请求失败 (${res.status})`);
    if (typeof data === "object" && data && "code" in data) {
      (err as Error & { code?: string }).code = String(
        (data as { code: string }).code,
      );
    }
    (err as Error & { status?: number }).status = res.status;
    (err as Error & { payload?: unknown }).payload = data;
    throw err;
  }

  return data as ChatResponse;
}

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

import { getApiBase as getChatApiBase } from "@/lib/api-base";
import { authHeaders } from "@/lib/auth-client";

export { getChatApiBase };

export type ChatResponse = {
  reply: string;
  user?: import("@/lib/auth-client").AuthUser;
  billing?: { type: "free" | "credit" };
};

export async function fetchChatHealth(): Promise<{ ok: boolean; hasApiKey: boolean }> {
  const res = await fetch(`${getChatApiBase()}/api/health`);
  if (!res.ok) throw new Error("AI 服务未启动");
  return res.json();
}

export async function sendChatRequest(options: {
  message?: string;
  messages?: ChatMessage[];
}): Promise<ChatResponse> {
  const res = await fetch(`${getChatApiBase()}/api/chat`, {
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

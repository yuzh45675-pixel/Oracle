/** 反馈 API 基址：与 auth-client 一致，开发时走 Next 代理 /api-server */

function getApiBase(): string {
  const direct = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (direct) return direct;
  if (typeof window !== "undefined") return "/api-server";
  return "http://127.0.0.1:3002";
}

export type FeedbackPayload = {
  accuracy: string;
  dislike: string;
  price: string;
};

export type FeedbackResponse = {
  code: number;
  msg: string;
};

/** 提交内测问卷到 POST /api/feedback */
export async function submitFeedback(
  payload: FeedbackPayload,
): Promise<FeedbackResponse> {
  let res: Response;
  try {
    res = await fetch(`${getApiBase()}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("NETWORK");
  }

  const data = (await res.json().catch(() => ({
    code: -1,
    msg: "响应解析失败",
  }))) as FeedbackResponse & { error?: string };

  if (res.status === 404) {
    return {
      code: -1,
      msg: "后端未更新，请关闭旧终端后重新运行 npm run server",
    };
  }

  if (!res.ok && typeof data.code !== "number") {
    throw new Error("NETWORK");
  }

  return data;
}

import { getApiBase } from "@/lib/api-base";

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

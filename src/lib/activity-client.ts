import { authHeaders } from "@/lib/auth-client";
import { getApiBase } from "@/lib/api-base";

export type DrawActivityPayload = {
  sessionId: string;
  deck?: string;
  spreadTitle?: string;
  question?: string;
  cardNames?: string[];
  source?: string;
};

export type ExportImageActivityPayload = {
  sessionId?: string;
  deck?: string;
  spreadTitle?: string;
  question?: string;
  cardNames?: string[];
  filename?: string;
  source?: string;
};

/** 保存解读长图记入后台（失败静默） */
export async function logExportImageActivity(
  payload: ExportImageActivityPayload,
): Promise<void> {
  try {
    await fetch(`${getApiBase()}/api/activity/export-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });
  } catch {
    /* 记录失败不影响保存 */
  }
}

/** 抽牌完成记入后台（失败静默，不打扰用户） */
export async function logDrawActivity(payload: DrawActivityPayload): Promise<void> {
  try {
    await fetch(`${getApiBase()}/api/activity/draw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });
  } catch {
    /* 记录失败不影响占卜流程 */
  }
}

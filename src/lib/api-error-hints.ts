/** 解析 API 错误，区分内测登录失效 / 缺密钥 / 网络问题 */

export type ApiErrorHint =
  | "auth_stale"
  | "missing_api_key"
  | "network"
  | "local_dev"
  | "generic";

export function classifyApiError(message: string, status?: number): ApiErrorHint {
  const m = message.toLowerCase();
  if (
    status === 401 ||
    message.includes("用户不存在") ||
    message.includes("已失效") ||
    message.includes("登录已过期") ||
    message.includes("请先登录")
  ) {
    return "auth_stale";
  }
  if (
    message.includes("DEEPSEEK") ||
    message.includes("Missing DEEPSEEK") ||
    m.includes("api key")
  ) {
    return missingApiKeyHint();
  }
  if (
    message.includes("无法连接") ||
    message.includes("冷启动") ||
    message.includes("AI 服务未启动")
  ) {
    return "network";
  }
  return "generic";
}

function missingApiKeyHint(): ApiErrorHint {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return "local_dev";
  }
  return "missing_api_key";
}

export function apiErrorFootnote(hint: ApiErrorHint): string | null {
  switch (hint) {
    case "auth_stale":
      return "内测后端重启或重新部署后，旧账号会清空。请退出后重新注册或登录，再试 AI 解读。";
    case "missing_api_key":
      return "线上 API 未配置 DeepSeek 密钥。请在 Render → oracle-api → Environment 添加 DEEPSEEK_API_KEY 后重新部署。";
    case "local_dev":
      return "本地开发请先运行 npm run server，并在项目根目录 .env 中设置 DEEPSEEK_API_KEY。";
    case "network":
      return "免费服务器可能正在唤醒，等待约 1 分钟后刷新重试。";
    default:
      return null;
  }
}

export function isAuthStaleError(message: string, status?: number): boolean {
  return classifyApiError(message, status) === "auth_stale";
}

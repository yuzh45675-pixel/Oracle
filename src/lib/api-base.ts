/**
 * Browser always uses same-origin /api-server (Vercel rewrite → Render).
 * Avoids CORS and direct calls to onrender.com from mobile networks in CN.
 */
export function getApiBase(): string {
  if (typeof window !== "undefined") return "/api-server";

  const direct =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    process.env.API_ORIGIN?.replace(/\/$/, "");
  if (direct) return direct;
  return "http://127.0.0.1:3002";
}

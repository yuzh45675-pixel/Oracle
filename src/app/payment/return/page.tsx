"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchPaymentStatus } from "@/lib/auth-client";
import { useAuth } from "@/context/AuthContext";
import { ReadingLayout } from "@/components/tarot/ReadingLayout";

function PaymentReturnContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<"pending" | "paid" | "error">("pending");

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      return;
    }
    let cancelled = false;
    const poll = async () => {
      for (let i = 0; i < 20 && !cancelled; i++) {
        try {
          const res = await fetchPaymentStatus(orderId);
          if (res.status === "paid") {
            await refreshUser();
            setStatus("paid");
            return;
          }
        } catch {
          /* retry */
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      if (!cancelled) setStatus("error");
    };
    void poll();
    return () => {
      cancelled = true;
    };
  }, [orderId, refreshUser]);

  return (
    <ReadingLayout title="支付结果" subtitle="支付宝返回">
      <div className="mx-auto max-w-md text-center">
        {status === "pending" && (
          <p className="text-muted">正在确认支付结果…</p>
        )}
        {status === "paid" && (
          <>
            <p className="text-frost">支付成功，已增加 1 次 AI 解读额度。</p>
            <Link
              href="/reading"
              className="mt-6 inline-block text-sm text-accent underline"
            >
              返回占卜
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-muted">
              暂未确认到支付成功。若已扣款，请稍后刷新或联系支持。
            </p>
            <Link
              href="/reading"
              className="mt-6 inline-block text-sm text-accent underline"
            >
              返回占卜
            </Link>
          </>
        )}
      </div>
    </ReadingLayout>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={null}>
      <PaymentReturnContent />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitFeedback } from "@/lib/feedback-client";

/** 问题 1：解读准确度 */
const ACCURACY_OPTIONS = ["很准", "还行", "不准"] as const;

/** 问题 3：付费意愿 */
const PRICE_OPTIONS = ["不愿意", "接受一次0.2元的付费制度"] as const;

type FieldErrors = {
  accuracy?: string;
  dislike?: string;
  price?: string;
};

/**
 * 内测反馈问卷：展示在解读结果页底部。
 * 提交成功后隐藏表单，显示感谢文案 2 秒后消失；每次进入结果页可重新填写。
 */
export function BetaFeedbackSurvey() {
  const [accuracy, setAccuracy] = useState("");
  const [dislike, setDislike] = useState("");
  const [price, setPrice] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [thankYou, setThankYou] = useState(false);

  /** 前端校验：必选项 + 选填文本 20～200 字 */
  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!accuracy) next.accuracy = "请选择一项";
    if (!price) next.price = "请选择一项";
    const trimmed = dislike.trim();
    if (trimmed && (trimmed.length < 20 || trimmed.length > 200)) {
      next.dislike = "选填；若填写需 20～200 字";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setBusy(true);
    try {
      const res = await submitFeedback({
        accuracy,
        dislike: dislike.trim(),
        price,
      });

      if (res.code === 0) {
        // 隐藏问卷，显示感谢语，2 秒后感谢语也消失
        setHidden(true);
        setThankYou(true);
        window.setTimeout(() => setThankYou(false), 2000);
        return;
      }

      setSubmitError(res.msg || "提交失败，请稍后再试");
    } catch {
      setSubmitError("提交失败，请稍后再试");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-10 border-t border-white/[0.1] pt-10">
      <p className="text-[10px] tracking-[0.3em] text-accent uppercase">
        内测反馈
      </p>
      <h2 className="mt-1 font-display text-lg text-frost">帮助我们做得更好</h2>
      <p className="mt-1 text-xs text-muted">
        你的意见仅用于内测改进，每次占卜后都可以填写。
      </p>

      {/* 提交失败：红色提示 */}
      {submitError && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-2 text-sm text-red-300"
        >
          {submitError}
        </p>
      )}

      <AnimatePresence mode="wait">
        {thankYou && (
          <motion.p
            key="thanks"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 text-center text-sm font-medium text-emerald-400"
          >
            感谢你的反馈！
          </motion.p>
        )}
      </AnimatePresence>

      {!hidden && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="mt-6 space-y-8"
          noValidate
        >
          {/* 问题 1：单选 */}
          <fieldset>
            <legend className="mb-3 text-sm text-frost">
              1. 你觉得这次解读准吗？
            </legend>
            <motion.div className="flex flex-wrap gap-3">
              {ACCURACY_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`cursor-pointer rounded-xl border px-4 py-2 text-sm transition ${
                    accuracy === opt
                      ? "border-accent/50 bg-accent/15 text-frost"
                      : "border-white/[0.08] bg-white/[0.03] text-muted hover:border-accent/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="accuracy"
                    value={opt}
                    checked={accuracy === opt}
                    onChange={() => {
                      setAccuracy(opt);
                      setFieldErrors((prev) => ({ ...prev, accuracy: undefined }));
                    }}
                    className="sr-only"
                  />
                  {opt}
                </label>
              ))}
            </motion.div>
            {fieldErrors.accuracy && (
              <p className="mt-2 text-xs text-red-400">{fieldErrors.accuracy}</p>
            )}
          </fieldset>

          {/* 问题 2：选填文本框 */}
          <div>
            <label
              htmlFor="feedback-dislike"
              className="mb-3 block text-sm text-frost"
            >
              2. 哪里让你感觉不爽或不够好？
              <span className="ml-1 text-xs text-muted">（选填，20～200 字）</span>
            </label>
            <textarea
              id="feedback-dislike"
              value={dislike}
              onChange={(e) => {
                setDislike(e.target.value.slice(0, 200));
                setFieldErrors((prev) => ({ ...prev, dislike: undefined }));
              }}
              rows={4}
              maxLength={200}
              placeholder="例如：解读太笼统、和牌面联系不够紧…"
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-frost outline-none transition placeholder:text-muted/50 focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
            />
            <p className="mt-1 text-right text-xs text-muted">
              {dislike.trim().length}/200
            </p>
            {fieldErrors.dislike && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.dislike}</p>
            )}
          </div>

          {/* 问题 3：单选 */}
          <fieldset>
            <legend className="mb-3 text-sm text-frost">
              3. 如果以后收费，你愿意付多少钱？
            </legend>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {PRICE_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`cursor-pointer rounded-xl border px-4 py-2.5 text-sm transition ${
                    price === opt
                      ? "border-accent/50 bg-accent/15 text-frost"
                      : "border-white/[0.08] bg-white/[0.03] text-muted hover:border-accent/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="price"
                    value={opt}
                    checked={price === opt}
                    onChange={() => {
                      setPrice(opt);
                      setFieldErrors((prev) => ({ ...prev, price: undefined }));
                    }}
                    className="sr-only"
                  />
                  {opt}
                </label>
              ))}
            </div>
            {fieldErrors.price && (
              <p className="mt-2 text-xs text-red-400">{fieldErrors.price}</p>
            )}
          </fieldset>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl border border-accent/40 bg-accent/20 py-3 text-sm font-medium text-frost transition hover:border-accent/60 hover:bg-accent/30 disabled:opacity-50 sm:w-auto sm:px-10"
          >
            {busy ? "提交中…" : "提交反馈"}
          </button>
        </form>
      )}
    </section>
  );
}

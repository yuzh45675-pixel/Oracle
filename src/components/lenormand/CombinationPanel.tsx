"use client";

import { motion } from "framer-motion";
import type { LenormandCombination } from "@/types/lenormand";

interface CombinationPanelProps {
  combinations: LenormandCombination[];
  jumpSummary?: string;
}

export function CombinationPanel({
  combinations,
  jumpSummary,
}: CombinationPanelProps) {
  if (combinations.length === 0 && !jumpSummary) return null;

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {jumpSummary && (
        <article className="rounded-2xl border border-accent/20 bg-accent/5 p-6 backdrop-blur-xl">
          <p className="text-xs tracking-widest text-accent uppercase">掉牌</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{jumpSummary}</p>
        </article>
      )}

      <p className="text-[10px] tracking-widest text-muted uppercase">组合解读</p>

      {combinations.map((c, i) => (
        <motion.article
          key={`${c.kind}-${c.title}-${i}`}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <p className="text-xs text-accent/80">
            {c.kind === "pair"
              ? "双牌组合"
              : c.kind === "triple"
                ? "三牌关系"
                : c.kind === "adjacent"
                  ? "邻位影响"
                  : "牌义"}
          </p>
          <h3 className="mt-1 font-display text-lg font-light text-frost">
            {c.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{c.summary}</p>
        </motion.article>
      ))}
    </motion.div>
  );
}

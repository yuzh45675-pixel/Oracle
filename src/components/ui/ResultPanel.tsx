"use client";

import { motion } from "framer-motion";
import { getMeaning } from "@/lib/tarot";
import type { DrawnCard } from "@/types/tarot";

interface ResultPanelProps {
  drawn: DrawnCard;
  index: number;
}

export function ResultPanel({ drawn, index }: ResultPanelProps) {
  const { card, reversed, position } = drawn;
  const meaning = getMeaning(card, reversed);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        delay: index * 0.15,
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl md:p-8 lg:p-10"
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {position && (
          <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs tracking-widest text-accent uppercase">
            {position}
          </span>
        )}
        {card.system === "waite" && (
          <span
            className={`rounded-full px-3 py-1 text-xs tracking-widest uppercase ${
              reversed
                ? "border border-white/10 bg-white/5 text-muted"
                : "border border-accent/20 bg-accent/10 text-frost"
            }`}
          >
            {reversed ? "逆位" : "正位"}
          </span>
        )}
      </div>

      <h3 className="font-display text-2xl font-light tracking-tight text-frost md:text-3xl lg:text-[2rem]">
        {card.name}
        <span className="ml-2 text-base text-muted font-sans">{card.nameEn}</span>
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-muted lg:text-base">{card.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {card.keywords.map((kw) => (
          <span
            key={kw}
            className="rounded-md bg-white/[0.04] px-2.5 py-1 text-xs text-metal"
          >
            {kw}
          </span>
        ))}
      </div>

      <motion.div
        className="mt-6 space-y-3 border-t border-white/[0.06] pt-6"
        initial={false}
      >
        <p className="text-lg font-light leading-relaxed text-frost lg:text-xl">
          {meaning.summary}
        </p>
        <p className="text-sm leading-relaxed text-muted lg:text-base">{meaning.detail}</p>
      </motion.div>
    </motion.article>
  );
}

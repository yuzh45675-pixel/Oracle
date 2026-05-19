"use client";

import { motion } from "framer-motion";
import { ReadingLayout } from "@/components/tarot/ReadingLayout";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

const principles = [
  {
    title: "克制",
    body: "拒绝廉价玄幻与过度特效。神秘感应来自留白、节奏与光影，而非喧嚣的视觉堆砌。",
  },
  {
    title: "沉浸",
    body: "粒子、雾气与缓慢动效共同构建宇宙氛围。每一次交互都应当如呼吸般自然。",
  },
  {
    title: "质感",
    body: "卡牌如同高级收藏展品——金属光泽、玻璃拟态、电影级景深，致敬 Apple 与 A24 的美学语言。",
  },
];

export default function AboutPage() {
  return (
    <ReadingLayout
      title="关于 Oracle"
      subtitle="一款具有神秘氛围的高端数字产品，而非传统算命网站。"
    >
      <motion.div
        className="mx-auto max-w-2xl space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-center text-sm leading-relaxed text-muted">
          Oracle 以现代设计语言重新诠释古老的塔罗仪式。我们使用本地牌库与固定文案解读，不依赖 AI，让每一次占卜都是纯粹、私密的个人体验。
        </p>

        <motion.div className="grid gap-4 md:gap-6">
          {principles.map((p, i) => (
            <motion.article
              key={p.title}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <h3 className="font-display text-xl font-light text-frost">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          className="flex justify-center pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <AnimatedButton href="/reading">开始体验</AnimatedButton>
        </motion.div>
      </motion.div>
    </ReadingLayout>
  );
}

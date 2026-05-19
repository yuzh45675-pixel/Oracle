"use client";

import { motion } from "framer-motion";
import { ReadingLayout } from "@/components/tarot/ReadingLayout";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

const sections = [
  {
    title: "双体系牌阵",
    body: "支持维特塔罗与雷诺曼两套经典体系。从单张指引到大桌阵，牌义与组合逻辑内置于本地牌库，抽牌、翻牌与牌位关系一目了然。",
  },
  {
    title: "仪式化体验",
    body: "洗牌、切牌、逐张揭示——流程贴近真实占卜桌。粒子与光影营造沉静氛围，让注意力自然落在当下与问题上。",
  },
  {
    title: "神谕解读",
    body: "完成牌阵后，可请 DeepSeek 神谕结合你的提问与牌面做深度解读；追问时亦可选择补牌仪式，再将新牌纳入分析。解读风格专业、温和，侧重看见状态与行动方向。",
  },
  {
    title: "设计原则",
    body: "克制而不堆砌玄幻符号，质感接近收藏级卡牌呈现。我们相信神秘感应来自留白、节奏与专注，而非喧嚣的视觉表演。",
  },
];

export default function AboutPage() {
  return (
    <ReadingLayout
      title="关于 Oracle"
      subtitle="现代设计语言下的塔罗与雷诺曼占卜空间。"
    >
      <motion.div
        className="mx-auto max-w-2xl space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="space-y-4 text-center text-sm leading-relaxed text-muted">
          <p>
            Oracle 将古老牌阵仪式带入数字空间：你先完成抽牌与牌面阅读，再按需开启神谕层，把牌义、位置与你的问题编织成可理解的叙事。
          </p>
          <p>
            占卜记录保存在本地浏览器，仪式与解读皆在你自己的设备上进行，安静、私密，可随时回顾。
          </p>
        </div>

        <motion.div className="grid gap-4 md:gap-6">
          {sections.map((s, i) => (
            <motion.article
              key={s.title}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <h3 className="font-display text-xl font-light text-frost">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          className="flex justify-center pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
        >
          <AnimatedButton href="/reading">开始体验</AnimatedButton>
        </motion.div>
      </motion.div>
    </ReadingLayout>
  );
}

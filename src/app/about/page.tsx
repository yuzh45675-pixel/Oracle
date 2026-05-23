"use client";

import { motion } from "framer-motion";
import { ReadingLayout } from "@/components/tarot/ReadingLayout";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useTheme } from "@/context/ThemeContext";

const sections = [
  {
    title: "呼吸",
    body: "导航里的「呼吸」是一条独立路径，不进入占卜流程。选一种节奏——4-7-8、盒式、深度、月光、能量或平衡——粒子会随吸气聚拢、随呼气散开，屏幕只提示「吸气 / 停留 / 呼气」。占卜前想先静下来，或单纯需要几分钟放空，都可以来这里；练完也可直接离开，与抽牌无关。",
  },
  {
    title: "牌阵与抽牌",
    body: "牌阵按真实位置展开，不是简单排成网格。洗牌之后，可上下两行滑动点选，或切换为选堆切牌，再按顺序逐张翻开。",
  },
  {
    title: "仪式与氛围",
    body: "粒子随指尖流动，长按可凝聚图案；四套意识色调切换整站气质。洗牌、选牌、揭示各自成一段节奏——克制的光影与不喧嚣的动效，让注意力留在问题与牌面上。",
  },
  {
    title: "神谕 · 私密",
    body: "牌面读完后，可登录请 AI 像真人咨询师一样解读——先感受整副牌，而非机械报牌义；支持追问与补牌。占卜记录保存在本机浏览器，头像与账号仅用于解读额度，安静、私密。",
  },
];

export default function AboutPage() {
  const { theme } = useTheme();

  return (
    <ReadingLayout title="关于 Oracle" badge="About" wide>
      <motion.div
        className="mx-auto w-full max-w-md lg:max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <motion.blockquote
          className="mb-10 border-l-2 border-accent/35 pl-5 text-left"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <p className="text-sm leading-relaxed tracking-wide md:text-base">
            <span
              className="inline-block"
              style={{ color: theme.colors.accentSoft }}
            >
              我们相信神秘感应来自留白、节奏与专注，而非喧嚣的视觉表演。
            </span>
          </p>
        </motion.blockquote>

        <ol className="space-y-0 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
          {sections.map((s, i) => (
            <motion.li
              key={s.title}
              className="px-5 py-6 sm:px-6 sm:py-7"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.07 }}
            >
              <div className="flex items-baseline gap-3">
                <span
                  className="shrink-0 font-display text-xs tabular-nums tracking-widest text-accent/55"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-lg font-light tracking-tight text-frost">
                  {s.title}
                </h3>
              </div>
              <p className="mt-3 pl-7 text-[13px] leading-[1.8] text-muted sm:text-sm lg:pl-8 lg:text-base lg:leading-relaxed">
                {s.body}
              </p>
            </motion.li>
          ))}
        </ol>

        <motion.div
          className="mt-10 flex flex-col gap-3 border-t border-white/[0.06] pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.78 }}
        >
          <AnimatedButton href="/breathe" className="w-full">
            先去呼吸
          </AnimatedButton>
          <AnimatedButton href="/" variant="ghost" className="w-full">
            回到入口
          </AnimatedButton>
        </motion.div>
      </motion.div>
    </ReadingLayout>
  );
}

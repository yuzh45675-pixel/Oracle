"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ReadingLayout } from "@/components/tarot/ReadingLayout";

/** 与 scripts/generate-qrcode.mjs 默认地址一致；换域名后重新 npm run qrcode */
const SITE_URL = "https://oracle-tarot-xi.vercel.app";

export default function SharePage() {
  return (
    <ReadingLayout
      title="扫码访问"
      subtitle="保存或分享二维码，手机扫一扫即可打开 Oracle"
      badge="Share"
    >
      <motion.div
        className="mx-auto flex w-full max-w-sm flex-col items-center lg:max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
          <Image
            src="/share/oracle-qrcode-sm.png"
            alt="Oracle 网站二维码"
            width={512}
            height={512}
            className="mx-auto h-auto w-full max-w-[280px] rounded-xl"
            priority
          />
        </div>

        <p className="mt-6 break-all text-center text-sm text-muted">{SITE_URL}</p>

        <a
          href="/share/oracle-qrcode.png"
          download="oracle-qrcode.png"
          className="mt-6 rounded-full border border-accent/40 bg-accent/15 px-6 py-2.5 text-sm text-frost transition hover:bg-accent/25"
        >
          下载高清二维码（1024px）
        </a>

        <p className="mt-8 max-w-xs text-center text-xs leading-relaxed text-muted/80">
          可用于内测邀请、海报或朋友圈。域名更换后联系维护者重新生成即可。
        </p>
      </motion.div>
    </ReadingLayout>
  );
}

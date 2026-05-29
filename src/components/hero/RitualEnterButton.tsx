"use client";

import { useRouter } from "next/navigation";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import type { ReadingSystemChoice } from "./ReadingSystemSelector";

interface RitualEnterButtonProps {
  system: ReadingSystemChoice;
  disabled?: boolean;
}

export function RitualEnterButton({
  system,
  disabled = false,
}: RitualEnterButtonProps) {
  const router = useRouter();

  const deckParam = system === "lenormand" ? "lenormand" : "waite";
  const startHref = `/reading?deck=${deckParam}`;
  const readingHref = `/reading?deck=${deckParam}&mode=free`;

  return (
    <>
      <AnimatedButton onClick={() => router.push(startHref)} disabled={disabled}>
        开始占卜
      </AnimatedButton>
      <AnimatedButton
        onClick={() => router.push(readingHref)}
        disabled={disabled}
        variant="ghost"
      >
        牌面解读
      </AnimatedButton>
    </>
  );
}

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

  const href =
    system === "lenormand" ? "/reading?deck=lenormand" : "/reading?deck=waite";

  return (
    <AnimatedButton
      onClick={() => router.push(href)}
      disabled={disabled}
    >
      开始占卜
    </AnimatedButton>
  );
}
